import "dotenv/config";

import express from "express";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const projectDirectory = path.dirname(currentFilePath);
const productFilePath = path.join(projectDirectory, "data", "products.json");
const productDetailFilePath = path.join(
  projectDirectory,
  "data",
  "product-details.json",
);
const productContractFilePath = path.join(
  projectDirectory,
  "data",
  "product-contracts.json",
);
const productMediaFilePath = path.join(
  projectDirectory,
  "data",
  "product-media.json",
);
const contractTemplateFilePath = path.join(
  projectDirectory,
  "data",
  "contract-templates.json",
);
const userFilePath = path.join(projectDirectory, "data", "users.local.json");
const temporaryUserFilePath = `${userFilePath}.tmp`;
const reservationFilePath = path.join(projectDirectory, "data", "reservations.local.json");
const temporaryReservationFilePath = `${reservationFilePath}.tmp`;
const sellerPostFilePath = path.join(projectDirectory, "data", "seller-posts.local.json");
const temporarySellerPostFilePath = `${sellerPostFilePath}.tmp`;
const sellerUploadDirectory = path.join(
  projectDirectory,
  "data",
  "seller-uploads.local",
);
const curatedAssetDirectory = path.join(projectDirectory, "assets");
const sellerContractFilePath = path.join(
  projectDirectory,
  "data",
  "seller-contracts.local.json",
);
const temporarySellerContractFilePath = `${sellerContractFilePath}.tmp`;
const productData = JSON.parse(await readFile(productFilePath, "utf8"));
const productDetailData = JSON.parse(
  await readFile(productDetailFilePath, "utf8"),
);
const productContractData = JSON.parse(
  await readFile(productContractFilePath, "utf8"),
);
const contractTemplateData = JSON.parse(
  await readFile(contractTemplateFilePath, "utf8"),
);
const products = productData.products;
const productDetails = productDetailData.details;
const productContracts = productContractData.contracts;
const contractTemplates = contractTemplateData.templates;
const contractTemplateLabels = {
  reservationTerms: "예약 및 이용약관",
  privacyConsent: "개인정보 수집·이용 동의서",
  marineSafety: "해양레저 안전수칙 동의서",
  refundPolicy: "취소·환불 규정 동의서",
  equipmentLiability: "장비 파손·배상 책임 동의서",
  photoVideoConsent: "사진·영상 활용 동의서",
  vesselSafety: "선박 탑승 안전 동의서",
  scubaHealth: "스쿠버 건강 상태 확인서",
  minorGuardian: "미성년자 법정대리인 동의서",
  weatherSchedule: "기상 악화·일정 변경 동의서",
};
const users = await loadUsers();
const reservations = await loadReservations();
const sellerPosts = await loadLocalCollection(sellerPostFilePath, "posts");
const sellerContracts = await loadLocalCollection(
  sellerContractFilePath,
  "contracts",
);
const activeSessions = new Map();
const translationLocales = {
  en: "English",
  ja: "Japanese",
  zh: "Simplified Chinese",
};
const productTranslationCaches = new Map(
  Object.keys(translationLocales).map((locale) => [locale, new Map()]),
);
const productCardTranslationCaches = new Map();
const interfaceTranslationCaches = new Map(
  Object.keys(translationLocales).map((locale) => [locale, new Map()]),
);
const documentSummaryCache = new Map();
const embeddedSigningViewCache = new Map();
const embeddedSigningViewCacheDurationMs = 24 * 60 * 60 * 1000;
const modusignDocumentCache = new Map();
const modusignDocumentRequests = new Map();
const modusignTemplateCache = new Map();
const modusignTemplateRequests = new Map();
const modusignMergedTemplateCache = new Map();
const modusignMergedTemplateRequests = new Map();
const contractRecommendationCache = new Map();
const modusignDocumentCacheDurationMs = 15_000;
const modusignTemplateCacheDurationMs = 60 * 60 * 1000;
const contractRecommendationCacheDurationMs = 24 * 60 * 60 * 1000;
let userWriteQueue = Promise.resolve();
let reservationWriteQueue = Promise.resolve();
let sellerPostWriteQueue = Promise.resolve();
let sellerContractWriteQueue = Promise.resolve();
const sessionCookieName = "waveon_session";
const sessionDurationSeconds = 60 * 60 * 24 * 7;

function getTranslationLocale(value) {
  return Object.hasOwn(translationLocales, value) ? value : null;
}

function getTranslationLanguage(locale) {
  return translationLocales[locale];
}

await approveExistingSellerAccounts();

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

app.get("/assets/sihwa-banana-boat.jpg", (_request, response) => {
  response.sendFile(path.join(curatedAssetDirectory, "sihwa-banana-boat.jpg"));
});

app.get("/seller", (_request, response) => {
  response.sendFile(path.join(projectDirectory, "seller.html"));
});

app.get("/seller/new", (_request, response) => {
  response.sendFile(path.join(projectDirectory, "seller-new.html"));
});

app.get("/seller/edit/:postId", (_request, response) => {
  response.sendFile(path.join(projectDirectory, "seller-new.html"));
});

app.get("/seller.css", (_request, response) => {
  response.sendFile(path.join(projectDirectory, "seller.css"));
});

app.get("/seller.js", (_request, response) => {
  response.sendFile(path.join(projectDirectory, "seller.js"));
});

app.get("/seller-locale.js", (_request, response) => {
  response.set("Cache-Control", "no-store");
  response.sendFile(path.join(projectDirectory, "seller-locale.js"));
});

app.get("/seller-new.js", (_request, response) => {
  response.sendFile(path.join(projectDirectory, "seller-new.js"));
});

app.get("/seller-images/:fileName", (request, response) => {
  const fileName = cleanText(request.params.fileName, 80);
  if (!/^[a-f0-9]{32}\.(jpg|png|webp)$/.test(fileName)) {
    response.status(404).end();
    return;
  }
  response.sendFile(path.join(sellerUploadDirectory, fileName));
});

app.get("/data/products.json", (_request, response) => {
  response.sendFile(productFilePath);
});

app.get("/data/product-details.json", (_request, response) => {
  response.sendFile(productDetailFilePath);
});

app.get("/data/product-contracts.json", (_request, response) => {
  response.sendFile(productContractFilePath);
});

app.get("/data/product-media.json", (_request, response) => {
  response.sendFile(productMediaFilePath);
});

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    solarConfigured: Boolean(process.env.UPSTAGE_API_KEY?.trim()),
    productCount: getAllProducts().length,
  });
});

