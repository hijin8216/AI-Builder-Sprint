import "dotenv/config";

import express from "express";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const projectDirectory = path.dirname(currentFilePath);
const productFilePath = path.join(projectDirectory, "data", "products.json");
const userFilePath = path.join(projectDirectory, "data", "users.local.json");
const temporaryUserFilePath = `${userFilePath}.tmp`;
const reservationFilePath = path.join(projectDirectory, "data", "reservations.local.json");
const temporaryReservationFilePath = `${reservationFilePath}.tmp`;
const productData = JSON.parse(await readFile(productFilePath, "utf8"));
const products = productData.products;
const users = await loadUsers();
const reservations = await loadReservations();
const activeSessions = new Map();
let userWriteQueue = Promise.resolve();
let reservationWriteQueue = Promise.resolve();
const sessionCookieName = "waveon_session";
const sessionDurationSeconds = 60 * 60 * 24 * 7;

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

app.get("/api/auth/me", (request, response) => {
  const user = getAuthenticatedUser(request);
  if (!user) {
    response.status(401).json({ message: "로그인이 필요합니다." });
    return;
  }
  response.json({ user: publicUser(user) });
});

app.post("/api/auth/register", async (request, response) => {
  try {
    const credentials = normalizeRegistrationCredentials(request.body);
    const duplicatedUser = users.find(
      (user) =>
        user.email === credentials.email || user.userId === credentials.userId,
    );

    if (duplicatedUser) {
      const sameAccount =
        duplicatedUser.email === credentials.email &&
        duplicatedUser.userId === credentials.userId &&
        verifyPassword(credentials.password, duplicatedUser.password);

      if (sameAccount) {
        const sessionToken = createSession(duplicatedUser.id);
        setSessionCookie(response, sessionToken);
        response.json({
          user: publicUser(duplicatedUser),
          existing: true,
        });
        return;
      }

      response.status(409).json({ message: "이미 사용 중인 이메일 또는 아이디입니다." });
      return;
    }

    const user = {
      id: randomBytes(16).toString("hex"),
      email: credentials.email,
      userId: credentials.userId,
      password: hashPassword(credentials.password),
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    await saveUsers();

    const sessionToken = createSession(user.id);
    setSessionCookie(response, sessionToken);
    response.status(201).json({ user: publicUser(user) });
  } catch (error) {
    response.status(400).json({ message: error.message || "회원가입에 실패했습니다." });
  }
});

app.post("/api/auth/login", (request, response) => {
  try {
    const credentials = normalizeLoginCredentials(request.body);
    const user = users.find(
      (candidate) => candidate.userId === credentials.userId,
    );

    if (!user || !verifyPassword(credentials.password, user.password)) {
      response.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
      return;
    }

    const sessionToken = createSession(user.id);
    setSessionCookie(response, sessionToken);
    response.json({ user: publicUser(user) });
  } catch (error) {
    response.status(400).json({ message: error.message || "로그인에 실패했습니다." });
  }
});

app.post("/api/auth/logout", (request, response) => {
  const sessionToken = getSessionToken(request);
  if (sessionToken) activeSessions.delete(sessionToken);
  clearSessionCookie(response);
  response.status(204).end();
});

app.post("/api/reservations", async (request, response) => {
  const user = requireAuthenticatedUser(request, response);
  if (!user) return;

  try {
    const booking = normalizeBooking({
      ...request.body,
      email: user.email,
    });
    const now = new Date().toISOString();
    const reservation = {
      id: randomBytes(16).toString("hex"),
      userId: user.id,
      email: user.email,
      name: booking.name,
      activity: booking.activity,
      venue: booking.venue,
      date: booking.date,
      people: booking.people,
      status: "CONTRACT_PENDING",
      signatureStatus: "",
      documentId: "",
      forwarded: false,
      forwardError: "",
      createdAt: now,
      updatedAt: now,
      signedAt: "",
    };

    reservations.push(reservation);
    await saveReservations();
    response.status(201).json({ reservation: publicReservation(reservation) });
  } catch (error) {
    response.status(400).json({ message: error.message || "예약을 저장하지 못했습니다." });
  }
});

app.get("/api/reservations", async (request, response) => {
  const user = requireAuthenticatedUser(request, response);
  if (!user) return;

  const userReservations = reservations.filter(
    (reservation) => reservation.userId === user.id,
  );
  let changed = false;

  for (const reservation of userReservations) {
    if (
      reservation.documentId &&
      !["COMPLETED", "ABORTED", "PROCESSING_FAILED"].includes(reservation.status)
    ) {
      try {
        changed = (await syncReservationStatus(reservation)) || changed;
      } catch {
        // 마이페이지의 나머지 예약은 모두 표시하고, 다음 조회 때 다시 동기화합니다.
      }
    }
  }

  if (changed) await saveReservations();
  response.json({
    reservations: userReservations
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(publicReservation),
  });
});

app.post("/api/signature/start", async (request, response) => {
  const user = requireAuthenticatedUser(request, response);
  if (!user) return;

  const reservationId = cleanText(request.body?.reservationId, 100);
  const reservation = reservations.find(
    (item) => item.id === reservationId && item.userId === user.id,
  );
  if (!reservation) {
    response.status(404).json({ message: "전자서명을 진행할 예약을 찾지 못했습니다." });
    return;
  }

  try {
    if (reservation.documentId && reservation.status !== "PROCESSING_FAILED") {
      const existingDocument = await requestModusign(
        `/documents/${reservation.documentId}`,
      );
      await syncReservationStatus(reservation);
      await saveReservations();

      if (reservation.status === "COMPLETED") {
        response.json({
          documentId: reservation.documentId,
          reservationId: reservation.id,
          delivery: "embedded",
          completed: true,
        });
        return;
      }

      const existingSigning = await getEmbeddedSigningView(
        existingDocument,
        reservation.name,
      );
      response.json({
        documentId: reservation.documentId,
        reservationId: reservation.id,
        embeddedUrl: existingSigning.embeddedUrl,
        delivery: "embedded",
        alreadySent: true,
      });
      return;
    }

    const document = await createModusignDocument(reservation);
    const readyDocument = await waitForModusignDocument(document.id);
    const signing = await getEmbeddedSigningView(
      readyDocument,
      reservation.name,
    );
    reservation.signatureStatus = "ON_GOING";
    reservation.documentId = document.id;
    reservation.status = "SIGNING";
    reservation.updatedAt = new Date().toISOString();
    await saveReservations();
    response.json({
      documentId: document.id,
      reservationId: reservation.id,
      embeddedUrl: signing.embeddedUrl,
      delivery: "embedded",
    });
  } catch (error) {
    response.status(502).json({ message: error.message || "전자서명 요청에 실패했습니다." });
  }
});

app.get("/api/signature/status", async (request, response) => {
  const user = requireAuthenticatedUser(request, response);
  if (!user) return;

  const reservationId = cleanText(request.query.reservationId, 100);
  const reservation = reservations.find(
    (item) => item.id === reservationId && item.userId === user.id,
  );
  if (!reservation?.documentId) {
    response.status(404).json({ message: "확인할 전자서명 요청이 없습니다." });
    return;
  }

  try {
    const changed = await syncReservationStatus(reservation);
    if (changed) await saveReservations();
    response.json({
      status: reservation.signatureStatus,
      reservationStatus: reservation.status,
      forwarded: reservation.forwarded,
      forwardError: reservation.forwardError,
    });
  } catch (error) {
    response.status(502).json({ message: error.message || "서명 상태를 확인하지 못했습니다." });
  }
});

app.get("/api/reservations/:reservationId/document", async (request, response) => {
  const user = requireAuthenticatedUser(request, response);
  if (!user) return;

  const reservationId = cleanText(request.params.reservationId, 100);
  const reservation = reservations.find(
    (item) => item.id === reservationId && item.userId === user.id,
  );
  if (!reservation?.documentId) {
    response.status(404).json({ message: "저장된 전자서명 문서가 없습니다." });
    return;
  }

  try {
    const changed = await syncReservationStatus(reservation);
    if (changed) await saveReservations();
    if (reservation.status !== "COMPLETED") {
      response.status(409).json({ message: "전자서명이 아직 완료되지 않았습니다." });
      return;
    }

    const document = await requestModusign(`/documents/${reservation.documentId}`);
    const downloadUrl = document.file?.downloadUrl;
    if (!downloadUrl) throw new Error("완료 문서 링크를 찾지 못했습니다.");
    response.redirect(downloadUrl);
  } catch (error) {
    response.status(502).json({ message: error.message || "완료 문서를 열지 못했습니다." });
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

async function loadUsers() {
  try {
    const storedUsers = JSON.parse(await readFile(userFilePath, "utf8"));
    return Array.isArray(storedUsers.users) ? storedUsers.users : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function saveUsers() {
  userWriteQueue = userWriteQueue.catch(() => {}).then(async () => {
    const userData = JSON.stringify({ users }, null, 2);
    await writeFile(temporaryUserFilePath, `${userData}\n`, "utf8");
    await rename(temporaryUserFilePath, userFilePath);
  });
  return userWriteQueue;
}

async function loadReservations() {
  try {
    const storedReservations = JSON.parse(
      await readFile(reservationFilePath, "utf8"),
    );
    return Array.isArray(storedReservations.reservations)
      ? storedReservations.reservations
      : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function saveReservations() {
  reservationWriteQueue = reservationWriteQueue.catch(() => {}).then(async () => {
    const reservationData = JSON.stringify({ reservations }, null, 2);
    await writeFile(
      temporaryReservationFilePath,
      `${reservationData}\n`,
      "utf8",
    );
    await rename(temporaryReservationFilePath, reservationFilePath);
  });
  return reservationWriteQueue;
}

function normalizeRegistrationCredentials(input = {}) {
  const email = cleanText(input.email, 100).toLowerCase();
  const loginCredentials = normalizeLoginCredentials(input);
  const passwordConfirm =
    typeof input.passwordConfirm === "string" ? input.passwordConfirm : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("사용할 이메일 주소를 정확히 입력해 주세요.");
  }
  if (loginCredentials.password !== passwordConfirm) {
    throw new Error("비밀번호와 비밀번호 확인 값이 일치하지 않습니다.");
  }

  return {
    email,
    ...loginCredentials,
  };
}

function normalizeLoginCredentials(input = {}) {
  const userId = cleanText(input.userId, 24).toLowerCase();
  const password = typeof input.password === "string" ? input.password : "";

  if (!/^[a-z0-9._-]{3,24}$/.test(userId)) {
    throw new Error("아이디를 정확히 입력해 주세요.");
  }
  if (
    password.length < 8 ||
    password.length > 128 ||
    !/[A-Za-z]/.test(password) ||
    !/\d/.test(password)
  ) {
    throw new Error("비밀번호는 영문과 숫자를 포함해 8자 이상 입력해 주세요.");
  }

  return { userId, password };
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
  try {
    const [salt, storedHash] = storedPassword.split(":");
    const passwordHash = scryptSync(password, salt, 64);
    const storedHashBuffer = Buffer.from(storedHash, "hex");
    return (
      passwordHash.length === storedHashBuffer.length &&
      timingSafeEqual(passwordHash, storedHashBuffer)
    );
  } catch {
    return false;
  }
}

function publicUser(user) {
  return {
    email: user.email,
    userId: user.userId,
  };
}

function publicReservation(reservation) {
  return {
    id: reservation.id,
    name: reservation.name,
    activity: reservation.activity,
    venue: reservation.venue,
    date: reservation.date,
    people: reservation.people,
    status: reservation.status,
    signatureStatus: reservation.signatureStatus,
    createdAt: reservation.createdAt,
    updatedAt: reservation.updatedAt,
    signedAt: reservation.signedAt,
    documentAvailable:
      reservation.status === "COMPLETED" && Boolean(reservation.documentId),
  };
}

function createSession(userId) {
  const token = randomBytes(32).toString("base64url");
  activeSessions.set(token, {
    userId,
    expiresAt: Date.now() + sessionDurationSeconds * 1000,
  });
  return token;
}

function getSessionToken(request) {
  const cookieHeader = request.headers.cookie ?? "";
  const cookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${sessionCookieName}=`));
  if (!cookie) return "";
  try {
    return decodeURIComponent(cookie.slice(sessionCookieName.length + 1));
  } catch {
    return "";
  }
}

function getAuthenticatedUser(request) {
  const token = getSessionToken(request);
  const session = activeSessions.get(token);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    activeSessions.delete(token);
    return null;
  }
  return users.find((user) => user.id === session.userId) ?? null;
}

function requireAuthenticatedUser(request, response) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    response.status(401).json({ message: "먼저 로그인해 주세요." });
    return null;
  }
  return user;
}

function setSessionCookie(response, token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `${sessionCookieName}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${sessionDurationSeconds}${secure}`,
  );
}

function clearSessionCookie(response) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `${sessionCookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`,
  );
}

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

async function syncReservationStatus(reservation) {
  const before = JSON.stringify({
    status: reservation.status,
    signatureStatus: reservation.signatureStatus,
    forwarded: reservation.forwarded,
    forwardError: reservation.forwardError,
    signedAt: reservation.signedAt,
  });
  const document = await requestModusign(`/documents/${reservation.documentId}`);
  reservation.signatureStatus = document.status;

  if (document.status === "COMPLETED") {
    reservation.status = "COMPLETED";
    reservation.signedAt ||= document.updatedAt || new Date().toISOString();

    if (!reservation.forwarded) {
      try {
        await forwardCompletedDocument(reservation.documentId, reservation);
        reservation.forwarded = true;
        reservation.forwardError = "";
      } catch (error) {
        reservation.forwardError =
          error.message || "완료 문서를 이메일로 전달하지 못했습니다.";
      }
    }
  } else if (["ABORTED", "PROCESSING_FAILED"].includes(document.status)) {
    reservation.status = document.status;
  } else if (
    ["DRAFT", "SCHEDULED", "ON_PROCESSING", "ON_GOING"].includes(document.status)
  ) {
    reservation.status = "SIGNING";
  }

  const after = JSON.stringify({
    status: reservation.status,
    signatureStatus: reservation.signatureStatus,
    forwarded: reservation.forwarded,
    forwardError: reservation.forwardError,
    signedAt: reservation.signedAt,
  });
  const changed = before !== after;
  if (changed) reservation.updatedAt = new Date().toISOString();
  return changed;
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

async function getEmbeddedSigningView(document, participantName) {
  const participant =
    document.participants?.find((item) => item.name === participantName) ??
    document.participants?.find((item) => item.type === "SIGNER") ??
    document.participants?.[0];

  if (!participant?.id) {
    throw new Error("서명 참여자 정보를 찾지 못했습니다.");
  }

  return requestModusign(
    `/documents/${document.id}/participants/${participant.id}/embedded-view`,
  );
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
