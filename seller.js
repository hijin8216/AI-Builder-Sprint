const sellerAccess = document.querySelector("#seller-access");
const sellerDashboard = document.querySelector("#seller-dashboard");
const sellerLoginForm = document.querySelector("#seller-login-form");
const sellerLoginError = document.querySelector("#seller-login-error");
const sellerRegisterForm = document.querySelector("#seller-register-form");
const sellerRegisterError = document.querySelector("#seller-register-error");
const sellerAuthTabs = document.querySelectorAll("[data-seller-auth-mode]");
const sellerUserId = document.querySelector("#seller-user-id");
const sellerUserEmail = document.querySelector("#seller-user-email");
const modusignState = document.querySelector("#modusign-state");
const logoutButton = document.querySelector("#seller-logout");
const refreshButton = document.querySelector("#refresh-overview");

const postForm = document.querySelector("#seller-post-form");
const postFormError = document.querySelector("#post-form-error");
const postList = document.querySelector("#seller-post-list");
const postCount = document.querySelector("#post-list-count");
const thumbnailImageInput = document.querySelector("#thumbnail-image-input");
const detailImagesInput = document.querySelector("#detail-images-input");
const sellerImagePreview = document.querySelector("#seller-image-preview");

const reservationList = document.querySelector("#seller-reservation-list");
const reservationCount = document.querySelector("#seller-reservation-count");
const contractList = document.querySelector("#seller-contract-list");

const postStat = document.querySelector("#post-count");
const contractStat = document.querySelector("#contract-count");
const completedStat = document.querySelector("#completed-count");
const toast = document.querySelector("#seller-toast");

const sellerState = {
  user: null,
  posts: [],
  reservations: [],
  contracts: [],
  modusignConfigured: false,
  overviewLoaded: false,
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPrice(value) {
  return new Intl.NumberFormat("ko-KR").format(Number(value || 0));
}

function formatDate(value, includeTime = false) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return escapeHtml(value);
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

function formatReservationDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? escapeHtml(value) : formatDate(date);
}

async function requestJson(url, options = {}) {
  let response;

  try {
    response = await fetch(url, {
      credentials: "same-origin",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }

  const responseText = await response.text();
  let result = {};

  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { message: "서버 응답을 확인할 수 없습니다." };
    }
  }

  if (!response.ok) {
    const error = new Error(result.message || "요청을 처리하지 못했습니다.");
    error.status = response.status;
    error.result = result;
    throw error;
  }

  return result;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3200);
}

function setFormError(element, message = "", errorCode = "") {
  element.textContent = message;
  element.hidden = !message;
  if (errorCode) {
    element.dataset.errorCode = errorCode;
  } else {
    delete element.dataset.errorCode;
  }
}

function getSellerErrorMessage(error) {
  return window.SellerLocale?.getErrorMessage(error?.result?.code, error?.message) ?? error?.message;
}

function setRequestError(element, error) {
  setFormError(element, getSellerErrorMessage(error), error?.result?.code);
}