app.get("/api/products", (_request, response) => {
  response.json({
    products: getAllProducts(),
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
      sellerApproved: false,
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

app.post("/api/auth/password", async (request, response) => {
  const user = requireAuthenticatedUser(request, response);
  if (!user) return;

  try {
    const currentPassword =
      typeof request.body?.currentPassword === "string"
        ? request.body.currentPassword
        : "";
    const newPassword =
      typeof request.body?.newPassword === "string" ? request.body.newPassword : "";

    if (!verifyPassword(currentPassword, user.password)) {
      response.status(401).json({ message: "현재 비밀번호가 일치하지 않습니다." });
      return;
    }
    if (
      newPassword.length < 8 ||
      newPassword.length > 128 ||
      !/[A-Za-z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      response.status(400).json({
        message: "새 비밀번호는 영문과 숫자를 포함해 8자 이상이어야 합니다.",
      });
      return;
    }

    user.password = hashPassword(newPassword);
    await saveUsers();
    response.json({ user: publicUser(user) });
  } catch (error) {
    response.status(400).json({
      message: error.message || "비밀번호를 변경하지 못했습니다.",
    });
  }
});

app.post("/api/auth/password/verify", (request, response) => {
  const user = requireAuthenticatedUser(request, response);
  if (!user) return;

  const currentPassword =
    typeof request.body?.currentPassword === "string"
      ? request.body.currentPassword
      : "";
  if (!verifyPassword(currentPassword, user.password)) {
    response.status(401).json({ message: "현재 비밀번호가 일치하지 않습니다." });
    return;
  }
  response.status(204).end();
});

app.delete("/api/auth/account", async (request, response) => {
  const user = requireAuthenticatedUser(request, response);
  if (!user) return;

  try {
    const currentPassword =
      typeof request.body?.currentPassword === "string"
        ? request.body.currentPassword
        : "";
    if (!verifyPassword(currentPassword, user.password)) {
      response.status(401).json({ message: "현재 비밀번호가 일치하지 않습니다." });
      return;
    }

    const userIndex = users.findIndex((candidate) => candidate.id === user.id);
    if (userIndex >= 0) users.splice(userIndex, 1);

    for (let index = reservations.length - 1; index >= 0; index -= 1) {
      if (
        reservations[index].userId === user.id ||
        reservations[index].sellerUserId === user.id
      ) {
        reservations.splice(index, 1);
      }
    }
    for (let index = sellerPosts.length - 1; index >= 0; index -= 1) {
      if (sellerPosts[index].userId === user.id) sellerPosts.splice(index, 1);
    }
    for (let index = sellerContracts.length - 1; index >= 0; index -= 1) {
      if (sellerContracts[index].userId === user.id) sellerContracts.splice(index, 1);
    }
    for (const [token, session] of activeSessions) {
      if (session.userId === user.id) activeSessions.delete(token);
    }

    await Promise.all([
      saveUsers(),
      saveReservations(),
      saveSellerPosts(),
      saveSellerContracts(),
    ]);
    clearSessionCookie(response);
    response.status(204).end();
  } catch (error) {
    response.status(400).json({
      message: error.message || "회원 탈퇴를 처리하지 못했습니다.",
    });
  }
});

app.post("/api/seller/register", async (request, response) => {
  try {
    const registration = normalizeSellerRegistration(request.body);
    const duplicatedUser = users.find(
      (user) =>
        user.email === registration.email ||
        user.userId === registration.userId,
    );
    const now = new Date().toISOString();

    if (duplicatedUser) {
      const sameAccount =
        duplicatedUser.email === registration.email &&
        duplicatedUser.userId === registration.userId &&
        verifyPassword(registration.password, duplicatedUser.password);

      if (!sameAccount) {
        response.status(409).json({
          message: "이미 사용 중인 이메일 또는 아이디입니다.",
        });
        return;
      }

      duplicatedUser.sellerApproved = true;
      duplicatedUser.sellerApprovedAt ||= now;
      duplicatedUser.sellerProfile = registration.sellerProfile;
      await saveUsers();

      const sessionToken = createSession(duplicatedUser.id);
      setSessionCookie(response, sessionToken);
      response.json({
        user: publicUser(duplicatedUser),
        existing: true,
      });
      return;
    }

    const user = {
      id: randomBytes(16).toString("hex"),
      email: registration.email,
      userId: registration.userId,
      password: hashPassword(registration.password),
      sellerApproved: true,
      sellerApprovedAt: now,
      sellerProfile: registration.sellerProfile,
      createdAt: now,
    };
    users.push(user);
    await saveUsers();

    const sessionToken = createSession(user.id);
    setSessionCookie(response, sessionToken);
    response.status(201).json({ user: publicUser(user), existing: false });
  } catch (error) {
    response.status(400).json({
      message: error.message || "판매자 등록에 실패했습니다.",
    });
  }
});

app.post("/api/seller/login", (request, response) => {
  try {
    const credentials = normalizeLoginCredentials(request.body);
    const user = users.find(
      (candidate) => candidate.userId === credentials.userId,
    );

    if (!user || !verifyPassword(credentials.password, user.password)) {
      response.status(401).json({
        message: "아이디 또는 비밀번호가 올바르지 않습니다.",
      });
      return;
    }
    if (!isApprovedSeller(user)) {
      response.status(403).json({
        code: "SELLER_ACCOUNT_REQUIRED",
        message: "판매자로 등록된 계정만 판매자 센터를 이용할 수 있습니다.",
      });
      return;
    }

    const sessionToken = createSession(user.id);
    setSessionCookie(response, sessionToken);
    response.json({ user: publicUser(user) });
  } catch (error) {
    response.status(400).json({
      message: error.message || "판매자 로그인에 실패했습니다.",
    });
  }
});

app.post("/api/auth/logout", (request, response) => {
  const sessionToken = getSessionToken(request);
  if (sessionToken) activeSessions.delete(sessionToken);
  clearSessionCookie(response);
  response.status(204).end();
});

app.post(
  "/api/seller/uploads",
  express.raw({
    type: ["image/jpeg", "image/png", "image/webp"],
    limit: "6mb",
  }),
  async (request, response) => {
    const user = requireSellerUser(request, response);
    if (!user) return;

    const imageType = detectSellerImageType(request.body);
    if (!imageType) {
      response.status(400).json({
        message: "JPG, PNG 또는 WEBP 이미지 파일만 올릴 수 있습니다.",
      });
      return;
    }

    try {
      const fileName = `${randomBytes(16).toString("hex")}.${imageType}`;
      await mkdir(sellerUploadDirectory, { recursive: true });
      await writeFile(path.join(sellerUploadDirectory, fileName), request.body);
      response.status(201).json({
        imageUrl: `/seller-images/${fileName}`,
      });
    } catch {
      response.status(500).json({ message: "사진을 저장하지 못했습니다." });
    }
  },
);

app.get("/api/seller/overview", (request, response) => {
  const user = requireSellerUser(request, response);
  if (!user) return;

  const sellerReservations = reservations
    .filter(
      (reservation) =>
        sellerOwnsReservation(reservation, user.id) &&
        (!["CANCELLED", "SELLER_CANCELLED"].includes(reservation.status) ||
          !reservation.sellerAcknowledgedCancellationAt),
    )
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  response.json({
    user: publicUser(user),
    modusignConfigured: Boolean(
      process.env.MODUSIGN_EMAIL?.trim() &&
        process.env.MODUSIGN_API_KEY?.trim() &&
        Object.keys(contractTemplates).length,
    ),
    posts: sellerPosts
      .filter((post) => post.userId === user.id)
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(publicSellerPost),
    contracts: sellerContracts
      .filter(
        (contract) => contract.userId === user.id && !contract.archivedAt,
      )
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(publicSellerContract),
    reservations: sellerReservations.map((reservation) =>
      publicSellerReservation(reservation, user.id),
    ),
  });
});

app.post("/api/seller/posts", async (request, response) => {
  const user = requireSellerUser(request, response);
  if (!user) return;

  try {
    const input = normalizeSellerPost(request.body);
    const now = new Date().toISOString();
    const post = {
      id: randomBytes(16).toString("hex"),
      userId: user.id,
      ...input,
      status: "PUBLISHED",
      createdAt: now,
      updatedAt: now,
    };
    sellerPosts.push(post);
    await saveSellerPosts();
    response.status(201).json({ post: publicSellerPost(post) });
  } catch (error) {
    response.status(400).json({
      message: error.message || "판매 상품을 저장하지 못했습니다.",
    });
  }
});

app.patch("/api/seller/posts/:postId", async (request, response) => {
  const user = requireSellerUser(request, response);
  if (!user) return;

  const postId = cleanText(request.params.postId, 100);
  const post = sellerPosts.find(
    (item) => item.id === postId && item.userId === user.id,
  );
  if (!post) {
    response.status(404).json({ message: "수정할 판매 상품을 찾지 못했습니다." });
    return;
  }

  try {
    const input = normalizeSellerPost(request.body);
    Object.assign(post, input, {
      updatedAt: new Date().toISOString(),
    });
    await saveSellerPosts();
    response.json({ post: publicSellerPost(post) });
  } catch (error) {
    response.status(400).json({
      message: error.message || "판매 상품을 수정하지 못했습니다.",
    });
  }
});

app.delete("/api/seller/posts/:postId", async (request, response) => {
  const user = requireSellerUser(request, response);
  if (!user) return;

  const postId = cleanText(request.params.postId, 100);
  const postIndex = sellerPosts.findIndex(
    (item) => item.id === postId && item.userId === user.id,
  );
  if (postIndex < 0) {
    response.status(404).json({ message: "삭제할 판매 상품을 찾지 못했습니다." });
    return;
  }

  const [deletedPost] = sellerPosts.splice(postIndex, 1);
  await saveSellerPosts();
  response.json({ post: publicSellerPost(deletedPost) });
});

app.get("/api/seller/contract-templates", (request, response) => {
  const user = requireSellerUser(request, response);
  if (!user) return;

  const postId = cleanText(request.query?.postId, 100);
  const post = postId
    ? sellerPosts.find((item) => item.id === postId && item.userId === user.id)
    : null;
  const recommendedKeys = post
    ? getSellerContractTemplateKeys(post.category)
    : [];
  const templates = Object.entries(contractTemplates).map(([key, id]) => ({
    key,
    id,
    title: contractTemplateLabels[key] || key,
    recommended: recommendedKeys.includes(key),
  }));

  response.json({
    templates,
    defaultOption: {
      key: "product-default",
      title: "상품 기본 계약서 묶음",
      description: "상품 카테고리에 연결된 계약서를 한 번에 사용합니다.",
    },
  });
});

app.post("/api/seller/contract-recommendations", async (request, response) => {
  const user = requireSellerUser(request, response);
  if (!user) return;

  const postId = cleanText(request.body?.postId, 100);
  const post = sellerPosts.find(
    (item) => item.id === postId && item.userId === user.id,
  );
  if (!post) {
    response.status(404).json({ message: "계약서를 추천할 판매 상품을 찾지 못했습니다." });
    return;
  }

  const cacheKey = `${post.id}:${post.updatedAt || post.createdAt || ""}`;
  const cached = contractRecommendationCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    response.json({ ...cached.result, cached: true });
    return;
  }

  const localRecommendations = createLocalContractRecommendations(post);
  const solarRecommendations = await requestSolarContractRecommendations(
    post,
    localRecommendations,
  );
  const recommendations = mergeContractRecommendations(
    localRecommendations,
    solarRecommendations,
  );
  const result = {
    mode: solarRecommendations ? "solar" : "local",
    message: solarRecommendations
      ? "Solar가 상품의 활동 방식과 위험 요소를 분석했습니다. 필수 계약서는 규칙으로 보호됩니다."
      : "기본 안전 규칙으로 계약서를 추천했습니다. Solar 연결 상태를 확인해 주세요.",
    recommendations,
    recommendedTemplateKeys: recommendations
      .filter((item) => item.selected)
      .map((item) => item.key),
  };
  contractRecommendationCache.set(cacheKey, {
    result,
    expiresAt: Date.now() + contractRecommendationCacheDurationMs,
  });
  response.json({ ...result, cached: false });
});

app.post("/api/seller/contracts/draft", async (request, response) => {
  const user = requireSellerUser(request, response);
  if (!user) return;

  try {
    const reservationId = cleanText(request.body?.reservationId, 100);
    const reservation = reservations.find(
      (item) =>
        item.id === reservationId && sellerOwnsReservation(item, user.id),
    );
    if (!reservation) {
      response.status(404).json({ message: "계약 초안을 만들 예약을 찾지 못했습니다." });
      return;
    }
    if (["CANCELLED", "SELLER_CANCELLED"].includes(reservation.status)) {
      response.status(409).json({ message: "취소된 예약에는 계약 초안을 만들 수 없습니다." });
      return;
    }

    const existingContract = sellerContracts.find(
      (item) =>
        item.userId === user.id && item.reservationId === reservation.id,
    );
    if (existingContract) {
      if (existingContract.status === "DRAFT") {
        response.json({ contract: publicSellerContract(existingContract) });
        return;
      }
      response.status(409).json({
        message: "이 예약에는 이미 계약서를 발송했거나 발송을 시도했습니다.",
        contract: publicSellerContract(existingContract),
      });
      return;
    }

    const post = findSellerPostForReservation(reservation, user.id);
    if (!post) {
      response.status(404).json({
        message: "예약에 연결된 판매 상품을 찾지 못했습니다.",
      });
      return;
    }

    const now = new Date().toISOString();
    const contract = createSellerContractRecord({
      user,
      reservation,
      post,
      status: "DRAFT",
      now,
    });
    contract.draft = createSellerContractDraft(reservation, post);
    sellerContracts.push(contract);
    await saveSellerContracts();
    response.status(201).json({ contract: publicSellerContract(contract) });
  } catch (error) {
    response.status(400).json({
      message: error.message || "계약 초안을 만들지 못했습니다.",
    });
  }
});

app.patch("/api/seller/contracts/:contractId/draft", async (request, response) => {
  const user = requireSellerUser(request, response);
  if (!user) return;

  const contractId = cleanText(request.params.contractId, 100);
  const contract = sellerContracts.find(
    (item) => item.id === contractId && item.userId === user.id,
  );
  if (!contract) {
    response.status(404).json({ message: "저장할 계약 초안을 찾지 못했습니다." });
    return;
  }
  if (contract.status !== "DRAFT") {
    response.status(409).json({ message: "발송을 시작한 계약서는 초안으로 수정할 수 없습니다." });
    return;
  }

  try {
    contract.draft = normalizeSellerContractDraft(request.body?.draft, contract.draft);
    const templateKey = cleanText(request.body?.templateKey, 80);
    if (templateKey && templateKey !== "product-default" && !contractTemplates[templateKey]) {
      throw new Error("선택한 계약 템플릿을 데이터 파일에서 찾지 못했습니다.");
    }
    if (templateKey) contract.selectedTemplateKey = templateKey;
    if (Array.isArray(request.body?.templateKeys)) {
      contract.selectedTemplateKeys = normalizeSelectedTemplateKeys(
        request.body.templateKeys,
      );
    }
    contract.updatedAt = new Date().toISOString();
    await saveSellerContracts();
    response.json({ contract: publicSellerContract(contract) });
  } catch (error) {
    response.status(400).json({
      message: error.message || "계약 초안을 저장하지 못했습니다.",
    });
  }
});

app.post(
  "/api/seller/contracts/:contractId/embedded-draft",
  async (request, response) => {
    const user = requireSellerUser(request, response);
    if (!user) return;

    const contractId = cleanText(request.params.contractId, 100);
    const contract = sellerContracts.find(
      (item) => item.id === contractId && item.userId === user.id,
    );
    if (!contract) {
      response.status(404).json({ message: "편집할 계약 초안을 찾지 못했습니다." });
      return;
    }
    if (contract.status !== "DRAFT") {
      response.status(409).json({ message: "발송을 시작한 계약서는 다시 편집할 수 없습니다." });
      return;
    }

    const post = sellerPosts.find(
      (item) => item.id === contract.postId && item.userId === user.id,
    );
    if (!post) {
      response.status(404).json({ message: "계약에 연결된 상품을 찾지 못했습니다." });
      return;
    }

    try {
      contract.draft = normalizeSellerContractDraft(request.body?.draft, contract.draft);
      const templateKey = cleanText(request.body?.templateKey, 80) || "product-default";
      const templateKeys = normalizeSelectedTemplateKeys(request.body?.templateKeys);
      const selectedTemplate = await getSellerSelectedTemplate(
        templateKey,
        post,
        templateKeys,
      );
      const role = findModusignSignerRole(selectedTemplate.template, {
        useConfiguredRole: false,
      });
      const requesterInputMappings = buildSellerRequesterInputMappings(
        selectedTemplate.template,
        contract,
      );
      const redirectUrl = `${request.protocol}://${request.get("host")}/seller?embeddedContract=${encodeURIComponent(contract.id)}`;
      const embeddedDraft = await requestModusign(
        "/embedded-drafts/create-with-template",
        {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({
            redirectUrl,
            templateId: selectedTemplate.templateId,
            document: {
              title: contract.draft.title,
              ...(requesterInputMappings.length ? { requesterInputMappings } : {}),
              participantMappings: [
                {
                  role,
                  name: contract.customerName,
                  signingMethod: {
                    type: "SECURE_LINK",
                    value: contract.customerEmail,
                  },
                },
              ],
              carbonCopies: [
                { contact: contract.customerEmail, locale: "ko" },
              ],
            },
          }),
        },
      );
      const embeddedUrl = cleanText(embeddedDraft?.embeddedUrl, 2000);
      if (!embeddedUrl) {
        throw new Error("모두싸인 초안 편집 URL을 받지 못했습니다.");
      }

      contract.selectedTemplateKey = templateKey;
      contract.selectedTemplateKeys = templateKeys;
      contract.selectedTemplateId = selectedTemplate.templateId;
      contract.selectedTemplateTitle = selectedTemplate.title;
      contract.embeddedDraftId = cleanText(embeddedDraft?.id, 100);
      contract.embeddedDraftExpiry = cleanText(embeddedDraft?.expiry, 80);
      contract.updatedAt = new Date().toISOString();
      await saveSellerContracts();
      response.json({
        contract: publicSellerContract(contract),
        embeddedUrl,
        expiry: contract.embeddedDraftExpiry,
      });
    } catch (error) {
      response.status(502).json({
        message: error.message || "모두싸인 계약 초안 편집 화면을 열지 못했습니다.",
      });
    }
  },
);

app.post(
  "/api/seller/contracts/:contractId/embedded-complete",
  async (request, response) => {
    const user = requireSellerUser(request, response);
    if (!user) return;

    const contractId = cleanText(request.params.contractId, 100);
    const contract = sellerContracts.find(
      (item) => item.id === contractId && item.userId === user.id,
    );
    if (!contract?.embeddedDraftId) {
      response.status(404).json({ message: "연결할 모두싸인 초안을 찾지 못했습니다." });
      return;
    }

    try {
      const document = await getModusignDocument(contract.embeddedDraftId, {
        force: true,
      });
      contract.documentId = document.id || contract.embeddedDraftId;
      contract.deliveryMode = "WEB_AND_EMAIL";
      contract.status = document.status || "ON_PROCESSING";
      contract.error = "";
      contract.updatedAt = new Date().toISOString();
      await saveSellerContracts();
      await applySellerContractToReservation(contract);
      response.json({ contract: publicSellerContract(contract) });
    } catch (error) {
      response.status(409).json({
        message:
          "모두싸인 편집 화면에서 서명 요청을 완료한 뒤 다시 확인해 주세요.",
      });
    }
  },
);

app.post("/api/seller/contracts/:contractId/send", async (request, response) => {
  const user = requireSellerUser(request, response);
  if (!user) return;

  const contractId = cleanText(request.params.contractId, 100);
  const contract = sellerContracts.find(
    (item) => item.id === contractId && item.userId === user.id,
  );
  if (!contract) {
    response.status(404).json({ message: "발송할 계약 초안을 찾지 못했습니다." });
    return;
  }
  if (contract.status !== "DRAFT") {
    response.status(409).json({ message: "이미 발송을 시작한 계약서입니다." });
    return;
  }

  const post = sellerPosts.find(
    (item) => item.id === contract.postId && item.userId === user.id,
  );
  if (!post) {
    response.status(404).json({ message: "계약에 연결된 상품을 찾지 못했습니다." });
    return;
  }

  try {
    contract.draft = normalizeSellerContractDraft(request.body?.draft, contract.draft);
    contract.selectedTemplateKey =
      cleanText(request.body?.templateKey, 80) ||
      contract.selectedTemplateKey ||
      "product-default";
    contract.selectedTemplateKeys = Array.isArray(request.body?.templateKeys)
      ? normalizeSelectedTemplateKeys(request.body.templateKeys)
      : contract.selectedTemplateKeys || [];
    contract.status = "SENDING";
    contract.error = "";
    contract.updatedAt = new Date().toISOString();
    await saveSellerContracts();
    await deliverSellerContract(contract, post);
    await applySellerContractToReservation(contract);
    response.json({ contract: publicSellerContract(contract) });
  } catch (error) {
    contract.status = "SEND_FAILED";
    contract.error = cleanText(error.message, 240);
    contract.updatedAt = new Date().toISOString();
    await saveSellerContracts();
    response.status(502).json({
      message: contract.error || "모두싸인 계약서를 발송하지 못했습니다.",
      contract: publicSellerContract(contract),
    });
  }
});

app.post("/api/seller/contracts", async (request, response) => {
  const user = requireSellerUser(request, response);
  if (!user) return;

  try {
    const reservationId = cleanText(request.body?.reservationId, 100);
    const reservation = reservations.find(
      (item) =>
        item.id === reservationId && sellerOwnsReservation(item, user.id),
    );
    if (!reservation) {
      response.status(404).json({ message: "계약서를 보낼 예약을 찾지 못했습니다." });
      return;
    }

    const existingContract = sellerContracts.find(
      (item) =>
        item.userId === user.id && item.reservationId === reservation.id,
    );
    if (existingContract) {
      response.status(409).json({
        message:
          existingContract.status === "SEND_FAILED"
            ? "이미 발송을 시도한 예약입니다. 계약 현황에서 다시 발송해 주세요."
            : "이 예약에는 이미 계약서를 발송했습니다.",
        contract: publicSellerContract(existingContract),
      });
      return;
    }

    const post = findSellerPostForReservation(reservation, user.id);
    if (!post) {
      response.status(404).json({
        message: "예약에 연결된 판매 상품을 찾지 못했습니다.",
      });
      return;
    }

    const now = new Date().toISOString();
    const contract = createSellerContractRecord({
      user,
      reservation,
      post,
      status: "SENDING",
      now,
    });
    contract.draft = createSellerContractDraft(reservation, post);
    sellerContracts.push(contract);
    await saveSellerContracts();

    try {
      await deliverSellerContract(contract, post);
      await applySellerContractToReservation(contract);
      response.status(201).json({ contract: publicSellerContract(contract) });
    } catch (error) {
      contract.status = "SEND_FAILED";
      contract.error = cleanText(error.message, 240);
      contract.updatedAt = new Date().toISOString();
      await saveSellerContracts();
      response.status(502).json({
        message: contract.error || "모두싸인 계약서를 발송하지 못했습니다.",
        contract: publicSellerContract(contract),
      });
    }
  } catch (error) {
    response.status(400).json({
      message: error.message || "계약서 발송 정보를 확인해 주세요.",
    });
  }
});

app.post("/api/seller/contracts/:contractId/resend", async (request, response) => {
  const user = requireSellerUser(request, response);
  if (!user) return;

  const contractId = cleanText(request.params.contractId, 100);
  const contract = sellerContracts.find(
    (item) => item.id === contractId && item.userId === user.id,
  );
  if (!contract) {
    response.status(404).json({ message: "재발송할 계약 기록을 찾지 못했습니다." });
    return;
  }
  const post = sellerPosts.find(
    (item) => item.id === contract.postId && item.userId === user.id,
  );
  if (!post) {
    response.status(404).json({ message: "계약에 연결된 상품을 찾지 못했습니다." });
    return;
  }

  try {
    await prepareSellerContractForUnifiedResend(contract);
    contract.status = "SENDING";
    contract.error = "";
    contract.updatedAt = new Date().toISOString();
    await saveSellerContracts();
    await deliverSellerContract(contract, post);
    await applySellerContractToReservation(contract);
    response.json({ contract: publicSellerContract(contract) });
  } catch (error) {
    contract.status = "SEND_FAILED";
    contract.error = cleanText(error.message, 240);
    contract.updatedAt = new Date().toISOString();
    await saveSellerContracts();
    response.status(502).json({
      message: contract.error || "모두싸인 계약서를 재발송하지 못했습니다.",
      contract: publicSellerContract(contract),
    });
  }
});

app.post(
  "/api/seller/contracts/:contractId/replace-for-web",
  async (request, response) => {
    const user = requireSellerUser(request, response);
    if (!user) return;

    const contractId = cleanText(request.params.contractId, 100);
    const contract = sellerContracts.find(
      (item) => item.id === contractId && item.userId === user.id,
    );
    if (!contract?.documentId) {
      response.status(404).json({
        message: "웹 서명 방식으로 교체할 기존 계약서를 찾지 못했습니다.",
      });
      return;
    }
    if (contract.deliveryMode === "WEB_AND_EMAIL") {
      response.status(409).json({
        message: "이미 웹사이트 서명과 이메일 알림을 함께 지원하는 계약서입니다.",
      });
      return;
    }

    const post = sellerPosts.find(
      (item) => item.id === contract.postId && item.userId === user.id,
    );
    if (!post) {
      response.status(404).json({
        message: "계약에 연결된 상품을 찾지 못했습니다.",
      });
      return;
    }

    let replacementStarted = false;
    try {
      const legacyDocument = await getModusignDocument(contract.documentId);
      if (legacyDocument.status === "COMPLETED") {
        response.status(409).json({
          message: "이미 서명이 완료된 계약서는 새 방식으로 교체할 수 없습니다.",
        });
        return;
      }

      const legacyDocumentId = contract.documentId;
      if (!["ABORTED", "PROCESSING_FAILED"].includes(legacyDocument.status)) {
        await requestModusign(`/documents/${legacyDocumentId}/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({
            message: "웹사이트 전자서명 방식으로 계약서를 다시 요청합니다.",
            accessibleByParticipant: false,
          }),
        });
        forgetModusignDocument(legacyDocumentId);
      }

      replacementStarted = true;
      contract.replacedDocumentIds = [
        ...(Array.isArray(contract.replacedDocumentIds)
          ? contract.replacedDocumentIds
          : []),
        legacyDocumentId,
      ];
      contract.documentId = "";
      contract.deliveryMode = "";
      contract.status = "SENDING";
      contract.error = "";
      contract.updatedAt = new Date().toISOString();
      await saveSellerContracts();
      await clearSellerContractFromReservation(contract);

      await deliverSellerContract(contract, post);
      await applySellerContractToReservation(contract);
      response.json({ contract: publicSellerContract(contract) });
    } catch (error) {
      if (replacementStarted) {
        contract.status = "SEND_FAILED";
      }
      contract.error = cleanText(error.message, 240);
      contract.updatedAt = new Date().toISOString();
      await saveSellerContracts();
      response.status(502).json({
        message:
          contract.error ||
          "웹사이트 전자서명 방식으로 계약서를 다시 보내지 못했습니다.",
        contract: publicSellerContract(contract),
      });
    }
  },
);

app.post("/api/seller/contracts/:contractId/refresh", async (request, response) => {
  const user = requireSellerUser(request, response);
  if (!user) return;

  const contractId = cleanText(request.params.contractId, 100);
  const contract = sellerContracts.find(
    (item) => item.id === contractId && item.userId === user.id,
  );
  if (!contract?.documentId) {
    response.status(404).json({ message: "상태를 확인할 계약 문서가 없습니다." });
    return;
  }

  try {
    const document = await getModusignDocument(contract.documentId, {
      force: true,
    });
    contract.status = document.status || contract.status;
    contract.error = "";
    contract.updatedAt = new Date().toISOString();
    await saveSellerContracts();
    await applySellerContractToReservation(contract);
    response.json({ contract: publicSellerContract(contract) });
  } catch (error) {
    response.status(502).json({
      message: error.message || "계약 상태를 확인하지 못했습니다.",
    });
  }
});

app.post(
  "/api/seller/contracts/:contractId/archive",
  async (request, response) => {
    const user = requireSellerUser(request, response);
    if (!user) return;

    const contractId = cleanText(request.params.contractId, 100);
    const contract = sellerContracts.find(
      (item) => item.id === contractId && item.userId === user.id,
    );
    if (!contract) {
      response.status(404).json({
        message: "정리할 계약 발송 내역을 찾지 못했습니다.",
      });
      return;
    }
    if (contract.status === "SENDING") {
      response.status(409).json({
        message: "발송 중인 계약은 발송이 끝난 뒤 목록에서 정리할 수 있습니다.",
      });
      return;
    }

    if (contract.status === "DRAFT") {
      const contractIndex = sellerContracts.indexOf(contract);
      sellerContracts.splice(contractIndex, 1);
      await saveSellerContracts();
      response.json({ contract: publicSellerContract(contract) });
      return;
    }

    if (!contract.archivedAt) {
      contract.archivedAt = new Date().toISOString();
      contract.updatedAt = new Date().toISOString();
      await saveSellerContracts();
    }
    response.json({ contract: publicSellerContract(contract) });
  },
);

app.post("/api/reservations", async (request, response) => {
  const user = requireAuthenticatedUser(request, response);
  if (!user) return;

  try {
    const productId = cleanText(request.body?.productId, 100);
    const selectedProduct = getAllProducts().find(
      (product) => product.id === productId,
    );
    if (!selectedProduct) {
      response.status(404).json({ message: "예약할 상품을 찾지 못했습니다." });
      return;
    }

    const sellerPost = sellerPosts.find(
      (post) => post.id === productId && post.status === "PUBLISHED",
    );
    const booking = normalizeBooking({
      ...request.body,
      email: user.email,
      activity: selectedProduct.name,
      venue: selectedProduct.partnerName,
    });
    const now = new Date().toISOString();
    const reservation = {
      id: randomBytes(16).toString("hex"),
      userId: user.id,
      sellerUserId: sellerPost?.userId || "",
      email: user.email,
      name: booking.name,
      productId: booking.productId,
      activity: booking.activity,
      venue: booking.venue,
      date: booking.date,
      time: booking.time,
      people: booking.people,
      status: sellerPost ? "SELLER_REVIEW" : "CONTRACT_PENDING",
      signatureStatus: "",
      documentId: "",
      forwarded: false,
      forwardError: "",
      contractNotificationReadAt: "",
      buyerCancellationAcknowledgedAt: "",
      sellerCancellationAcknowledgedAt: "",
      sellerAcknowledgedCancellationAt: "",
      sellerCancelledAt: "",
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

app.post("/api/reservations/:reservationId/cancel", async (request, response) => {
  const user = requireAuthenticatedUser(request, response);
  if (!user) return;

  const reservationId = cleanText(request.params.reservationId, 100);
  const reservation = reservations.find(
    (item) => item.id === reservationId && item.userId === user.id,
  );
  if (!reservation) {
    response.status(404).json({ message: "취소할 예약을 찾지 못했습니다." });
    return;
  }

  const cancellableStatuses = [
    "SELLER_REVIEW",
    "CONTRACT_PENDING",
    "SIGNING",
    "COMPLETED",
    "ABORTED",
    "PROCESSING_FAILED",
  ];
  const canRequestCancellation =
    ["CONTRACT_PENDING", "SIGNING", "COMPLETED"].includes(
      reservation.status,
    ) && Boolean(reservation.documentId);
  const canCancelImmediately =
    cancellableStatuses.includes(reservation.status) &&
    !canRequestCancellation;
  if (!canCancelImmediately && !canRequestCancellation) {
    response.status(409).json({
      message: "현재 상태의 예약은 취소할 수 없습니다.",
    });
    return;
  }

  try {
    const now = new Date().toISOString();
    reservation.status = canRequestCancellation
      ? "CANCELLATION_REQUESTED"
      : "CANCELLED";
    reservation.signatureStatus = canRequestCancellation
      ? reservation.signatureStatus
      : "";
    reservation.cancellationRequestedAt = canRequestCancellation ? now : "";
    if (!canRequestCancellation) {
      reservation.buyerCancellationAcknowledgedAt = "";
      reservation.sellerAcknowledgedCancellationAt = "";
    }
    reservation.updatedAt = now;
    await saveReservations();
    response.json({ reservation: publicReservation(reservation) });
  } catch (error) {
    response.status(500).json({
      message: error.message || "예약을 취소하지 못했습니다.",
    });
  }
});

app.post(
  "/api/seller/reservations/:reservationId/cancel",
  async (request, response) => {
    const user = requireSellerUser(request, response);
    if (!user) return;

    const reservationId = cleanText(request.params.reservationId, 100);
    const reservation = reservations.find(
      (item) =>
        item.id === reservationId && sellerOwnsReservation(item, user.id),
    );
    if (!reservation) {
      response.status(404).json({ message: "취소할 예약을 찾지 못했습니다." });
      return;
    }
    if (reservation.status === "SELLER_CANCELLED") {
      response.json({
        reservation: publicSellerReservation(reservation, user.id),
      });
      return;
    }
    if (reservation.status === "CANCELLED") {
      response.status(409).json({
        message: "구매자가 이미 취소한 예약입니다.",
      });
      return;
    }

    const contract = sellerContracts.find(
      (item) =>
        item.userId === user.id && item.reservationId === reservation.id,
    );
    const completedDocument =
      reservation.status === "COMPLETED" ||
      reservation.signatureStatus === "COMPLETED" ||
      contract?.status === "COMPLETED";
    try {
      if (
        reservation.documentId &&
        !completedDocument &&
        !["ABORTED", "PROCESSING_FAILED"].includes(
          reservation.signatureStatus,
        )
      ) {
        await requestModusign(
          `/documents/${reservation.documentId}/cancel`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({
              message: "판매자 사정으로 예약이 취소되었습니다.",
              accessibleByParticipant: false,
            }),
          },
        );
        forgetModusignDocument(reservation.documentId);
      }

      const now = new Date().toISOString();
      reservation.status = "SELLER_CANCELLED";
      if (completedDocument) {
        reservation.signatureStatus = "COMPLETED";
        reservation.signedAt ||= contract?.updatedAt || now;
      } else {
        reservation.signatureStatus = reservation.documentId ? "ABORTED" : "";
      }
      reservation.sellerCancelledAt = now;
      reservation.sellerCancellationAcknowledgedAt = "";
      reservation.sellerAcknowledgedCancellationAt = "";
      reservation.updatedAt = now;

      if (contract && !completedDocument) {
        contract.status = "ABORTED";
        contract.error = "";
        contract.updatedAt = now;
      }

      await Promise.all([
        saveReservations(),
        contract && !completedDocument
          ? saveSellerContracts()
          : Promise.resolve(),
      ]);
      response.json({
        reservation: publicSellerReservation(reservation, user.id),
      });
    } catch (error) {
      response.status(502).json({
        message:
          error.message ||
          "모두싸인 서명 요청과 예약을 취소하지 못했습니다.",
      });
    }
  },
);

app.post(
  "/api/reservations/:reservationId/contract/read",
  async (request, response) => {
    const user = requireAuthenticatedUser(request, response);
    if (!user) return;

    const reservationId = cleanText(request.params.reservationId, 100);
    const reservation = reservations.find(
      (item) => item.id === reservationId && item.userId === user.id,
    );
    if (
      !reservation ||
      !["CONTRACT_PENDING", "SIGNING", "PROCESSING_FAILED"].includes(
        reservation.status,
      )
    ) {
      response.status(404).json({ message: "확인할 계약서 알림이 없습니다." });
      return;
    }

    if (!reservation.contractNotificationReadAt) {
      reservation.contractNotificationReadAt = new Date().toISOString();
      reservation.updatedAt = reservation.contractNotificationReadAt;
      await saveReservations();
    }
    response.json({ reservation: publicReservation(reservation) });
  },
);

app.post(
  "/api/reservations/:reservationId/cancellation/read",
  async (request, response) => {
    const user = requireAuthenticatedUser(request, response);
    if (!user) return;

    const reservationId = cleanText(request.params.reservationId, 100);
    const reservation = reservations.find(
      (item) => item.id === reservationId && item.userId === user.id,
    );
    if (
      !reservation ||
      !["CANCELLED", "SELLER_CANCELLED"].includes(reservation.status)
    ) {
      response.status(404).json({ message: "확인할 취소 예약이 없습니다." });
      return;
    }

    const now = new Date().toISOString();
    if (reservation.status === "SELLER_CANCELLED") {
      reservation.sellerCancellationAcknowledgedAt ||= now;
    } else {
      reservation.buyerCancellationAcknowledgedAt ||= now;
    }
    reservation.updatedAt = now;
    await saveReservations();
    response.json({ reservation: publicReservation(reservation) });
  },
);

app.post(
  "/api/seller/reservations/:reservationId/cancellation/read",
  async (request, response) => {
    const user = requireSellerUser(request, response);
    if (!user) return;

    const reservationId = cleanText(request.params.reservationId, 100);
    const reservation = reservations.find(
      (item) =>
        item.id === reservationId && sellerOwnsReservation(item, user.id),
    );
    if (
      !reservation ||
      !["CANCELLED", "SELLER_CANCELLED"].includes(reservation.status)
    ) {
      response.status(404).json({ message: "확인할 취소 예약이 없습니다." });
      return;
    }

    if (!reservation.sellerAcknowledgedCancellationAt) {
      reservation.sellerAcknowledgedCancellationAt = new Date().toISOString();
      reservation.updatedAt = reservation.sellerAcknowledgedCancellationAt;
      await saveReservations();
    }
    response.json({
      reservation: publicSellerReservation(reservation, user.id),
    });
  },
);

app.get("/api/reservations", async (request, response) => {
  const user = requireAuthenticatedUser(request, response);
  if (!user) return;

  const userReservations = reservations.filter(
    (reservation) =>
      reservation.userId === user.id &&
      (reservation.status !== "CANCELLED" ||
        !reservation.buyerCancellationAcknowledgedAt) &&
      (reservation.status !== "SELLER_CANCELLED" ||
        !reservation.sellerCancellationAcknowledgedAt),
  );
  let changed = false;

  for (const reservation of userReservations) {
    if (
      reservation.documentId &&
      ![
        "COMPLETED",
        "CANCELLATION_REQUESTED",
        "SELLER_CANCELLED",
        "ABORTED",
        "PROCESSING_FAILED",
      ].includes(reservation.status)
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

  if (
    !["CONTRACT_PENDING", "SIGNING", "PROCESSING_FAILED"].includes(
      reservation.status,
    )
  ) {
    response.status(409).json({
      message: "현재 상태의 예약은 전자서명을 진행할 수 없습니다.",
    });
    return;
  }

  try {
    if (reservation.documentId && reservation.status !== "PROCESSING_FAILED") {
      const savedSigning = getSavedEmbeddedSigningView(reservation);
      if (savedSigning) {
        response.json({
          documentId: reservation.documentId,
          reservationId: reservation.id,
          embeddedUrl: savedSigning.embeddedUrl,
          delivery: "embedded",
          alreadySent: true,
          cached: true,
        });
        return;
      }

      const cachedSigning = getCachedEmbeddedSigningView(reservation.documentId);
      if (cachedSigning) {
        response.json({
          documentId: reservation.documentId,
          reservationId: reservation.id,
          embeddedUrl: cachedSigning.embeddedUrl,
          delivery: "embedded",
          alreadySent: true,
          cached: true,
        });
        return;
      }

      let existingDocument = await getModusignDocument(
        reservation.documentId,
      );
      if (
        ["DRAFT", "SCHEDULED", "ON_PROCESSING"].includes(
          existingDocument.status,
        )
      ) {
        existingDocument = await waitForModusignDocument(
          reservation.documentId,
        );
      }
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

      if (["ABORTED", "PROCESSING_FAILED"].includes(reservation.status)) {
        response.status(409).json({
          message:
            "기존 전자서명 문서를 다시 열 수 없습니다. 사용량 보호를 위해 새 문서를 자동으로 만들지 않았습니다.",
        });
        return;
      }

      const existingSigning = await getEmbeddedSigningView(
        existingDocument,
        reservation.name,
      );
      cacheEmbeddedSigningView(reservation.documentId, existingSigning);
      saveEmbeddedSigningView(reservation, existingSigning);
      await saveReservations();
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
    cacheEmbeddedSigningView(document.id, signing);
    reservation.signatureStatus = "ON_GOING";
    reservation.documentId = document.id;
    reservation.status = "SIGNING";
    saveEmbeddedSigningView(reservation, signing);
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
    if (
      !["CANCELLATION_REQUESTED", "SELLER_CANCELLED"].includes(
        reservation.status,
      )
    ) {
      const changed = await syncReservationStatus(reservation);
      if (changed) await saveReservations();
    }
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
    if (
      !["CANCELLATION_REQUESTED", "SELLER_CANCELLED"].includes(
        reservation.status,
      )
    ) {
      const changed = await syncReservationStatus(reservation);
      if (changed) await saveReservations();
    }
    const completedSellerCancellation =
      reservation.status === "SELLER_CANCELLED" &&
      reservation.signatureStatus === "COMPLETED";
    if (
      !["COMPLETED", "CANCELLATION_REQUESTED"].includes(
        reservation.status,
      ) &&
      !completedSellerCancellation
    ) {
      response.status(409).json({ message: "전자서명이 아직 완료되지 않았습니다." });
      return;
    }

    const document = await getModusignDocument(reservation.documentId, {
      force: true,
    });
    const downloadUrl = document.file?.downloadUrl;
    if (!downloadUrl) throw new Error("완료 문서 링크를 찾지 못했습니다.");
    response.redirect(downloadUrl);
  } catch (error) {
    response.status(502).json({ message: error.message || "완료 문서를 열지 못했습니다." });
  }
});

app.post("/api/contract-summary", async (request, response) => {
  try {
    const productId = cleanText(request.body?.productId, 100);
    const outputLocale =
      request.body?.locale === "ko"
        ? "ko"
        : getTranslationLocale(request.body?.locale);
    if (!outputLocale) {
      response.status(400).json({ message: "지원하지 않는 요약 언어입니다." });
      return;
    }
    const { product, detail, contract } = getProductContent(productId);

    if (!product || !detail || !contract) {
      response.status(404).json({ message: "요약할 상품 약관을 찾지 못했습니다." });
      return;
    }

    const terms = buildContractTerms(product, detail, contract);
    const solarSummary = await requestFocusedContractSummary(
      product,
      terms,
      contract.riskLevel,
      outputLocale,
    );
    const fallbackSummary =
      outputLocale === "ko"
        ? createFocusedLocalSummary(product, terms, contract.riskLevel)
        : createTranslatedLocalSummary(
            product,
            detail,
            contract,
            contract.riskLevel,
            outputLocale,
          );

    response.json({
      mode: solarSummary ? "solar" : "local",
      message: solarSummary
        ? "Solar highlighted refund limits and potentially unfavorable terms."
        : "Solar is unavailable, so a terms-based summary is shown.",
      summary: solarSummary ?? fallbackSummary,
    });
  } catch (error) {
    console.error("약관 요약 처리 오류:", error.message);
    response.status(400).json({
      message: error.message || "약관을 요약하지 못했습니다.",
    });
  }
});

app.post("/api/signature/contract-summary", async (request, response) => {
  const user = requireAuthenticatedUser(request, response);
  if (!user) return;

  try {
    const reservationId = cleanText(request.body?.reservationId, 100);
    const outputLocale =
      request.body?.locale === "ko"
        ? "ko"
        : getTranslationLocale(request.body?.locale);
    const reservation = reservations.find(
      (item) => item.id === reservationId && item.userId === user.id,
    );
    if (!reservation?.documentId) {
      response.status(409).json({
        message: "모두싸인 계약서가 준비된 뒤에 요약할 수 있습니다.",
      });
      return;
    }
    if (!outputLocale) {
      response.status(400).json({ message: "지원하지 않는 요약 언어입니다." });
      return;
    }

    const savedSummary = reservation.aiContractSummaries?.[outputLocale];
    if (savedSummary) {
      response.json({ ...savedSummary, cached: true });
      return;
    }

    const cacheKey = `${reservation.documentId}:${outputLocale}`;
    const cachedSummary = documentSummaryCache.get(cacheKey);
    if (cachedSummary) {
      response.json({ ...cachedSummary, cached: true });
      return;
    }

    const document = await requestModusign(`/documents/${reservation.documentId}`);
    const documentText = await extractModusignDocumentText(document, reservation);
    const product = getAllProducts().find(
      (item) => item.id === reservation.productId,
    ) ?? { name: reservation.activity, refundPolicy: "", safetyNotes: [] };
    const baselineRiskLevel =
      productContracts[reservation.productId]?.riskLevel ?? "보통";
    const solarSummary = await requestFocusedContractSummary(
      product,
      [documentText],
      baselineRiskLevel,
      outputLocale,
    );
    const fallbackSummary =
      outputLocale === "ko"
        ? createFocusedDocumentLocalSummary(
            product,
            documentText,
            baselineRiskLevel,
          )
        : createTranslatedDocumentFallback(product, baselineRiskLevel, outputLocale);
    const result = {
      mode: solarSummary ? "modusign-document" : "modusign-document-fallback",
      source: "modusign-document",
      summary: solarSummary ?? fallbackSummary,
    };
    documentSummaryCache.set(cacheKey, result);
    reservation.aiContractSummaries ??= {};
    reservation.aiContractSummaries[outputLocale] = result;
    await saveReservations();
    response.json(result);
  } catch (error) {
    console.error("모두싸인 계약서 요약 처리 오류:", error.message);
    response.status(502).json({
      message: error.message || "실제 계약서를 요약하지 못했습니다.",
    });
  }
});

app.post("/api/product-translation", async (request, response) => {
  try {
    const productId = cleanText(request.body?.productId, 100);
    const outputLocale = getTranslationLocale(request.body?.locale);
    if (!outputLocale) {
      response.status(400).json({ message: "지원하지 않는 번역 언어입니다." });
      return;
    }
    const { product, detail, contract } = getProductContent(productId);

    if (!product || !detail || !contract) {
      response.status(404).json({ message: "번역할 상품 정보를 찾지 못했습니다." });
      return;
    }

    const translationCache = productTranslationCaches.get(outputLocale);
    const cachedTranslation = translationCache.get(productId);
    if (cachedTranslation) {
      response.json({ translation: cachedTranslation, cached: true });
      return;
    }

    const translation = await requestProductTranslation(
      product,
      detail,
      contract,
      outputLocale,
    );
    if (!translation) {
      response.status(503).json({
        message: "번역을 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      });
      return;
    }

    translationCache.set(productId, translation);
    response.json({ translation, cached: false });
  } catch (error) {
    console.error("상품 번역 처리 오류:", error.message);
    response.status(400).json({
      message: error.message || "상품 번역을 준비하지 못했습니다.",
    });
  }
});

app.post("/api/product-card-translations", async (request, response) => {
  try {
    const outputLocale = getTranslationLocale(request.body?.locale);
    if (!outputLocale) {
      response.status(400).json({ message: "지원하지 않는 번역 언어입니다." });
      return;
    }
    const requestedIds = Array.isArray(request.body?.productIds)
      ? request.body.productIds.map((id) => cleanText(id, 100)).filter(Boolean)
      : [];
    const availableProducts = getAllProducts();
    const requestedProducts = requestedIds.length
      ? availableProducts
          .filter((product) => requestedIds.includes(product.id))
          .slice(0, 8)
      : availableProducts.slice(0, 8);
    if (requestedProducts.length === 0) {
      response.status(404).json({ message: "번역할 상품을 찾지 못했습니다." });
      return;
    }

    const cache = productCardTranslationCaches.get(outputLocale) ?? new Map();
    productCardTranslationCaches.set(outputLocale, cache);
    const missingProducts = requestedProducts.filter(
      (product) => !cache.has(product.id),
    );
    const translatedMissingProducts = missingProducts.length
      ? await requestProductCardTranslations(missingProducts, outputLocale)
      : [];
    if (translatedMissingProducts) {
      translatedMissingProducts.forEach((translation) => {
        cache.set(translation.id, translation);
      });
    }
    const translations = requestedProducts.map((product) => cache.get(product.id));
    if (translations.some((translation) => !translation)) {
      response.status(503).json({
        message: "상품 목록 번역을 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      });
      return;
    }

    response.json({ translations, cached: missingProducts.length === 0 });
  } catch (error) {
    console.error("상품 목록 번역 처리 오류:", error.message);
    response.status(400).json({
      message: error.message || "상품 목록 번역을 준비하지 못했습니다.",
    });
  }
});

app.post("/api/interface-translations", async (request, response) => {
  try {
    const outputLocale = getTranslationLocale(request.body?.locale);
    if (!outputLocale) {
      response.status(400).json({ message: "지원하지 않는 번역 언어입니다." });
      return;
    }

    const texts = [
      ...new Set(
        (Array.isArray(request.body?.texts) ? request.body.texts : [])
          .filter((text) => typeof text === "string")
          .map((text) => text.trim())
          .filter((text) => text.length > 0 && text.length <= 1200),
      ),
    ].slice(0, 120);
    if (texts.length === 0) {
      response.status(400).json({ message: "번역할 화면 문구가 없습니다." });
      return;
    }

    const cache = interfaceTranslationCaches.get(outputLocale);
    const missingTexts = texts.filter((text) => !cache.has(text));
    if (missingTexts.length > 0) {
      const translatedTexts = await requestInterfaceTranslations(
        missingTexts,
        outputLocale,
      );
      if (!translatedTexts) {
        response.status(503).json({ message: "화면 번역을 준비하지 못했습니다." });
        return;
      }
      translatedTexts.forEach(([source, translation]) => {
        cache.set(source, translation);
      });
    }

    response.json({
      translations: texts.map((source) => ({
        source,
        translation: cache.get(source),
      })),
    });
  } catch (error) {
    console.error("화면 문구 번역 처리 오류:", error.message);
    response.status(400).json({
      message: error.message || "화면 번역을 준비하지 못했습니다.",
    });
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

async function loadLocalCollection(filePath, key) {
  try {
    const storedData = JSON.parse(await readFile(filePath, "utf8"));
    return Array.isArray(storedData[key]) ? storedData[key] : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function saveSellerPosts() {
  sellerPostWriteQueue = sellerPostWriteQueue.catch(() => {}).then(async () => {
    const postData = JSON.stringify({ posts: sellerPosts }, null, 2);
    await writeFile(temporarySellerPostFilePath, `${postData}\n`, "utf8");
    await rename(temporarySellerPostFilePath, sellerPostFilePath);
  });
  return sellerPostWriteQueue;
}

async function saveSellerContracts() {
  sellerContractWriteQueue = sellerContractWriteQueue
    .catch(() => {})
    .then(async () => {
      const contractData = JSON.stringify(
        { contracts: sellerContracts },
        null,
        2,
      );
      await writeFile(
        temporarySellerContractFilePath,
        `${contractData}\n`,
        "utf8",
      );
      await rename(temporarySellerContractFilePath, sellerContractFilePath);
    });
  return sellerContractWriteQueue;
}

async function approveExistingSellerAccounts() {
  const sellerUserIds = new Set(sellerPosts.map((post) => post.userId));
  let approvalChanged = false;

  users.forEach((user) => {
    if (sellerUserIds.has(user.id) && user.sellerApproved !== true) {
      user.sellerApproved = true;
      approvalChanged = true;
    }
  });

  if (approvalChanged) {
    await saveUsers();
  }
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

function normalizeSellerRegistration(input = {}) {
  const credentials = normalizeRegistrationCredentials(input);
  const partnerName = cleanText(input.partnerName, 60);
  const representativeName = cleanText(input.representativeName, 40);
  const businessRegistrationNumber = cleanText(
    input.businessRegistrationNumber,
    20,
  ).replace(/\D/g, "");
  const phone = cleanText(input.phone, 20).replace(/\D/g, "");

  if (partnerName.length < 2) {
    throw new Error("업체명을 두 글자 이상 입력해 주세요.");
  }
  if (representativeName.length < 2) {
    throw new Error("대표자명을 두 글자 이상 입력해 주세요.");
  }
  if (businessRegistrationNumber.length !== 10) {
    throw new Error("사업자등록번호 숫자 10자리를 입력해 주세요.");
  }
  if (phone.length < 9 || phone.length > 11) {
    throw new Error("연락처를 정확히 입력해 주세요.");
  }
  if (input.sellerTermsAccepted !== true) {
    throw new Error("판매자 운영 정책에 동의해 주세요.");
  }

  return {
    ...credentials,
    sellerProfile: {
      partnerName,
      representativeName,
      businessRegistrationNumber,
      phone,
    },
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
    sellerApproved: isApprovedSeller(user),
  };
}

function publicReservation(reservation) {
  return {
    id: reservation.id,
    productId: reservation.productId,
    name: reservation.name,
    activity: reservation.activity,
    venue: reservation.venue,
    date: reservation.date,
    time: reservation.time || "",
    people: reservation.people,
    status: reservation.status,
    signatureStatus: reservation.signatureStatus,
    createdAt: reservation.createdAt,
    updatedAt: reservation.updatedAt,
    signedAt: reservation.signedAt,
    cancellationRequestedAt: reservation.cancellationRequestedAt ?? "",
    sellerCancelledAt: reservation.sellerCancelledAt ?? "",
    cancellationNoticePending:
      (reservation.status === "CANCELLED" &&
        !reservation.buyerCancellationAcknowledgedAt) ||
      (reservation.status === "SELLER_CANCELLED" &&
        !reservation.sellerCancellationAcknowledgedAt),
    sellerCancellationNoticePending:
      reservation.status === "SELLER_CANCELLED" &&
      !reservation.sellerCancellationAcknowledgedAt,
    contractNotificationPending:
      ["CONTRACT_PENDING", "SIGNING", "PROCESSING_FAILED"].includes(
        reservation.status,
      ) && !reservation.contractNotificationReadAt,
    documentAvailable:
      Boolean(reservation.documentId) &&
      (["COMPLETED", "CANCELLATION_REQUESTED"].includes(
        reservation.status,
      ) ||
        (reservation.status === "SELLER_CANCELLED" &&
          reservation.signatureStatus === "COMPLETED")),
  };
}

function publicSellerPost(post) {
  return {
    id: post.id,
    title: post.title,
    partnerName: post.partnerName,
    category: post.category,
    region: post.region,
    location: post.location,
    pricePerPerson: post.pricePerPerson,
    durationMinutes: post.durationMinutes,
    difficulty: post.difficulty,
    thrillLevel: post.thrillLevel,
    physicalIntensity: post.physicalIntensity,
    swimmingRequired: post.swimmingRequired,
    minAge: post.minAge,
    maxParticipants: post.maxParticipants,
    description: post.description,
    suitableFor: post.suitableFor || [],
    moods: post.moods || [],
    included: post.included || [],
    availableDays: post.availableDays || [],
    timeSlots: post.timeSlots || [],
    languages: post.languages || [],
    weatherDependency: post.weatherDependency,
    waiverRequired: post.waiverRequired,
    refundPolicy: post.refundPolicy,
    termsAndConditions: post.termsAndConditions || "",
    participantRequirements: post.participantRequirements || [],
    safetyNotes: post.safetyNotes || [],
    thumbnailImage: post.thumbnailImage || "",
    detailImages: post.detailImages || [],
    status: post.status,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

function createSellerContractRecord({ user, reservation, post, status, now }) {
  return {
    id: randomBytes(16).toString("hex"),
    userId: user.id,
    reservationId: reservation.id,
    postId: post.id,
    postTitle: post.title,
    customerName: reservation.name,
    customerEmail: reservation.email,
    reservationDate: reservation.date,
    reservationTime: reservation.time || "",
    people: Number(reservation.people),
    documentId: "",
    deliveryMode: "",
    status,
    error: "",
    createdAt: now,
    updatedAt: now,
  };
}

function createSellerContractDraft(reservation, post) {
  const productContent = getProductContent(post.id);
  const productContract = productContent.contract || {};
  const generatedAdditionalClauses = [
    ...(Array.isArray(productContract.additionalClauses)
      ? productContract.additionalClauses
      : []),
    ...(post.participantRequirements || []),
  ].filter(Boolean);

  return normalizeSellerContractDraft({
    title: `${reservation.date}_${post.title}_${reservation.name}`,
    termsAndConditions:
      post.termsAndConditions ||
      productContract.story?.join("\n") ||
      post.description ||
      "",
    refundPolicy: post.refundPolicy || "",
    safetyNotes: (post.safetyNotes || []).join("\n"),
    additionalClauses: generatedAdditionalClauses.join("\n"),
    sellerMessage: "",
  });
}

function normalizeSellerContractDraft(input = {}, fallback = {}) {
  const source = input && typeof input === "object" ? input : {};
  const previous = fallback && typeof fallback === "object" ? fallback : {};
  const readDraftText = (key, maxLength) =>
    cleanText(source[key] ?? previous[key] ?? "", maxLength);

  const draft = {
    title: readDraftText("title", 100),
    termsAndConditions: readDraftText("termsAndConditions", 1000),
    refundPolicy: readDraftText("refundPolicy", 1000),
    safetyNotes: readDraftText("safetyNotes", 1000),
    additionalClauses: readDraftText("additionalClauses", 1000),
    sellerMessage: readDraftText("sellerMessage", 1000),
  };
  if (!draft.title) {
    throw new Error("계약서 제목을 입력해 주세요.");
  }
  return draft;
}

function publicSellerContract(contract) {
  return {
    id: contract.id,
    reservationId: contract.reservationId || "",
    postId: contract.postId,
    postTitle: contract.postTitle,
    customerName: contract.customerName,
    customerEmail: contract.customerEmail,
    reservationDate: contract.reservationDate,
    reservationTime: contract.reservationTime || "",
    people: contract.people,
    documentId: contract.documentId,
    deliveryMode: contract.deliveryMode || "",
    selectedTemplateKey: contract.selectedTemplateKey || "product-default",
    selectedTemplateKeys: Array.isArray(contract.selectedTemplateKeys)
      ? contract.selectedTemplateKeys
      : [],
    selectedTemplateId: contract.selectedTemplateId || "",
    selectedTemplateTitle: contract.selectedTemplateTitle || "상품 기본 계약서 묶음",
    embeddedDraftId: contract.embeddedDraftId || "",
    embeddedDraftExpiry: contract.embeddedDraftExpiry || "",
    status: contract.status,
    error: contract.error,
    draft: contract.draft
      ? normalizeSellerContractDraft(contract.draft, contract.draft)
      : null,
    createdAt: contract.createdAt,
    updatedAt: contract.updatedAt,
  };
}

function publicSellerReservation(reservation, sellerUserId) {
  const contract = sellerContracts.find(
    (item) =>
      item.userId === sellerUserId && item.reservationId === reservation.id,
  );

  return {
    id: reservation.id,
    productId: reservation.productId || "",
    name: reservation.name,
    email: reservation.email,
    activity: reservation.activity,
    venue: reservation.venue,
    date: reservation.date,
    time: reservation.time || "",
    people: reservation.people,
    status: reservation.status,
    sellerCancelledAt: reservation.sellerCancelledAt ?? "",
    cancellationNoticePending:
      ["CANCELLED", "SELLER_CANCELLED"].includes(reservation.status) &&
      !reservation.sellerAcknowledgedCancellationAt,
    contract: contract ? publicSellerContract(contract) : null,
    createdAt: reservation.createdAt,
  };
}

function findSellerPostForReservation(reservation, sellerUserId) {
  return sellerPosts.find(
    (post) =>
      post.userId === sellerUserId &&
      post.status === "PUBLISHED" &&
      (post.id === reservation.productId || post.title === reservation.activity),
  );
}

function sellerOwnsReservation(reservation, sellerUserId) {
  if (reservation.sellerUserId) {
    return reservation.sellerUserId === sellerUserId;
  }

  return Boolean(findSellerPostForReservation(reservation, sellerUserId));
}

function sellerPostAsProduct(post) {
  return {
    id: post.id,
    name: post.title,
    partnerName: post.partnerName,
    category: post.category,
    region: post.region,
    location: post.location || post.region,
    description: post.description,
    pricePerPerson: post.pricePerPerson,
    durationMinutes: post.durationMinutes,
    difficulty: post.difficulty || 2,
    thrillLevel: post.thrillLevel || 2,
    physicalIntensity: post.physicalIntensity || 2,
    swimmingRequired: post.swimmingRequired === true,
    minAge: post.minAge || 8,
    maxParticipants: post.maxParticipants,
    suitableFor: post.suitableFor?.length
      ? post.suitableFor
      : ["혼자", "친구", "연인", "가족"],
    moods: post.moods?.length ? post.moods : ["도전", "휴식"],
    included: post.included || [],
    availableDays: post.availableDays?.length
      ? post.availableDays
      : ["월", "화", "수", "목", "금", "토", "일"],
    timeSlots: post.timeSlots || [],
    languages: post.languages?.length ? post.languages : ["ko"],
    weatherDependency: post.weatherDependency || "medium",
    rating: 0,
    reviewCount: 0,
    waiverRequired: post.waiverRequired !== false,
    refundPolicy: post.refundPolicy || "",
    termsAndConditions: post.termsAndConditions || "",
    participantRequirements: post.participantRequirements || [],
    safetyNotes: post.safetyNotes || [],
    thumbnailImage: post.thumbnailImage || "",
    detailImages: post.detailImages || [],
    contractTemplateKeys: getSellerContractTemplateKeys(post.category),
    sellerCreated: true,
  };
}

function getSellerContractTemplateKeys(category) {
  const categoryProduct = products.find(
    (product) =>
      product.category === category &&
      Array.isArray(product.contractTemplateKeys) &&
      product.contractTemplateKeys.length,
  );

  return categoryProduct
    ? [...categoryProduct.contractTemplateKeys]
    : [
        "reservationTerms",
        "privacyConsent",
        "marineSafety",
        "refundPolicy",
        "weatherSchedule",
      ];
}

function createLocalContractRecommendations(post) {
  const activityText = [
    post.title,
    post.category,
    post.description,
    post.termsAndConditions,
    post.refundPolicy,
    ...(post.included || []),
    ...(post.safetyNotes || []),
    ...(post.participantRequirements || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const recommendations = new Map();
  const add = (key, priority, reason, selected = true) => {
    if (!contractTemplates[key]) return;
    recommendations.set(key, {
      key,
      title: contractTemplateLabels[key] || key,
      priority,
      reason,
      selected,
      ruleRequired: priority === "required",
    });
  };

  add("reservationTerms", "required", "모든 예약의 이용 조건과 당사자 확인에 필요합니다.");
  add("privacyConsent", "required", "예약자 이름과 이메일 등 개인정보를 처리합니다.");
  add("marineSafety", "required", "해양레저 활동의 기본 안전수칙 확인이 필요합니다.");
  add("refundPolicy", "required", "취소와 환불 조건을 예약 전에 명확히 확인해야 합니다.");

  const weatherPriority = post.weatherDependency === "high" ? "required" : "recommended";
  add(
    "weatherSchedule",
    weatherPriority,
    post.weatherDependency === "high"
      ? "기상 상태가 운영 여부와 일정에 직접 영향을 주는 상품입니다."
      : "해양 활동은 기상 상황에 따라 일정이 달라질 수 있습니다.",
    post.weatherDependency !== "low",
  );

  const usesEquipment =
    /(장비|보드|카약|패들|서핑|잠수|다이빙|스쿠버|제트스키|수상스키|낚시)/.test(
      activityText,
    ) || (post.included || []).length > 0;
  add(
    "equipmentLiability",
    "recommended",
    "대여 장비의 사용·파손·분실 책임을 확인하는 데 도움이 됩니다.",
    usesEquipment,
  );

  const usesVessel = /(요트|보트|선박|크루즈|낚시|제트스키|바나나보트)/.test(
    activityText,
  );
  add(
    "vesselSafety",
    usesVessel ? "required" : "optional",
    usesVessel
      ? "선박 또는 동력수상레저기구 탑승 안전 확인이 필요합니다."
      : "선박을 이용하는 일정이 포함될 때 선택하세요.",
    usesVessel,
  );

  const isScuba = /(스쿠버|다이빙|잠수|프리다이빙)/.test(activityText);
  add(
    "scubaHealth",
    isScuba ? "required" : "optional",
    isScuba
      ? "수중 활동 전 건강 상태와 참여 제한 사항을 확인해야 합니다."
      : "수중 잠수 활동이 포함될 때 선택하세요.",
    isScuba,
  );

  const allowsMinors = Number(post.minAge || 0) > 0 && Number(post.minAge) < 18;
  add(
    "minorGuardian",
    allowsMinors ? "required" : "optional",
    allowsMinors
      ? `최소 참여 연령이 ${post.minAge}세이므로 미성년자 예약 가능성이 있습니다.`
      : "미성년자가 참여하는 예약에만 선택하세요.",
    allowsMinors,
  );

  const includesPhotography = /(사진|영상|촬영|카메라|스냅)/.test(activityText);
  add(
    "photoVideoConsent",
    "optional",
    includesPhotography
      ? "상품 설명에 사진 또는 영상 촬영이 포함되어 있습니다. 활용 동의가 필요할 수 있습니다."
      : "홍보용 사진·영상을 촬영하거나 활용할 때만 선택하세요.",
    includesPhotography,
  );

  return [...recommendations.values()];
}

async function requestSolarContractRecommendations(post, localRecommendations) {
  const apiKey = process.env.UPSTAGE_API_KEY?.trim();
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const apiResponse = await fetch("https://api.upstage.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "solar-pro3",
        temperature: 0,
        max_tokens: 1800,
        messages: [
          {
            role: "system",
            content:
              "당신은 해양레저 전자계약 템플릿 분류 도우미입니다. 제공된 템플릿 key만 사용할 수 있습니다. 법률 자문이나 새 계약 조항을 작성하지 말고, 상품 정보에 근거해 템플릿의 필요도와 짧은 이유만 JSON으로 반환하세요. 기본 규칙에서 required인 항목은 반드시 selected=true, priority=required로 유지하세요.",
          },
          {
            role: "user",
            content: buildSolarContractRecommendationPrompt(post, localRecommendations),
          },
        ],
      }),
      signal: controller.signal,
    });
    if (!apiResponse.ok) {
      throw new Error(`Solar API 응답 오류 (${apiResponse.status})`);
    }
    const apiResult = await apiResponse.json();
    const content = apiResult.choices?.[0]?.message?.content;
    if (!content) throw new Error("Solar 응답에 계약서 추천 내용이 없습니다.");
    return parseSolarContractRecommendations(content);
  } catch (error) {
    console.error("Solar 계약서 추천 연결 오류:", error.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function buildSolarContractRecommendationPrompt(post, localRecommendations) {
  const product = {
    title: post.title,
    category: post.category,
    description: post.description,
    difficulty: post.difficulty,
    thrillLevel: post.thrillLevel,
    physicalIntensity: post.physicalIntensity,
    swimmingRequired: post.swimmingRequired,
    minAge: post.minAge,
    maxParticipants: post.maxParticipants,
    weatherDependency: post.weatherDependency,
    included: post.included || [],
    refundPolicy: post.refundPolicy || "",
    termsAndConditions: post.termsAndConditions || "",
    participantRequirements: post.participantRequirements || [],
    safetyNotes: post.safetyNotes || [],
  };
  return `
상품 정보:
${JSON.stringify(product, null, 2)}

선택 가능한 템플릿과 기본 규칙:
${JSON.stringify(localRecommendations, null, 2)}

아래 JSON 형식만 반환하세요. recommendations에는 제공된 모든 template key를 한 번씩 포함하세요.
{
  "recommendations": [
    {
      "key": "제공된 template key",
      "priority": "required 또는 recommended 또는 optional",
      "selected": true,
      "reason": "상품 데이터에 근거한 쉬운 한국어 한 문장"
    }
  ]
}`;
}

function parseSolarContractRecommendations(content) {
  const parsed = parseSolarJson(content);
  const validPriorities = new Set(["required", "recommended", "optional"]);
  const usedKeys = new Set();
  return (Array.isArray(parsed?.recommendations) ? parsed.recommendations : [])
    .filter((item) => contractTemplates[item?.key] && !usedKeys.has(item.key))
    .map((item) => {
      usedKeys.add(item.key);
      return {
        key: item.key,
        priority: validPriorities.has(item.priority)
          ? item.priority
          : "optional",
        selected: item.selected === true,
        reason: cleanText(item.reason, 180),
      };
    });
}

function mergeContractRecommendations(localRecommendations, solarRecommendations) {
  const solarMap = new Map(
    (solarRecommendations || []).map((item) => [item.key, item]),
  );
  const priorityOrder = { required: 0, recommended: 1, optional: 2 };
  return localRecommendations
    .map((local) => {
      const solar = solarMap.get(local.key);
      if (!solar || local.ruleRequired) return local;
      return {
        ...local,
        priority: solar.priority,
        selected: solar.selected,
        reason: solar.reason || local.reason,
      };
    })
    .sort(
      (left, right) =>
        priorityOrder[left.priority] - priorityOrder[right.priority] ||
        Number(right.selected) - Number(left.selected),
    );
}

function getAllProducts() {
  return [
    ...products,
    ...sellerPosts
      .filter((post) => post.status === "PUBLISHED")
      .map(sellerPostAsProduct),
  ];
}

function getProductContent(productId) {
  const product =
    getAllProducts().find((item) => item.id === productId) || null;
  if (!product) {
    return { product: null, detail: null, contract: null };
  }

  const detail =
    productDetails[productId] ||
    (product.sellerCreated
      ? {
          promotion: product.description,
          highlights: product.included?.length
            ? product.included
            : ["판매자가 직접 등록한 WAVEON 파트너 상품"],
          refundRules: product.refundPolicy ? [product.refundPolicy] : [],
          bookingConditions: product.participantRequirements || [],
        }
      : null);
  const contract =
    productContracts[productId] ||
    (product.sellerCreated
      ? {
          riskLevel: "확인필요",
          story: [product.description],
          itinerary: [
            `운영 요일: ${(product.availableDays || []).join(" · ")}`,
            `운영 시간: ${(product.timeSlots || []).join(" · ") || "예약 후 협의"}`,
          ],
          additionalClauses: [
            product.termsAndConditions,
            ...(product.safetyNotes || []),
          ].filter(Boolean),
        }
      : null);

  return { product, detail, contract };
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

function isApprovedSeller(user) {
  return Boolean(
    user &&
      (user.sellerApproved === true ||
        sellerPosts.some((post) => post.userId === user.id)),
  );
}

function requireSellerUser(request, response) {
  const user = requireAuthenticatedUser(request, response);
  if (!user) return null;
  if (!isApprovedSeller(user)) {
    response.status(403).json({
      code: "SELLER_ACCOUNT_REQUIRED",
      message: "판매자로 등록된 계정만 판매자 센터를 이용할 수 있습니다.",
    });
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

function cleanTextList(value, maxItems, maxItemLength) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => cleanText(item, maxItemLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function cleanSellerImageUrl(value) {
  const imageUrl = cleanText(value, 120);
  return /^\/seller-images\/[a-f0-9]{32}\.(jpg|png|webp)$/.test(imageUrl)
    ? imageUrl
    : "";
}

function detectSellerImageType(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return "";
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  return "";
}

function normalizeSellerPost(input = {}) {
  const post = {
    title: cleanText(input.title, 100),
    partnerName: cleanText(input.partnerName, 60),
    category: cleanText(input.category, 20),
    region: cleanText(input.region, 20),
    location: cleanText(input.location, 100),
    pricePerPerson: Number(input.pricePerPerson),
    durationMinutes: Number(input.durationMinutes),
    difficulty: Number(input.difficulty),
    thrillLevel: Number(input.thrillLevel),
    physicalIntensity: Number(input.physicalIntensity),
    swimmingRequired: input.swimmingRequired === true,
    minAge: Number(input.minAge),
    maxParticipants: Number(input.maxParticipants),
    description: cleanText(input.description, 800),
    suitableFor: cleanTextList(input.suitableFor, 8, 20),
    moods: cleanTextList(input.moods, 12, 30),
    included: cleanTextList(input.included, 20, 80),
    availableDays: cleanTextList(input.availableDays, 7, 4),
    timeSlots: cleanTextList(input.timeSlots, 12, 10),
    languages: cleanTextList(input.languages, 8, 10),
    weatherDependency: ["low", "medium", "high"].includes(
      input.weatherDependency,
    )
      ? input.weatherDependency
      : "medium",
    waiverRequired: input.waiverRequired === true,
    refundPolicy: cleanText(input.refundPolicy, 500),
    termsAndConditions: cleanText(input.termsAndConditions, 2000),
    participantRequirements: cleanTextList(
      input.participantRequirements,
      12,
      160,
    ),
    safetyNotes: cleanTextList(input.safetyNotes, 12, 160),
    thumbnailImage: cleanSellerImageUrl(input.thumbnailImage),
    detailImages: cleanTextList(input.detailImages, 6, 120)
      .map(cleanSellerImageUrl)
      .filter(Boolean),
  };

  if (
    !post.title ||
    !post.partnerName ||
    !post.category ||
    !post.region ||
    !post.location ||
    !post.description
  ) {
    throw new Error(
      "상품명, 업체명, 카테고리, 지역, 상세 위치와 소개를 입력해 주세요.",
    );
  }
  if (
    !Number.isInteger(post.pricePerPerson) ||
    post.pricePerPerson < 1000 ||
    post.pricePerPerson > 5000000
  ) {
    throw new Error("1인 가격은 1천원에서 500만원 사이로 입력해 주세요.");
  }
  if (
    !Number.isInteger(post.durationMinutes) ||
    post.durationMinutes < 10 ||
    post.durationMinutes > 1440
  ) {
    throw new Error("이용 시간은 10분에서 1440분 사이로 입력해 주세요.");
  }
  if (
    !Number.isInteger(post.minAge) ||
    post.minAge < 0 ||
    post.minAge > 100
  ) {
    throw new Error("최소 이용 나이는 0세에서 100세 사이로 입력해 주세요.");
  }
  if (
    !Number.isInteger(post.maxParticipants) ||
    post.maxParticipants < 1 ||
    post.maxParticipants > 100
  ) {
    throw new Error("최대 인원은 1명에서 100명 사이로 입력해 주세요.");
  }
  for (const [value, label] of [
    [post.difficulty, "난이도"],
    [post.thrillLevel, "스릴 정도"],
    [post.physicalIntensity, "활동 강도"],
  ]) {
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new Error(`${label}는 1단계에서 5단계 사이로 선택해 주세요.`);
    }
  }
  if (!post.availableDays.length) {
    throw new Error("이용 가능한 요일을 한 개 이상 선택해 주세요.");
  }
  if (!post.languages.length) {
    throw new Error("지원 언어를 한 개 이상 선택해 주세요.");
  }
  if (!post.refundPolicy || !post.termsAndConditions) {
    throw new Error("환불·취소 정책과 상품 이용 약관을 입력해 주세요.");
  }

  return post;
}

function normalizeSellerContract(input = {}) {
  const contract = {
    postId: cleanText(input.postId, 100),
    customerName: cleanText(input.customerName, 30),
    customerEmail: cleanText(input.customerEmail, 100).toLowerCase(),
    reservationDate: cleanText(input.reservationDate, 20),
    people: Number(input.people),
  };

  if (!contract.postId || !contract.customerName || !contract.reservationDate) {
    throw new Error("상품, 고객명과 이용 날짜를 확인해 주세요.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contract.customerEmail)) {
    throw new Error("계약서를 받을 고객 이메일을 정확히 입력해 주세요.");
  }
  if (
    !Number.isInteger(contract.people) ||
    contract.people < 1 ||
    contract.people > 100
  ) {
    throw new Error("예약 인원은 1명에서 100명 사이로 입력해 주세요.");
  }

  return contract;
}

function normalizeBooking(input = {}) {
  const booking = {
    name: cleanText(input.name, 30), email: cleanText(input.email, 100),
    productId: cleanText(input.productId, 30),
    activity: cleanText(input.activity, 120), venue: cleanText(input.venue, 100),
    date: cleanText(input.date, 20), time: cleanText(input.time, 10),
    people: cleanText(input.people, 10),
  };
  if (
    !booking.name ||
    !booking.email ||
    !booking.activity ||
    !booking.date ||
    !booking.time
  ) {
    throw new Error("예약자 정보와 이용 날짜·시간을 확인해 주세요.");
  }
  return booking;
}

function modusignAuthorization() {
  const email = process.env.MODUSIGN_EMAIL?.trim();
  const apiKey = process.env.MODUSIGN_API_KEY?.trim();
  if (!email || !apiKey) {
    throw new Error(".env에 모두싸인 이메일과 API 키를 입력해 주세요.");
  }
  return `Basic ${Buffer.from(`${email}:${apiKey}`).toString("base64")}`;
}

async function requestModusign(pathname, options = {}, retryAttempt = 0) {
  const headers = {
    Accept: "application/json",
    Authorization: modusignAuthorization(),
    ...(options.headers ?? {}),
  };
  let apiResponse;
  try {
    apiResponse = await fetch(`https://api.modusign.co.kr${pathname}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("모두싸인 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
  const result = await apiResponse.json().catch(() => ({}));
  if (!apiResponse.ok) {
    if (apiResponse.status === 429 && retryAttempt < 1) {
      const retryAfterHeader =
        apiResponse.headers.get("x-retry-after") ||
        apiResponse.headers.get("retry-after");
      const retryAfterSeconds = Math.min(
        Math.max(
          Number.parseInt(retryAfterHeader || "", 10) ||
            2 ** (retryAttempt + 1),
          1,
        ),
        10,
      );
      await new Promise((resolve) =>
        setTimeout(resolve, retryAfterSeconds * 1000),
      );
      return requestModusign(pathname, options, retryAttempt + 1);
    }
    if (apiResponse.status === 403) {
      throw new Error(
        "모두싸인 API 사용량 또는 템플릿 접근 권한을 확인해 주세요.",
      );
    }
    if (apiResponse.status === 429) {
      const retryAfter = apiResponse.headers.get("retry-after");
      const retryMessage = retryAfter
        ? ` 약 ${retryAfter}초 후 다시 시도해 주세요.`
        : " 잠시 후 다시 시도해 주세요.";
      throw new Error(
        `모두싸인 요청이 너무 많습니다.${retryMessage}`,
      );
    }
    throw new Error(
      result.message || `모두싸인 요청 오류 (${apiResponse.status})`,
    );
  }
  return result;
}

async function extractModusignDocumentText(document, reservation) {
  const downloadUrl = document.file?.downloadUrl;
  if (!downloadUrl) {
    throw new Error("모두싸인 문서의 PDF 다운로드 주소를 찾지 못했습니다.");
  }

  const apiKey = process.env.UPSTAGE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("실제 계약서 AI 분석을 위해 .env에 UPSTAGE_API_KEY를 입력해 주세요.");
  }

  const pdfResponse = await fetch(downloadUrl, {
    headers: { Authorization: modusignAuthorization() },
  });
  if (!pdfResponse.ok) {
    throw new Error("모두싸인 계약서 PDF를 내려받지 못했습니다.");
  }

  const bytes = new Uint8Array(await pdfResponse.arrayBuffer());
  if (bytes.byteLength === 0 || bytes.byteLength > 50 * 1024 * 1024) {
    throw new Error("계약서 PDF 파일 크기를 확인해 주세요.");
  }

  const formData = new FormData();
  formData.append(
    "document",
    new Blob([bytes], { type: "application/pdf" }),
    "modusign-contract.pdf",
  );
  formData.append("model", "document-parse");
  formData.append("ocr", "force");
  formData.append("output_formats", '["html"]');

  let parseResponse;
  try {
    parseResponse = await fetch("https://api.upstage.ai/v1/document-digitization", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });
  } catch {
    throw new Error("Upstage Document Parse 서버에 연결하지 못했습니다.");
  }

  const parsedDocument = await parseResponse.json().catch(() => ({}));
  if (!parseResponse.ok) {
    throw new Error(
      parsedDocument.message ||
        `Upstage Document Parse 오류 (${parseResponse.status})`,
    );
  }

  const parsedContent = getDocumentParseContent(parsedDocument);
  const text = redactContractPersonalData(parsedContent, reservation);
  if (text.length < 40) {
    throw new Error("계약서에서 읽을 수 있는 약관 텍스트를 찾지 못했습니다.");
  }
  return text.slice(0, 28000);
}

function getDocumentParseContent(parsedDocument) {
  const content = parsedDocument.content ?? {};
  const directContent = [content.html, content.markdown, content.text].find(
    (value) => typeof value === "string" && value.trim(),
  );
  if (directContent) return directContent;

  return (parsedDocument.elements ?? [])
    .map((element) => {
      const elementContent = element?.content ?? {};
      return [
        elementContent.html,
        elementContent.markdown,
        elementContent.text,
      ].find((value) => typeof value === "string" && value.trim()) ?? "";
    })
    .filter(Boolean)
    .join("\n");
}

function redactContractPersonalData(text, reservation) {
  let redacted = cleanText(text, 50000);
  const knownValues = [reservation.name, reservation.email]
    .filter(Boolean)
    .sort((first, second) => second.length - first.length);
  knownValues.forEach((value) => {
    redacted = redacted.replaceAll(value, "[개인정보]");
  });
  return redacted
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[이메일]")
    .replace(/(?:\+82[- ]?)?01[0-9][- ]?\d{3,4}[- ]?\d{4}/g, "[연락처]")
    .replace(/\b\d{6}[- ]?[1-4]\d{6}\b/g, "[식별번호]");
}

function rememberModusignDocument(document) {
  if (!document?.id) return document;
  modusignDocumentCache.set(document.id, {
    document,
    expiresAt: Date.now() + modusignDocumentCacheDurationMs,
  });
  return document;
}

function forgetModusignDocument(documentId) {
  modusignDocumentCache.delete(documentId);
  modusignDocumentRequests.delete(documentId);
}

async function getModusignDocument(documentId, { force = false } = {}) {
  const cached = modusignDocumentCache.get(documentId);
  if (!force && cached?.expiresAt > Date.now()) {
    return cached.document;
  }

  const pendingRequest = modusignDocumentRequests.get(documentId);
  if (pendingRequest) return pendingRequest;

  const request = requestModusign(`/documents/${documentId}`)
    .then(rememberModusignDocument)
    .finally(() => {
      modusignDocumentRequests.delete(documentId);
    });
  modusignDocumentRequests.set(documentId, request);
  return request;
}

async function getModusignTemplate(templateId) {
  const cached = modusignTemplateCache.get(templateId);
  if (cached?.expiresAt > Date.now()) return cached.template;

  const pendingRequest = modusignTemplateRequests.get(templateId);
  if (pendingRequest) return pendingRequest;

  const request = requestModusign(`/templates/${templateId}`)
    .then((template) => {
      modusignTemplateCache.set(templateId, {
        template,
        expiresAt: Date.now() + modusignTemplateCacheDurationMs,
      });
      return template;
    })
    .finally(() => {
      modusignTemplateRequests.delete(templateId);
    });
  modusignTemplateRequests.set(templateId, request);
  return request;
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
  const document = await getModusignDocument(reservation.documentId);
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
  const { templateId, template } = await getContractTemplateForBooking(booking);
  const role = findModusignSignerRole(template, { useConfiguredRole: false });

  const document = await requestModusign("/documents/request-with-template", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      templateId,
      document: {
        title: `${booking.date}_${booking.time || "시간미정"}_${booking.activity}_${booking.name}`,
        participantMappings: [{ role, name: booking.name, signingMethod: { type: "SECURE_LINK", value: booking.email } }],
      },
    }),
  });
  return rememberModusignDocument(document);
}

async function getContractTemplateForBooking(booking) {
  const product = findProductForBooking(booking);
  if (!product) {
    throw new Error("예약 상품을 찾지 못했습니다. 상품을 다시 선택해 주세요.");
  }

  return getContractTemplateForProduct(product);
}

async function getContractTemplateForProduct(product) {
  const templateKeys = Array.isArray(product.contractTemplateKeys)
    ? product.contractTemplateKeys
    : [];
  if (!templateKeys.length) {
    throw new Error("이 상품에 연결된 계약서가 없습니다.");
  }
  if (templateKeys.length > 12) {
    throw new Error("한 번에 서명할 수 있는 계약서는 최대 12개입니다.");
  }

  const templateIds = templateKeys.map((key) => contractTemplates[key]);
  const missingKey = templateKeys.find((key, index) => !templateIds[index]);
  if (missingKey) {
    throw new Error(`계약서 설정(${missingKey})에 템플릿 ID가 없습니다.`);
  }

  if (templateIds.length === 1) {
    const template = await getModusignTemplate(templateIds[0]);
    return { templateId: templateIds[0], template };
  }

  const mergedTemplateKey = templateIds.join("|");
  const cachedMergedTemplate = modusignMergedTemplateCache.get(mergedTemplateKey);
  if (cachedMergedTemplate) return cachedMergedTemplate;

  const pendingMergedTemplate =
    modusignMergedTemplateRequests.get(mergedTemplateKey);
  if (pendingMergedTemplate) return pendingMergedTemplate;

  const mergedTemplateRequest = (async () => {
    const mergedTemplate = await requestModusign("/templates/merge", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        sources: templateIds.map((templateId) => ({
          type: "TEMPLATE",
          templateId,
        })),
      }),
    });
    const templateId = getTemplateId(mergedTemplate);
    if (!templateId) {
      throw new Error("병합된 계약서의 템플릿 ID를 받지 못했습니다.");
    }

    const template = hasSignerRole(mergedTemplate)
      ? mergedTemplate
      : await getModusignTemplate(templateId);
    const result = { templateId, template };
    modusignMergedTemplateCache.set(mergedTemplateKey, result);
    return result;
  })().finally(() => {
    modusignMergedTemplateRequests.delete(mergedTemplateKey);
  });

  modusignMergedTemplateRequests.set(
    mergedTemplateKey,
    mergedTemplateRequest,
  );
  return mergedTemplateRequest;
}

