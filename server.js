import "dotenv/config";

import express from "express";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const projectDirectory = path.dirname(currentFilePath);
const productFilePath = path.join(projectDirectory, "data", "products.json");
const productData = JSON.parse(await readFile(productFilePath, "utf8"));
const products = productData.products;
const activeSignatureDocuments = new Map();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

// 정적 파일을 하나씩 지정해 .env와 서버 파일이 외부에 노출되지 않게 합니다.
app.get("/", (_request, response) => {
  response.sendFile(path.join(projectDirectory, "index.html"));
});

app.get("/styles.css", (_request, response) => {
  response.sendFile(path.join(projectDirectory, "styles.css"));
});

app.get("/script.js", (_request, response) => {
  response.sendFile(path.join(projectDirectory, "script.js"));
});

app.get("/data/products.json", (_request, response) => {
  response.sendFile(productFilePath);
});

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    solarConfigured: Boolean(process.env.UPSTAGE_API_KEY?.trim()),
    productCount: products.length,
  });
});

app.post("/api/signature/start", async (request, response) => {
  try {
    const booking = normalizeBooking(request.body);
    const document = await createModusignDocument(booking);
    const readyDocument = await waitForModusignDocument(document.id);
    const participant =
      readyDocument.participants?.find((item) => item.name === booking.name) ??
      document.participants?.[0];

    if (!participant?.id) throw new Error("서명 참여자 정보를 찾지 못했습니다.");

    const signing = await requestModusign(
      `/documents/${document.id}/participants/${participant.id}/embedded-view`,
    );
    activeSignatureDocuments.set(document.id, {
      name: booking.name,
      email: booking.email,
      forwarded: false,
    });
    response.json({ documentId: document.id, embeddedUrl: signing.embeddedUrl });
  } catch (error) {
    response.status(502).json({ message: error.message || "전자서명 요청에 실패했습니다." });
  }
});

app.get("/api/signature/status", async (request, response) => {
  const documentId = cleanText(request.query.documentId, 100);
  const signatureDocument = activeSignatureDocuments.get(documentId);

  if (!documentId || !signatureDocument) {
    response.status(404).json({ message: "확인할 전자서명 요청이 없습니다." });
    return;
  }

  try {
    const document = await requestModusign(`/documents/${documentId}`);
    let forwarded = signatureDocument.forwarded;
    let forwardError = "";

    if (document.status === "COMPLETED" && !signatureDocument.forwarded) {
      try {
        await forwardCompletedDocument(documentId, signatureDocument);
        signatureDocument.forwarded = true;
        forwarded = true;
      } catch (error) {
        forwardError = error.message || "완료 문서를 전달하지 못했습니다.";
      }
    }

    response.json({ status: document.status, forwarded, forwardError });
  } catch (error) {
    response.status(502).json({ message: error.message || "서명 상태를 확인하지 못했습니다." });
  }
});

app.post("/api/recommendations", async (request, response) => {
  try {
    const profile = normalizeProfile(request.body);
    const candidates = selectCandidates(profile);

    if (candidates.length === 0) {
      response.status(422).json({
        message: "조건에 맞는 상품이 없습니다. 예산이나 지역 조건을 조금 넓혀주세요.",
        recommendations: [],
      });
      return;
    }

    const solarRecommendations = await requestSolarRecommendations(
      profile,
      candidates,
    );

    response.json({
      mode: solarRecommendations ? "solar" : "local",
      message: solarRecommendations
        ? "Solar가 취향과 예산을 바탕으로 추천 이유를 작성했습니다."
        : "상품 점수를 기준으로 추천했습니다. Solar 연결 상태를 확인해주세요.",
      recommendations:
        solarRecommendations ?? createLocalRecommendations(profile, candidates),
    });
  } catch (error) {
    console.error("추천 처리 오류:", error.message);
    response.status(400).json({
      message: error.message || "추천 요청을 처리하지 못했습니다.",
      recommendations: [],
    });
  }
});