function setSellerAuthMode(mode) {
  const registrationMode = mode === "register";
  sellerLoginForm.hidden = registrationMode;
  sellerRegisterForm.hidden = !registrationMode;
  setFormError(sellerLoginError);
  setFormError(sellerRegisterError);

  sellerAuthTabs.forEach((tab) => {
    const active = tab.dataset.sellerAuthMode === mode;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
}

function selectedProductImages() {
  return {
    thumbnail: thumbnailImageInput.files?.[0] || null,
    details: [...(detailImagesInput.files || [])].slice(0, 6),
  };
}

function validateImageFile(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("사진은 JPG, PNG 또는 WEBP 파일만 선택해 주세요.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("사진 한 장의 크기는 5MB 이하여야 합니다.");
  }
}

function renderSelectedImages() {
  const images = selectedProductImages();
  const selected = [
    ...(images.thumbnail
      ? [{ file: images.thumbnail, label: "대표" }]
      : []),
    ...images.details.map((file, index) => ({
      file,
      label: `상세 ${index + 1}`,
    })),
  ];

  if (!selected.length) {
    sellerImagePreview.innerHTML =
      "<p>선택한 사진이 여기에 미리 표시됩니다.</p>";
    return;
  }

  sellerImagePreview.innerHTML = selected
    .map(
      ({ file, label }) => `
        <figure>
          <img src="${URL.createObjectURL(file)}" alt="${escapeHtml(label)} 사진 미리보기" />
          <figcaption>${escapeHtml(label)}</figcaption>
        </figure>
      `,
    )
    .join("");
}

async function uploadSellerImage(file) {
  validateImageFile(file);
  const response = await fetch("/api/seller/uploads", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": file.type },
    body: file,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.message || "사진을 올리지 못했습니다.");
    error.status = response.status;
    throw error;
  }
  return result.imageUrl;
}

function splitCommaList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitLineList(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createSellerPostPayload(formData) {
  const payload = Object.fromEntries(formData.entries());
  payload.swimmingRequired = formData.get("swimmingRequired") === "true";
  payload.waiverRequired = formData.has("waiverRequired");
  payload.suitableFor = formData.getAll("suitableFor");
  payload.availableDays = formData.getAll("availableDays");
  payload.languages = formData.getAll("languages");
  payload.moods = splitCommaList(formData.get("moods"));
  payload.timeSlots = splitCommaList(formData.get("timeSlots"));
  payload.included = splitLineList(formData.get("included"));
  payload.safetyNotes = splitLineList(formData.get("safetyNotes"));
  return payload;
}

function showLogin() {
  sellerState.user = null;
  sellerState.overviewLoaded = false;
  sellerAccess.hidden = false;
  sellerDashboard.hidden = true;
}

function showDashboard() {
  sellerAccess.hidden = true;
  sellerDashboard.hidden = false;
}

function contractStatusDetails(status) {
  const details = {
    COMPLETED: { label: "서명 완료", className: "is-completed" },
    SIGNED: { label: "서명 완료", className: "is-completed" },
    SEND_FAILED: { label: "발송 실패", className: "is-failed" },
    SENDING: { label: "발송 중", className: "is-pending" },
    DRAFT: { label: "작성 중", className: "is-pending" },
    SCHEDULED: { label: "발송 예정", className: "is-pending" },
    ON_PROCESSING: { label: "처리 중", className: "is-pending" },
    ON_GOING: { label: "서명 대기", className: "is-pending" },
    SENT: { label: "서명 요청 발송", className: "is-pending" },
  };

  return details[status] || {
    label: status || "상태 확인 필요",
    className: "is-pending",
  };
}

function renderPosts() {
  postCount.textContent = `${sellerState.posts.length}개`;

  if (!sellerState.posts.length) {
    postList.innerHTML = `
      <div class="empty-state">
        <strong>아직 등록한 상품이 없습니다.</strong>
        <span>위 양식을 작성하면 구매자에게 보여 줄 상품 초안이 저장됩니다.</span>
      </div>
    `;
    return;
  }

  postList.innerHTML = sellerState.posts
    .map(
      (post) => `
        <a
          class="seller-post-card seller-post-card-link"
          href="/seller/edit/${encodeURIComponent(post.id)}"
          aria-label="${escapeHtml(post.title)} 상품 수정"
        >
          ${
            post.thumbnailImage
              ? `<img class="seller-post-image" src="${escapeHtml(post.thumbnailImage)}" alt="${escapeHtml(post.title)} 대표 사진" />`
              : ""
          }
          <div class="card-top">
            <span class="card-status">${escapeHtml(post.category)}</span>
            <time>${formatDate(post.createdAt)}</time>
          </div>
          <h4>${escapeHtml(post.title)}</h4>
          <p>${escapeHtml(post.description)}</p>
          <div class="post-meta">
            <span>${escapeHtml(post.partnerName)}</span>
            <span>${escapeHtml(post.region)}</span>
            <span>${formatPrice(post.pricePerPerson)}원</span>
            <span>${escapeHtml(post.durationMinutes)}분</span>
            <span>${escapeHtml(post.difficulty || 2)}단계 난이도</span>
            <span>최대 ${escapeHtml(post.maxParticipants)}명</span>
          </div>
          <span class="post-edit-hint">상품 수정하기 →</span>
        </a>
      `,
    )
    .join("");
}

function renderReservations() {
  const waitingReservations = sellerState.reservations.filter(
    (reservation) => !reservation.contract,
  );
  reservationCount.textContent = `${waitingReservations.length}건`;

  if (!sellerState.reservations.length) {
    reservationList.innerHTML = `
      <div class="empty-state">
        <strong>아직 들어온 예약이 없습니다.</strong>
        <span>등록한 상품을 구매자가 예약하면 여기에 자동으로 표시됩니다.</span>
      </div>
    `;
    return;
  }

  reservationList.innerHTML = sellerState.reservations
    .map((reservation) => {
      const contract = reservation.contract;
      const status = contract
        ? contractStatusDetails(contract.status)
        : { label: "새 예약", className: "is-new" };
      const action = contract
        ? `<span class="reservation-contract-state ${status.className}">${escapeHtml(status.label)}</span>`
        : `<button class="send-contract-button" type="button" data-send-contract="${escapeHtml(reservation.id)}">계약서 발송 <span>→</span></button>`;

      return `
        <article class="seller-reservation-card ${contract ? "" : "is-unread"}">
          <div class="card-top">
            <span class="card-status ${status.className}">${escapeHtml(status.label)}</span>
            <time>${formatDate(reservation.createdAt, true)}</time>
          </div>
          <h4>${escapeHtml(reservation.activity)}</h4>
          <div class="reservation-customer">
            <strong>${escapeHtml(reservation.name)}</strong>
            <span>${escapeHtml(reservation.email)}</span>
          </div>
          <div class="contract-meta">
            <span>이용일 ${formatReservationDate(reservation.date)}</span>
            <span>${escapeHtml(reservation.people)}명</span>
          </div>
          <div class="reservation-actions">${action}</div>
        </article>
      `;
    })
    .join("");
}

function renderContracts() {
  if (!sellerState.contracts.length) {
    contractList.innerHTML = `
      <div class="empty-state">
        <strong>아직 발송한 계약서가 없습니다.</strong>
        <span>들어온 예약에서 계약서 발송을 누르면 여기에 기록됩니다.</span>
      </div>
    `;
    return;
  }

  contractList.innerHTML = sellerState.contracts
    .map((contract) => {
      const status = contractStatusDetails(contract.status);
      const action =
        contract.status === "SEND_FAILED"
          ? `<button class="seller-small-button" type="button" data-resend-contract="${escapeHtml(contract.id)}">다시 발송</button>`
          : contract.documentId
            ? `<button class="seller-small-button" type="button" data-refresh-contract="${escapeHtml(contract.id)}">상태 확인</button>`
            : "";

      return `
        <article class="seller-contract-card">
          <div class="card-top">
            <span class="card-status ${status.className}">${escapeHtml(status.label)}</span>
            <time>${formatDate(contract.createdAt, true)}</time>
          </div>
          <h4>${escapeHtml(contract.postTitle)}</h4>
          <p>${escapeHtml(contract.customerName)} · ${escapeHtml(contract.customerEmail)}</p>
          <div class="contract-meta">
            <span>예약일 ${formatReservationDate(contract.reservationDate)}</span>
            <span>${escapeHtml(contract.people)}명</span>
          </div>
          ${
            contract.error
              ? `<p class="contract-error-copy">${escapeHtml(contract.error)}</p>`
              : ""
          }
          <div class="contract-actions">${action}</div>
        </article>
      `;
    })
    .join("");
}

function renderDashboard() {
  sellerUserId.textContent = sellerState.user?.userId || "-";
  sellerUserEmail.textContent = sellerState.user?.email || "-";
  modusignState.textContent = sellerState.modusignConfigured
    ? "모두싸인 환경변수 설정됨"
    : "모두싸인 환경변수 확인 필요";
  modusignState.classList.toggle("is-offline", !sellerState.modusignConfigured);

  postStat.textContent = sellerState.posts.length;
  contractStat.textContent = sellerState.contracts.length;
  completedStat.textContent = sellerState.contracts.filter((contract) =>
    ["COMPLETED", "SIGNED"].includes(contract.status),
  ).length;

  renderPosts();
  renderReservations();
  renderContracts();
}

async function loadOverview({ silent = false } = {}) {
  try {
    const result = await requestJson("/api/seller/overview");
    const previousReservationIds = new Set(
      sellerState.reservations.map((reservation) => reservation.id),
    );
    const incomingReservations = result.reservations || [];
    const newReservationCount = sellerState.overviewLoaded
      ? incomingReservations.filter(
          (reservation) => !previousReservationIds.has(reservation.id),
        ).length
      : 0;

    sellerState.user = result.user;
    sellerState.posts = result.posts || [];
    sellerState.reservations = incomingReservations;
    sellerState.contracts = result.contracts || [];
    sellerState.modusignConfigured = Boolean(result.modusignConfigured);
    sellerState.overviewLoaded = true;
    renderDashboard();
    showDashboard();

    if (silent && newReservationCount > 0) {
      showToast(`새 예약 ${newReservationCount}건이 들어왔습니다.`);
    }
  } catch (error) {
    if (error.status === 401) {
      showLogin();
      return;
    }

    showLogin();
    setRequestError(sellerLoginError, error);
  }
}

sellerLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFormError(sellerLoginError);

  const submitButton = sellerLoginForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  try {
    await requestJson("/api/seller/login", {
      method: "POST",
      body: JSON.stringify({
        userId: document.querySelector("#seller-login-id").value,
        password: document.querySelector("#seller-login-password").value,
      }),
    });
    sellerLoginForm.reset();
    await loadOverview();
    showToast("판매자 페이지에 로그인했습니다.");
  } catch (error) {
    setRequestError(sellerLoginError, error);
  } finally {
    submitButton.disabled = false;
  }
});

sellerRegisterForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFormError(sellerRegisterError);

  const submitButton = sellerRegisterForm.querySelector(
    'button[type="submit"]',
  );
  submitButton.disabled = true;

  try {
    const formData = new FormData(sellerRegisterForm);
    const result = await requestJson("/api/seller/register", {
      method: "POST",
      body: JSON.stringify({
        ...Object.fromEntries(formData.entries()),
        sellerTermsAccepted: formData.has("sellerTermsAccepted"),
      }),
    });
    sellerRegisterForm.reset();
    await loadOverview();
    showToast(
      result.existing
        ? "기존 계정을 판매자 계정으로 전환했습니다."
        : "판매자 등록이 완료되었습니다.",
    );
  } catch (error) {
    setRequestError(sellerRegisterError, error);
  } finally {
    submitButton.disabled = false;
  }
});

sellerAuthTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setSellerAuthMode(tab.dataset.sellerAuthMode);
  });
});

logoutButton.addEventListener("click", async () => {
  try {
    await requestJson("/api/auth/logout", { method: "POST" });
  } catch {
    // 로그아웃 요청이 실패해도 현재 화면의 로그인 상태는 초기화한다.
  }

  setSellerAuthMode("login");
  showLogin();
  showToast("로그아웃했습니다.");
});