function normalizeSelectedTemplateKeys(value) {
  if (!Array.isArray(value)) return [];
  const uniqueKeys = [...new Set(value.map((key) => cleanText(key, 80)))].filter(
    (key) => contractTemplates[key],
  );
  if (uniqueKeys.length > 12) {
    throw new Error("한 번에 선택할 수 있는 계약 템플릿은 최대 12개입니다.");
  }
  return uniqueKeys;
}

async function getSellerSelectedTemplate(templateKey, post, templateKeys = []) {
  const selectedTemplateKeys = normalizeSelectedTemplateKeys(templateKeys);
  if (selectedTemplateKeys.length) {
    const selected = await getContractTemplateForProduct({
      contractTemplateKeys: selectedTemplateKeys,
    });
    return {
      ...selected,
      title: `AI 추천 계약서 ${selectedTemplateKeys.length}종`,
    };
  }
  if (templateKey === "product-default") {
    const selected = await getContractTemplateForProduct(sellerPostAsProduct(post));
    return {
      ...selected,
      title: "상품 기본 계약서 묶음",
    };
  }

  const templateId = contractTemplates[templateKey];
  if (!templateId) {
    throw new Error("선택한 계약 템플릿을 데이터 파일에서 찾지 못했습니다.");
  }
  const template = await getModusignTemplate(templateId);
  return {
    templateId,
    template,
    title: contractTemplateLabels[templateKey] || templateKey,
  };
}