function normalizeProfile(input = {}) {
  const allowedExperienceLevels = ["beginner", "intermediate", "advanced"];
  const budget = Number(input.budget);
  const age = Number(input.age);

  if (!Number.isFinite(budget) || budget < 10000 || budget > 500000) {
    throw new Error("예산을 1만원에서 50만원 사이로 입력해주세요.");
  }

  if (!Number.isFinite(age) || age < 5 || age > 100) {
    throw new Error("이용자 나이를 5세에서 100세 사이로 입력해주세요.");
  }

  return {
    budget,
    age,
    region: cleanText(input.region, 20),
    category: cleanText(input.category, 20),
    experienceLevel: allowedExperienceLevels.includes(input.experienceLevel)
      ? input.experienceLevel
      : "beginner",
    canSwim: input.canSwim === true,
    companion: cleanText(input.companion, 20),
    mood: cleanText(input.mood, 20),
  };
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeBooking(input = {}) {
  const booking = {
    name: cleanText(input.name, 30), email: cleanText(input.email, 100),
    activity: cleanText(input.activity, 120), venue: cleanText(input.venue, 100),
    date: cleanText(input.date, 20), people: cleanText(input.people, 10),
  };
  if (!booking.name || !booking.email || !booking.activity || !booking.date) {
    throw new Error("예약자 정보와 이용 날짜를 확인해 주세요.");
  }
  return booking;
}

function modusignAuthorization() {
  const email = process.env.MODUSIGN_EMAIL?.trim();
  const apiKey = process.env.MODUSIGN_API_KEY?.trim();
  if (!email || !apiKey || !process.env.MODUSIGN_TEMPLATE_ID?.trim()) {
    throw new Error(".env에 모두싸인 이메일, API 키, 템플릿 ID를 입력해 주세요.");
  }
  return `Basic ${Buffer.from(`${email}:${apiKey}`).toString("base64")}`;
}

async function requestModusign(pathname, options = {}) {
  const headers = {
    Accept: "application/json",
    Authorization: modusignAuthorization(),
    ...(options.headers ?? {}),
  };
  const apiResponse = await fetch(`https://api.modusign.co.kr${pathname}`, {
    ...options,
    headers,
  });
  const result = await apiResponse.json().catch(() => ({}));
  if (!apiResponse.ok) throw new Error(result.message || `모두싸인 요청 오류 (${apiResponse.status})`);
  return result;
}

async function forwardCompletedDocument(documentId, signatureDocument) {
  return requestModusign(`/documents/${documentId}/forward`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      contacts: [signatureDocument.email],
    }),
  });
}

async function createModusignDocument(booking) {
  const templateId = process.env.MODUSIGN_TEMPLATE_ID?.trim();
  if (!templateId) throw new Error(".env에 모두싸인 템플릿 ID를 입력해 주세요.");

  const template = await requestModusign(`/templates/${templateId}`);
  const role = findModusignSignerRole(template);

  return requestModusign("/documents/request-with-template", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      templateId,
      document: {
        title: `${booking.date}_${booking.activity}_${booking.name}`,
        participantMappings: [{ role, name: booking.name, signingMethod: { type: "SECURE_LINK", value: booking.email } }],
      },
    }),
  });
}

function findModusignSignerRole(template) {
  const configuredRole = process.env.MODUSIGN_SIGNER_ROLE?.trim();
  if (configuredRole) return configuredRole;

  const participants = [
    ...(Array.isArray(template.participants) ? template.participants : []),
    ...(Array.isArray(template.signers) ? template.signers : []),
    ...(Array.isArray(template.roles) ? template.roles : []),
  ];

  const participant = participants.find(
    (item) =>
      item?.role ||
      item?.name ||
      item?.label ||
      item?.participantRole ||
      item?.roleName,
  );
  const role =
    participant?.role ??
    participant?.participantRole ??
    participant?.roleName ??
    participant?.name ??
    participant?.label;

  if (typeof role === "string" && role.trim()) return role.trim();

  throw new Error(
    "모두싸인 템플릿의 서명자 역할을 찾지 못했습니다. .env의 MODUSIGN_SIGNER_ROLE에 템플릿 역할 이름을 입력해 주세요.",
  );
}