refreshButton.addEventListener("click", async () => {
  refreshButton.disabled = true;
  try {
    await loadOverview();
    showToast("판매자 정보를 새로 불러왔습니다.");
  } finally {
    refreshButton.disabled = false;
  }
});

thumbnailImageInput.addEventListener("change", renderSelectedImages);
detailImagesInput.addEventListener("change", renderSelectedImages);

postForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFormError(postFormError);

  const submitButton = postForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "상품 정보와 사진 저장 중…";

  try {
    const formData = new FormData(postForm);
    const images = selectedProductImages();
    if ((detailImagesInput.files?.length || 0) > 6) {
      throw new Error("상세 사진은 최대 6장까지 선택해 주세요.");
    }

    const payload = createSellerPostPayload(formData);
    const [thumbnailImage, detailImages] = await Promise.all([
      images.thumbnail ? uploadSellerImage(images.thumbnail) : "",
      Promise.all(images.details.map(uploadSellerImage)),
    ]);
    payload.thumbnailImage = thumbnailImage;
    payload.detailImages = detailImages;

    await requestJson("/api/seller/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    postForm.reset();
    renderSelectedImages();
    await loadOverview();
    showToast("상품 글을 등록했습니다.");
  } catch (error) {
    if (error.status === 401) {
      showLogin();
      return;
    }
    setRequestError(postFormError, error);
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = "상품 등록하기 <span>→</span>";
  }
});

reservationList.addEventListener("click", async (event) => {
  const actionButton = event.target.closest("[data-send-contract]");
  if (!actionButton) {
    return;
  }

  actionButton.disabled = true;
  actionButton.textContent = "발송 중…";

  try {
    await requestJson("/api/seller/contracts", {
      method: "POST",
      body: JSON.stringify({
        reservationId: actionButton.dataset.sendContract,
      }),
    });
    await loadOverview();
    showToast("예약 정보로 고객에게 계약서를 발송했습니다.");
  } catch (error) {
    if (error.status === 401) {
      showLogin();
      return;
    }

    showToast(getSellerErrorMessage(error));
    await loadOverview();
  } finally {
    actionButton.disabled = false;
  }
});

contractList.addEventListener("click", async (event) => {
  const actionButton = event.target.closest(
    "[data-resend-contract], [data-refresh-contract]",
  );

  if (!actionButton) {
    return;
  }

  const contractId =
    actionButton.dataset.resendContract || actionButton.dataset.refreshContract;
  const action = actionButton.dataset.resendContract ? "resend" : "refresh";

  actionButton.disabled = true;

  try {
    await requestJson(`/api/seller/contracts/${encodeURIComponent(contractId)}/${action}`, {
      method: "POST",
    });
    await loadOverview();
    showToast(
      action === "resend"
        ? "계약서를 다시 발송했습니다."
        : "모두싸인 계약 상태를 갱신했습니다.",
    );
  } catch (error) {
    if (error.status === 401) {
      showLogin();
      return;
    }

    showToast(getSellerErrorMessage(error));
    await loadOverview();
  } finally {
    actionButton.disabled = false;
  }
});

loadOverview().then(() => {
  const pageState = new URLSearchParams(window.location.search);
  if (pageState.get("created") === "1") {
    showToast("새 상품이 등록되어 구매자 페이지에 공개됐습니다.");
    window.history.replaceState({}, "", "/seller");
  } else if (pageState.get("updated") === "1") {
    showToast("판매 상품 수정 내용을 저장했습니다.");
    window.history.replaceState({}, "", "/seller");
  }
});

window.setInterval(() => {
  if (sellerState.user && document.visibilityState === "visible") {
    loadOverview({ silent: true });
  }
}, 15000);