function findProductForBooking(booking) {
  const allProducts = getAllProducts();
  return (
    allProducts.find((product) => product.id === booking.productId) ??
    allProducts.find((product) => product.name === booking.activity)
  );
}

function getTemplateId(template) {
  return [
    template?.id,
    template?.templateId,
    template?.template?.id,
    template?.template?.templateId,
  ].find((value) => typeof value === "string" && value.trim())?.trim();
}

function hasSignerRole(template) {
  return [template, template?.template].some((item) =>
    Array.isArray(item?.participants) && item.participants.length > 0,
  );
}

function getTemplateRequesterInputs(template) {
  return [
    ...(Array.isArray(template?.requesterInputs) ? template.requesterInputs : []),
    ...(Array.isArray(template?.template?.requesterInputs)
      ? template.template.requesterInputs
      : []),
  ];
}

function sellerDraftValueForDataLabel(dataLabel, contract) {
  const label = String(dataLabel || "").replaceAll(/\s/g, "").toLowerCase();
  const draft = contract.draft || {};
  const additionalText = [draft.additionalClauses, draft.sellerMessage]
    .filter(Boolean)
    .join("\n");

  if (/상품명|체험명|서비스명|활동명/.test(label)) return contract.postTitle;
  if (/예약자|고객명|고객성명|신청자/.test(label)) return contract.customerName;
  if (/이메일|전자우편/.test(label)) return contract.customerEmail;
  if (/예약일|이용일|체험일|계약일/.test(label)) return contract.reservationDate;
  if (/예약시간|이용시간|체험시간/.test(label)) return contract.reservationTime || "";
  if (/인원|참가자수|이용자수/.test(label)) return String(contract.people);
  if (/환불|취소규정|취소정책/.test(label)) return draft.refundPolicy;
  if (/안전|주의사항|유의사항/.test(label)) return draft.safetyNotes;
  if (/이용약관|계약조건|계약내용|약관/.test(label)) return draft.termsAndConditions;
  if (/특약|추가조항|추가사항|특이사항|판매자메모|전달사항/.test(label)) {
    return additionalText;
  }
  return "";
}