async function waitForModusignDocument(documentId) {
  for (let attempt = 0; attempt < 15; attempt += 1) {
    const document = await requestModusign(`/documents/${documentId}`);
    if (document.status === "ON_GOING") return document;
    if (["ABORTED", "PROCESSING_FAILED"].includes(document.status)) {
      throw new Error(`계약서를 준비하지 못했습니다. 현재 상태: ${document.status}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 800));
  }
  throw new Error("계약서 준비 시간이 초과됐습니다. 잠시 후 다시 시도해 주세요.");
}

function selectCandidates(profile) {
  const maxDifficulty = {
    beginner: 2,
    intermediate: 4,
    advanced: 5,
  }[profile.experienceLevel];

  return products
    .filter((product) => product.pricePerPerson <= profile.budget)
    .filter((product) => product.minAge <= profile.age)
    .filter(
      (product) => profile.canSwim || product.swimmingRequired === false,
    )
    .filter((product) => product.difficulty <= maxDifficulty)
    .filter(
      (product) => !profile.region || product.region === profile.region,
    )
    .filter(
      (product) => !profile.category || product.category === profile.category,
    )
    .map((product) => {
      const rawScore = calculateScore(product, profile, maxDifficulty);
      return {
        product,
        rawScore,
        score: normalizeScore(rawScore, profile),
      };
    })
    .sort((first, second) => second.rawScore - first.rawScore)
    .slice(0, 5)
    .map(({ product, score }) => ({ product, score }));
}

function calculateScore(product, profile, maxDifficulty) {
  let score = 0;
  const priceRatio = product.pricePerPerson / profile.budget;

  score += Math.max(5, Math.round(25 - Math.abs(0.75 - priceRatio) * 20));
  score += Math.max(0, 12 - Math.abs(maxDifficulty - product.difficulty) * 4);
  score += Math.round(product.rating * 2);

  if (profile.category && product.category === profile.category) score += 35;
  if (profile.region && product.region === profile.region) score += 15;
  if (profile.companion && product.suitableFor.includes(profile.companion)) {
    score += 15;
  }
  if (profile.mood && product.moods.includes(profile.mood)) score += 20;

  return score;
}

function normalizeScore(rawScore, profile) {
  const maximumScore =
    25 +
    12 +
    10 +
    (profile.category ? 35 : 0) +
    (profile.region ? 15 : 0) +
    (profile.companion ? 15 : 0) +
    (profile.mood ? 20 : 0);

  return Math.min(100, Math.round((rawScore / maximumScore) * 100));
}

async function requestSolarRecommendations(profile, candidates) {
  const apiKey = process.env.UPSTAGE_API_KEY?.trim();

  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const apiResponse = await fetch(
      "https://api.upstage.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "solar-pro3",
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                "당신은 부산 해양레저 추천 도우미입니다. 제공된 후보 상품 정보만 사용하고, 확인할 수 없는 사실은 만들지 마세요. 안전 주의사항을 숨기지 마세요.",
            },
            {
              role: "user",
              content: buildSolarPrompt(profile, candidates),
            },
          ],
        }),
        signal: controller.signal,
      },
    );

    if (!apiResponse.ok) {
      throw new Error(`Solar API 응답 오류 (${apiResponse.status})`);
    }

    const apiResult = await apiResponse.json();
    const content = apiResult.choices?.[0]?.message?.content;

    if (!content) throw new Error("Solar 응답에 추천 내용이 없습니다.");

    return parseSolarResponse(content, candidates);
  } catch (error) {
    console.error("Solar 연결 오류:", error.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function buildSolarPrompt(profile, candidates) {
  const candidateData = candidates.map(({ product, score }) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    region: product.region,
    description: product.description,
    pricePerPerson: product.pricePerPerson,
    difficulty: product.difficulty,
    thrillLevel: product.thrillLevel,
    swimmingRequired: product.swimmingRequired,
    suitableFor: product.suitableFor,
    moods: product.moods,
    safetyNotes: product.safetyNotes,
    score,
  }));

  return `
사용자 조건과 후보 상품을 비교해 가장 적합한 상품 3개를 현재 후보 순서대로 추천하세요.

사용자 조건:
${JSON.stringify(profile, null, 2)}

후보 상품:
${JSON.stringify(candidateData, null, 2)}

반드시 아래 JSON 형식만 반환하세요. 마크다운 코드 블록은 사용하지 마세요.
{
  "recommendations": [
    {
      "productId": "후보 상품 ID",
      "reason": "추천 이유를 쉬운 한국어 2문장 이내로 작성",
      "fitPoints": ["사용자와 맞는 점 1", "사용자와 맞는 점 2"],
      "caution": "상품 데이터에 있는 가장 중요한 안전 주의사항"
    }
  ]
}
`;
}

function parseSolarResponse(content, candidates) {
  const cleanedContent = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "");
  const parsedContent = JSON.parse(cleanedContent);
  const candidateMap = new Map(
    candidates.map(({ product, score }) => [product.id, { product, score }]),
  );
  const usedProductIds = new Set();

  const recommendations = (parsedContent.recommendations ?? [])
    .filter((item) => candidateMap.has(item.productId))
    .filter((item) => {
      if (usedProductIds.has(item.productId)) return false;
      usedProductIds.add(item.productId);
      return true;
    })
    .slice(0, 3)
    .map((item) => {
      const candidate = candidateMap.get(item.productId);

      return {
        product: candidate.product,
        score: candidate.score,
        reason: cleanText(item.reason, 240),
        fitPoints: Array.isArray(item.fitPoints)
          ? item.fitPoints.slice(0, 3).map((point) => cleanText(point, 40))
          : [],
        caution:
          cleanText(item.caution, 160) ||
          candidate.product.safetyNotes[0],
      };
    });

  if (recommendations.length === 0) {
    throw new Error("Solar 추천 결과의 상품 ID를 확인할 수 없습니다.");
  }

  return recommendations;
}

function createLocalRecommendations(profile, candidates) {
  return candidates.slice(0, 3).map(({ product, score }) => {
    const fitPoints = [];

    if (profile.companion && product.suitableFor.includes(profile.companion)) {
      fitPoints.push(`${profile.companion} 이용에 적합`);
    }
    if (profile.mood && product.moods.includes(profile.mood)) {
      fitPoints.push(`${profile.mood} 분위기`);
    }
    fitPoints.push(`${profile.budget.toLocaleString("ko-KR")}원 예산 이내`);

    return {
      product,
      score,
      reason: `${product.name}은(는) 선택한 예산과 이용 조건에 잘 맞는 상품입니다. ${product.description}`,
      fitPoints: fitPoints.slice(0, 3),
      caution: product.safetyNotes[0],
    };
  });
}

app.listen(port, "127.0.0.1", () => {
  console.log(`WAVEON BUSAN server: http://127.0.0.1:${port}`);
});