function buildSellerRequesterInputMappings(template, contract) {
  const mappedLabels = new Set();
  return getTemplateRequesterInputs(template).flatMap((input) => {
    const dataLabel = cleanText(input?.dataLabel, 100);
    if (!dataLabel || mappedLabels.has(dataLabel) || input?.type !== "TEXT") return [];
    const value = cleanText(sellerDraftValueForDataLabel(dataLabel, contract), 1000);
    if (!value) return [];
    mappedLabels.add(dataLabel);
    return [{ dataLabel, value }];
  });
}

async function deliverSellerContract(contract, post) {
  const { templateId, template, title } = await getSellerSelectedTemplate(
    contract.selectedTemplateKey || "product-default",
    post,
    contract.selectedTemplateKeys,
  );
  const role = findModusignSignerRole(template, { useConfiguredRole: false });
  const requesterInputMappings = buildSellerRequesterInputMappings(
    template,
    contract,
  );
  const document = rememberModusignDocument(
    await requestModusign("/documents/request-with-template", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        templateId,
        document: {
          title:
            contract.draft?.title ||
            `${contract.reservationDate}_${post.title}_${contract.customerName}`,
          ...(requesterInputMappings.length ? { requesterInputMappings } : {}),
          participantMappings: [
            {
              role,
              name: contract.customerName,
              signingMethod: {
                type: "SECURE_LINK",
                value: contract.customerEmail,
              },
            },
          ],
          carbonCopies: [
            {
              contact: contract.customerEmail,
              locale: "ko",
            },
          ],
        },
      }),
    }),
  );

  contract.documentId = document.id || "";
  contract.selectedTemplateId = templateId;
  contract.selectedTemplateTitle = title;
  contract.deliveryMode = "WEB_AND_EMAIL";
  contract.status = document.status || "SENT";
  contract.error = "";
  contract.updatedAt = new Date().toISOString();
  await saveSellerContracts();
  return document;
}

async function prepareSellerContractForUnifiedResend(contract) {
  if (!contract.documentId) return;

  const previousDocumentId = contract.documentId;
  const previousDocument = await getModusignDocument(previousDocumentId);
  if (previousDocument.status === "COMPLETED") {
    throw new Error("이미 서명이 완료된 계약서는 다시 발송할 수 없습니다.");
  }

  if (!['ABORTED', 'PROCESSING_FAILED'].includes(previousDocument.status)) {
    await requestModusign(`/documents/${previousDocumentId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: "웹 알림과 이메일을 함께 지원하는 새 계약서로 다시 발송합니다.",
        accessibleByParticipant: false,
      }),
    });
    forgetModusignDocument(previousDocumentId);
  }

  contract.replacedDocumentIds = [
    ...(Array.isArray(contract.replacedDocumentIds)
      ? contract.replacedDocumentIds
      : []),
    previousDocumentId,
  ];
  contract.documentId = "";
  contract.deliveryMode = "";
  await clearSellerContractFromReservation(contract);
}

async function applySellerContractToReservation(contract) {
  if (!contract.reservationId || !contract.documentId) return;

  const reservation = reservations.find(
    (item) => item.id === contract.reservationId,
  );
  if (!reservation) return;

  reservation.documentId = contract.documentId;
  reservation.signatureStatus = contract.status;
  reservation.contractNotificationReadAt = "";
  reservation.status = ["ABORTED", "PROCESSING_FAILED"].includes(contract.status)
    ? contract.status
    : "SIGNING";
  reservation.updatedAt = new Date().toISOString();
  await saveReservations();
}

async function clearSellerContractFromReservation(contract) {
  if (!contract.reservationId) return;

  const reservation = reservations.find(
    (item) => item.id === contract.reservationId,
  );
  if (!reservation) return;

  reservation.documentId = "";
  reservation.signatureStatus = "";
  reservation.status = "SELLER_REVIEW";
  reservation.forwarded = false;
  reservation.forwardError = "";
  reservation.contractNotificationReadAt = "";
  reservation.updatedAt = new Date().toISOString();
  await saveReservations();
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

function findModusignSignerRole(template, { useConfiguredRole = true } = {}) {
  const configuredRole = process.env.MODUSIGN_SIGNER_ROLE?.trim();
  if (useConfiguredRole && configuredRole) return configuredRole;

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
  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    const document = await getModusignDocument(documentId, {
      force: attempt > 0,
    });
    if (["ON_GOING", "COMPLETED"].includes(document.status)) return document;
    if (["ABORTED", "PROCESSING_FAILED"].includes(document.status)) {
      throw new Error(`계약서를 준비하지 못했습니다. 현재 상태: ${document.status}`);
    }
  }
  throw new Error("계약서 준비 시간이 초과됐습니다. 잠시 후 다시 시도해 주세요.");
}

function selectCandidates(profile) {
  const maxDifficulty = {
    beginner: 2,
    intermediate: 4,
    advanced: 5,
  }[profile.experienceLevel];

  return getAllProducts()
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

function buildContractTerms(product, detail, contract) {
  return [
    ...detail.refundRules.map((text) => `환불 규정: ${text}`),
    ...detail.bookingConditions.map((text) => `예약 조건: ${text}`),
    ...contract.additionalClauses.map((text) => `추가 약관: ${text}`),
    ...product.safetyNotes.map((text) => `안전 조건: ${text}`),
  ];
}

async function requestProductTranslation(product, detail, contract, outputLocale) {
  const apiKey = process.env.UPSTAGE_API_KEY?.trim();
  if (!apiKey) return null;
  const outputLanguage = getTranslationLanguage(outputLocale);

  const source = {
    product: {
      name: product.name,
      partnerName: product.partnerName,
      category: product.category,
      region: product.region,
      location: product.location,
      included: product.included,
      safetyNotes: product.safetyNotes,
    },
    detail: {
      promotion: detail.promotion,
      highlights: detail.highlights,
      refundRules: detail.refundRules,
      bookingConditions: detail.bookingConditions,
    },
    contract: {
      story: contract.story,
      itinerary: contract.itinerary,
      additionalClauses: contract.additionalClauses,
    },
  };
  try {
    const translatedProduct = await requestProductTranslationSection(
      { product: source.product },
      outputLanguage,
    );
    const translatedDetail = await requestProductTranslationSection(
      { detail: source.detail },
      outputLanguage,
    );
    const translatedContract = await requestProductTranslationSection(
      { contract: source.contract },
      outputLanguage,
    );

    if (!translatedProduct || !translatedDetail || !translatedContract) return null;
    return parseProductTranslation(
      JSON.stringify({
        product: translatedProduct.product,
        detail: translatedDetail.detail,
        contract: translatedContract.contract,
      }),
      source,
    );
  } catch (error) {
    console.error("Solar 상품 번역 연결 오류:", error.message);
    return null;
  }
}

async function requestProductTranslationSection(source, outputLanguage, attempt = 0) {
  const apiKey = process.env.UPSTAGE_API_KEY?.trim();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

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
          temperature: 0,
          max_tokens: 4096,
          messages: [
            {
              role: "system",
              content:
                `Translate every Korean text value in this JSON into natural ${outputLanguage}. The output must contain zero Korean Hangul characters. Preserve JSON keys, numbers, array lengths, and the exact JSON structure. Return JSON only, without markdown or explanation.`,
            },
            { role: "user", content: JSON.stringify(source) },
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
    if (!content) throw new Error("Solar 응답에 상품 번역이 없습니다.");
    const translation = parseSolarJson(content);
    if (containsKoreanCharacters(translation)) {
      throw new Error(
        `Solar returned untranslated Korean text in ${Object.keys(source)[0]}.`,
      );
    }
    return translation;
  } catch (error) {
    if (attempt === 0) {
      return requestProductTranslationSection(source, outputLanguage, 1);
    }
    console.error("Solar 상품 번역 묶음 오류:", error.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function parseSolarJson(content) {
  const cleanedContent = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "");

  try {
    return JSON.parse(cleanedContent);
  } catch {
    const start = cleanedContent.search(/[\[{]/);
    if (start < 0) throw new Error("Solar response does not contain JSON.");

    const opening = cleanedContent[start];
    const closing = opening === "{" ? "}" : "]";
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = start; index < cleanedContent.length; index += 1) {
      const character = cleanedContent[index];
      if (inString) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === '"') inString = false;
        continue;
      }
      if (character === '"') {
        inString = true;
        continue;
      }
      if (character === opening) depth += 1;
      if (character === closing) {
        depth -= 1;
        if (depth === 0) return JSON.parse(cleanedContent.slice(start, index + 1));
      }
    }

    throw new Error("Solar response JSON is incomplete.");
  }
}

function parseSolarJsonList(content) {
  const cleanedContent = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "");

  try {
    return JSON.parse(cleanedContent);
  } catch {
    try {
      return JSON.parse(`[${cleanedContent}]`);
    } catch {
      return parseSolarJson(cleanedContent);
    }
  }
}

function containsKoreanCharacters(value) {
  if (typeof value === "string") return /[가-힣]/.test(value);
  if (Array.isArray(value)) return value.some(containsKoreanCharacters);
  if (value && typeof value === "object") {
    return Object.values(value).some(containsKoreanCharacters);
  }
  return false;
}

function parseProductTranslation(content, source) {
  const parsed = parseSolarJson(content);

  const translatedText = (value, label, maximumLength = 1200) => {
    const result = cleanText(value, maximumLength);
    if (!result) throw new Error(`${label} 번역이 비어 있습니다.`);
    return result;
  };
  const translatedItems = (items, sourceItems, label) => {
    if (!Array.isArray(items) || items.length !== sourceItems.length) {
      throw new Error(`${label} 번역 항목 수가 맞지 않습니다.`);
    }
    return items.map((item, index) =>
      translatedText(item, `${label} ${index + 1}`),
    );
  };

  return {
    product: {
      name: translatedText(parsed.product?.name, "상품명", 180),
      partnerName: translatedText(parsed.product?.partnerName, "판매자명", 180),
      category: translatedText(parsed.product?.category, "카테고리", 100),
      region: translatedText(parsed.product?.region, "지역", 100),
      location: translatedText(parsed.product?.location, "장소", 180),
      included: translatedItems(
        parsed.product?.included,
        source.product.included,
        "포함 사항",
      ),
      safetyNotes: translatedItems(
        parsed.product?.safetyNotes,
        source.product.safetyNotes,
        "안전 조건",
      ),
    },
    detail: {
      promotion: translatedText(parsed.detail?.promotion, "상품 소개"),
      highlights: translatedItems(
        parsed.detail?.highlights,
        source.detail.highlights,
        "상품 특징",
      ),
      refundRules: translatedItems(
        parsed.detail?.refundRules,
        source.detail.refundRules,
        "환불 규정",
      ),
      bookingConditions: translatedItems(
        parsed.detail?.bookingConditions,
        source.detail.bookingConditions,
        "예약 조건",
      ),
    },
    contract: {
      story: translatedItems(parsed.contract?.story, source.contract.story, "상품 설명"),
      itinerary: translatedItems(
        parsed.contract?.itinerary,
        source.contract.itinerary,
        "진행 순서",
      ),
      additionalClauses: translatedItems(
        parsed.contract?.additionalClauses,
        source.contract.additionalClauses,
        "추가 약관",
      ),
    },
  };
}

async function requestProductCardTranslations(productList, outputLocale, attempt = 0) {
  const apiKey = process.env.UPSTAGE_API_KEY?.trim();
  if (!apiKey) return null;
  const outputLanguage = getTranslationLanguage(outputLocale);

  const source = productList.map((product) => ({
    id: product.id,
    name: product.name,
    partnerName: product.partnerName,
  }));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

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
          temperature: 0,
          max_tokens: 1024,
          messages: [
            {
              role: "system",
              content:
                `You are a precise Korean-to-${outputLanguage} translator. Translate each product name and partner name into natural ${outputLanguage} without adding information. Your output must contain zero Korean Hangul characters. Keep each id unchanged. Return only a JSON array with the same items and fields: id, name, partnerName.`,
            },
            { role: "user", content: JSON.stringify(source) },
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
    if (!content) throw new Error("Solar 응답에 상품 목록 번역이 없습니다.");
    const translations = parseProductCardTranslations(content, source);
    if (containsKoreanCharacters(translations)) {
      throw new Error("Solar returned untranslated Korean product cards.");
    }
    return translations;
  } catch (error) {
    if (attempt === 0) {
      return requestProductCardTranslations(productList, outputLocale, 1);
    }
    console.error("Solar 상품 목록 번역 연결 오류:", error.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function parseProductCardTranslations(content, source) {
  const parsed = parseSolarJsonList(content);
  const translatedItems = Array.isArray(parsed)
    ? parsed
    : [
        parsed.translations,
        parsed.products,
        parsed.items,
        parsed.result,
        ...Object.values(parsed),
      ].find(Array.isArray) ?? (parsed?.id ? [parsed] : null);

  if (!Array.isArray(translatedItems) || translatedItems.length !== source.length) {
    throw new Error("상품 목록 영문 번역 항목 수가 맞지 않습니다.");
  }

  const translationsById = new Map(
    translatedItems.map((item) => [item?.id, item]),
  );
  return source.map((sourceItem) => {
    const item = translationsById.get(sourceItem.id);
    if (!item) throw new Error("상품 목록 영문 번역 항목을 찾지 못했습니다.");

    const name = cleanText(item.name, 180);
    const partnerName = cleanText(item.partnerName, 180);
    if (!name || !partnerName) {
      throw new Error("상품 목록 영문 번역 내용이 비어 있습니다.");
    }
    return { id: sourceItem.id, name, partnerName };
  });
}

async function requestInterfaceTranslations(texts, outputLocale) {
  const apiKey = process.env.UPSTAGE_API_KEY?.trim();
  if (!apiKey) return null;

  const outputLanguage = getTranslationLanguage(outputLocale);
  const chunks = Array.from(
    { length: Math.ceil(texts.length / 24) },
    (_, index) => texts.slice(index * 24, index * 24 + 24),
  );
  const translatedChunks = await Promise.all(
    chunks.map((chunk) => requestInterfaceTranslationChunk(chunk, outputLanguage)),
  );
  if (translatedChunks.some((chunk) => !chunk)) return null;
  return translatedChunks.flat();
}

async function requestInterfaceTranslationChunk(texts, outputLanguage) {
  const apiKey = process.env.UPSTAGE_API_KEY?.trim();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

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
          temperature: 0,
          max_tokens: 4096,
          messages: [
            {
              role: "system",
              content:
                `Translate each Korean interface string into natural ${outputLanguage}. Preserve all HTML tags, placeholders, numbers, and line breaks exactly. Do not add explanations. Return only a JSON array of translated strings in the exact same order as the input.`,
            },
            { role: "user", content: JSON.stringify(texts) },
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
    const parsed = parseSolarJsonList(content);
    const translatedTexts = Array.isArray(parsed)
      ? parsed
      : [
          parsed?.translations,
          parsed?.items,
          parsed?.result,
          ...Object.values(parsed ?? {}),
        ].find(Array.isArray);
    if (!Array.isArray(translatedTexts) || translatedTexts.length !== texts.length) {
      throw new Error("Solar 화면 번역 항목 수가 맞지 않습니다.");
    }

    return texts.map((source, index) => {
      const translation = cleanText(translatedTexts[index], 1600);
      if (!translation) throw new Error("Solar 화면 번역 내용이 비어 있습니다.");
      return [source, translation];
    });
  } catch (error) {
    console.error("Solar 화면 번역 연결 오류:", error.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function requestFocusedContractSummary(
  product,
  terms,
  baselineRiskLevel,
  outputLocale = "ko",
) {
  const apiKey = process.env.UPSTAGE_API_KEY?.trim();
  if (!apiKey) return null;
  const outputLanguage =
    outputLocale === "ko" ? "Korean" : getTranslationLanguage(outputLocale);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

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
          temperature: 0.1,
          messages: [
            {
              role: "system",
              content:
                outputLocale !== "ko"
                  ? `You help customers find easy-to-miss details in marine leisure booking terms. Summarize only refund restrictions and potentially unfavorable conditions in short, clear ${outputLanguage}. Do not invent facts that are not in the provided terms.`
                  : "당신은 해양레저 예약 약관에서 소비자가 놓치기 쉬운 내용을 찾는 도우미입니다. 환불 제한과 소비자에게 불리할 수 있는 조건만 쉽고 짧은 한국어로 정리하세요. 제공된 약관에 없는 사실은 만들지 마세요.",
            },
            {
              role: "user",
              content: buildFocusedContractPrompt(
                product,
                terms,
                baselineRiskLevel,
                outputLocale,
              ),
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
    if (!content) throw new Error("Solar 응답에 약관 요약이 없습니다.");
    return parseFocusedContractSummary(
      content,
      baselineRiskLevel,
      outputLocale,
    );
  } catch (error) {
    console.error("Solar 약관 요약 연결 오류:", error.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function buildFocusedContractPrompt(
  product,
  terms,
  baselineRiskLevel,
  outputLocale = "ko",
) {
  if (outputLocale !== "ko") {
    const outputLanguage = getTranslationLanguage(outputLocale);
    return `
The following are Korean booking terms for "${product.name}".

${terms.map((term, index) => `${index + 1}. ${term}`).join("\n")}

Return every value in ${outputLanguage}. Identify only refund restrictions and conditions that could disadvantage the customer. Do not invent facts. Use the provided baseline risk level exactly: "${baselineRiskLevel}".
Return only valid JSON without markdown:
{
  "headline": "One clear sentence in ${outputLanguage} describing the most important booking risk.",
  "riskLevel": "${baselineRiskLevel}",
  "refundWarnings": ["Short ${outputLanguage} refund restriction", "Another short ${outputLanguage} restriction"],
  "unfairTerms": ["Short ${outputLanguage} potentially disadvantageous condition", "Another short ${outputLanguage} condition"]
}
`;
  }

  return `
다음은 "${product.name}" 상품의 예약 약관 원문입니다.

상품별 약관을 미리 검토해 정한 기준 주의도: ${baselineRiskLevel}

${terms.map((term, index) => `${index + 1}. ${term}`).join("\n")}

환불 주의사항과 소비자에게 불리할 수 있는 조건만 서로 겹치지 않게 정리하세요.
주의도는 "매우높음", "높음", "보통", "낮음", "매우낮음" 중 하나이며, 위 기준 주의도를 그대로 사용하세요.
반드시 아래 JSON 형식만 반환하고 마크다운 코드 블록은 사용하지 마세요.
{
  "headline": "가장 먼저 확인할 핵심 주의사항 한 문장",
  "riskLevel": "${baselineRiskLevel}",
  "refundWarnings": ["취소 시점별 환불 제한", "기상·지각·노쇼 관련 환불 조건", "환불에서 추가 확인할 내용"],
  "unfairTerms": ["업체의 변경 권한", "추가 비용 또는 손해 책임", "소비자에게 불리할 수 있는 면책·제한 조건"]
}
`;
}

function parseFocusedContractSummary(
  content,
  baselineRiskLevel,
  outputLocale = "ko",
) {
  const parsed = parseSolarJson(content);
  const allowedRiskLevels = [
    "매우높음",
    "높음",
    "보통",
    "낮음",
    "매우낮음",
  ];
  const riskLevel = allowedRiskLevels.includes(baselineRiskLevel)
    ? baselineRiskLevel
    : allowedRiskLevels.includes(parsed.riskLevel)
      ? parsed.riskLevel
      : "보통";
  const summary = {
    headline: cleanText(parsed.headline, 180),
    riskLevel,
    refundWarnings: normalizeSummaryItems(parsed.refundWarnings, 5, 180),
    unfairTerms: normalizeSummaryItems(parsed.unfairTerms, 5, 180),
  };

  if (
    !summary.headline ||
    summary.refundWarnings.length === 0 ||
    summary.unfairTerms.length === 0
  ) {
    throw new Error("Solar 약관 요약 형식을 확인할 수 없습니다.");
  }
  return summary;
}

function createTranslatedLocalSummary(
  product,
  detail,
  contract,
  baselineRiskLevel,
  outputLocale,
) {
  const translation = productTranslationCaches.get(outputLocale)?.get(product.id);
  const fallbackText = {
    en: {
      productName: "This experience",
      headline: "Review cancellation deadlines and booking restrictions before you reserve.",
      refund: "Review the full terms for cancellation deadlines and refund restrictions.",
      unfair: "Additional restrictions may apply. Review the full terms before reserving.",
    },
    ja: {
      productName: "この体験",
      headline: "予約前にキャンセル期限と利用制限を確認してください。",
      refund: "キャンセル期限と返金制限は利用規約で確認してください。",
      unfair: "追加の利用制限が適用される場合があります。予約前に利用規約を確認してください。",
    },
    zh: {
      productName: "此体验",
      headline: "预订前请查看取消期限和使用限制。",
      refund: "请在完整条款中查看取消期限和退款限制。",
      unfair: "可能适用额外限制。预订前请查看完整条款。",
    },
  }[outputLocale];
  const productName = translation?.product?.name ?? fallbackText.productName;
  const refundWarnings = translation?.detail?.refundRules?.slice(0, 3) ?? [
    fallbackText.refund,
  ];
  const unfairTerms = [
    ...(translation?.detail?.bookingConditions ?? []),
    ...(translation?.contract?.additionalClauses ?? []),
  ].slice(0, 3);

  return {
    headline: `${productName}: ${fallbackText.headline}`,
    riskLevel: baselineRiskLevel || "보통",
    refundWarnings,
    unfairTerms:
      unfairTerms.length > 0
        ? unfairTerms
        : [fallbackText.unfair],
  };
}

function getCachedEmbeddedSigningView(documentId) {
  const cached = embeddedSigningViewCache.get(documentId);
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    embeddedSigningViewCache.delete(documentId);
    return null;
  }
  return cached;
}

function cacheEmbeddedSigningView(documentId, signing) {
  if (!signing?.embeddedUrl) return;
  embeddedSigningViewCache.set(documentId, {
    embeddedUrl: signing.embeddedUrl,
    expiresAt: Date.now() + embeddedSigningViewCacheDurationMs,
  });
}

function getSavedEmbeddedSigningView(reservation) {
  if (
    !reservation.embeddedSigningUrl ||
    Number(reservation.embeddedSigningExpiresAt) <= Date.now()
  ) {
    return null;
  }
  return { embeddedUrl: reservation.embeddedSigningUrl };
}

function saveEmbeddedSigningView(reservation, signing) {
  if (!signing?.embeddedUrl) return;
  reservation.embeddedSigningUrl = signing.embeddedUrl;
  reservation.embeddedSigningExpiresAt =
    Date.now() + embeddedSigningViewCacheDurationMs;
}

function createTranslatedDocumentFallback(
  product,
  baselineRiskLevel,
  outputLocale,
) {
  const labels = {
    en: {
      headline: "The actual e-signature document was checked. Review cancellation and liability clauses before signing.",
      refund: "Review the cancellation deadlines and refund restrictions in the actual contract.",
      unfair: "Check the actual contract for liability limits, additional fees, and schedule changes.",
    },
    ja: {
      headline: "実際の電子署名契約書を確認しました。署名前にキャンセルと責任に関する条項を確認してください。",
      refund: "実際の契約書でキャンセル期限と返金制限を確認してください。",
      unfair: "実際の契約書で責任制限、追加費用、日程変更の条件を確認してください。",
    },
    zh: {
      headline: "已检查实际电子签名合同。签署前请确认取消和责任条款。",
      refund: "请在实际合同中确认取消期限和退款限制。",
      unfair: "请在实际合同中确认责任限制、额外费用和日程变更条件。",
    },
  }[outputLocale];

  return {
    headline: `${product.name}: ${labels.headline}`,
    riskLevel: baselineRiskLevel || "보통",
    refundWarnings: [labels.refund],
    unfairTerms: [labels.unfair],
  };
}

function createFocusedLocalSummary(product, terms, baselineRiskLevel) {
  const cleanTermPrefix = (term) =>
    term.replace(/^(환불 규정|예약 조건|추가 약관|안전 조건):\s*/, "");
  const refundWarnings = terms
    .filter((term) => /환불|취소|노쇼|지각|기상|변경/.test(term))
    .slice(0, 4)
    .map(cleanTermPrefix);
  const unfairTerms = terms
    .filter((term) => /비용|청구|책임|보상|대체|제한|분실|파손|공제/.test(term))
    .slice(0, 4)
    .map(cleanTermPrefix);

  return {
    headline: `${product.name}은(는) 취소 시점과 현장 변경·추가 비용 조건을 예약 전에 꼭 확인해야 합니다.`,
    riskLevel: baselineRiskLevel || "보통",
    refundWarnings:
      refundWarnings.length > 0 ? refundWarnings : [product.refundPolicy],
    unfairTerms:
      unfairTerms.length > 0
        ? unfairTerms
        : ["현장 상황에 따라 일정이나 체험 내용이 바뀔 수 있습니다."],
  };
}

function createFocusedDocumentLocalSummary(
  product,
  documentText,
  baselineRiskLevel,
) {
  const clauses = documentText
    .split(/\n+|(?<=[.!?])\s+/)
    .map((item) => cleanText(item, 260))
    .filter((item) => item.length >= 12)
    .slice(0, 120);
  return createFocusedLocalSummary(product, clauses, baselineRiskLevel);
}

function normalizeSummaryItems(items, maximumCount, maximumLength) {
  return Array.isArray(items)
    ? items
        .slice(0, maximumCount)
        .map((item) => cleanText(item, maximumLength))
        .filter(Boolean)
    : [];
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
