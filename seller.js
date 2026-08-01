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
const reservationNotificationButton = document.querySelector(
  "#seller-reservation-notification",
);
const reservationBadge = document.querySelector("#seller-reservation-badge");
const reservationAlert = document.querySelector("#seller-reservation-alert");
const reservationAlertTitle = document.querySelector(
  "#seller-reservation-alert-title",
);

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

function sellerText(key, ...args) {
  return window.SellerLocale?.getText?.(key, ...args) ?? "";
}

function sellerIntlLocale() {
  const locales = {
    ko: "ko-KR",
    en: "en-US",
    ja: "ja-JP",
    zh: "zh-CN",
  };

  return locales[window.SellerLocale?.getLocale?.()] ?? locales.ko;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPrice(value) {
  return new Intl.NumberFormat(sellerIntlLocale()).format(Number(value || 0));
}

function formatDate(value, includeTime = false) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return escapeHtml(value);
  }

  return new Intl.DateTimeFormat(sellerIntlLocale(), {
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

function waitingSellerReservations(reservations = sellerState.reservations) {
  return reservations.filter(
    (reservation) =>
      reservation.status === "SELLER_REVIEW" && !reservation.contract,
  );
}

function cancellationRequestReservations(reservations = sellerState.reservations) {
  return reservations.filter(
    (reservation) => reservation.status === "CANCELLATION_REQUESTED",
  );
}

function cancelledReservationNotices(reservations = sellerState.reservations) {
  return reservations.filter(
    (reservation) =>
      ["CANCELLED", "SELLER_CANCELLED"].includes(reservation.status) &&
      reservation.cancellationNoticePending,
  );
}

function scrollToReservationInbox() {
  document.querySelector("#contracts")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function renderReservationNotifications() {
  const waitingCount = waitingSellerReservations().length;
  const cancellationCount = cancellationRequestReservations().length;
  const cancelledNoticeCount = cancelledReservationNotices().length;
  const attentionCount = waitingCount + cancellationCount + cancelledNoticeCount;
  const hasNotification = attentionCount > 0;

  reservationNotificationButton.hidden = !hasNotification;
  reservationAlert.hidden = !hasNotification;
  reservationBadge.textContent = String(attentionCount);
  reservationNotificationButton.setAttribute(
    "aria-label",
    sellerText("reservationNotificationLabel", attentionCount),
  );

  const notificationParts = [];
  if (waitingCount > 0) {
    notificationParts.push(sellerText("newReservationCount", waitingCount));
  }
  if (cancellationCount > 0) {
    notificationParts.push(sellerText("cancellationRequestCount", cancellationCount));
  }
  if (cancelledNoticeCount > 0) {
    notificationParts.push(sellerText("cancellationNoticeCount", cancelledNoticeCount));
  }
  reservationAlertTitle.textContent = notificationParts.length
    ? notificationParts.join(" · ")
    : sellerText("reservationAttention");
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
    COMPLETED: { label: sellerText("statusCompleted"), className: "is-completed" },
    SIGNED: { label: sellerText("statusCompleted"), className: "is-completed" },
    SEND_FAILED: { label: sellerText("statusSendFailed"), className: "is-failed" },
    SENDING: { label: sellerText("statusSending"), className: "is-pending" },
    DRAFT: { label: sellerText("statusDraft"), className: "is-pending" },
    SCHEDULED: { label: sellerText("statusScheduled"), className: "is-pending" },
    ON_PROCESSING: { label: sellerText("statusProcessing"), className: "is-pending" },
    ON_GOING: { label: sellerText("statusWaiting"), className: "is-pending" },
    SENT: { label: sellerText("statusSent"), className: "is-pending" },
  };

  return details[status] || {
    label: status || sellerText("statusUnknown"),
    className: "is-pending",
  };
}

function renderPosts() {
  postCount.textContent = sellerText("productCount", sellerState.posts.length);

  if (!sellerState.posts.length) {
    postList.innerHTML = `
      <div class="empty-state">
        <strong>${sellerText("productsEmptyTitle")}</strong>
        <span>${sellerText("productsEmptyDescription")}</span>
      </div>
    `;
    return;
  }

  postList.innerHTML = sellerState.posts
    .map(
      (post) => `
        <article class="seller-post-card">
          ${
            post.thumbnailImage
              ? `<img class="seller-post-image" src="${escapeHtml(post.thumbnailImage)}" alt="${escapeHtml(post.title)} ${sellerText("productPhoto")}" />`
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
            <span>${sellerText("priceWithCurrency", formatPrice(post.pricePerPerson))}</span>
            <span>${sellerText("minutes", escapeHtml(post.durationMinutes))}</span>
            <span>${sellerText("difficulty", escapeHtml(post.difficulty || 2))}</span>
            <span>${sellerText("maxParticipants", escapeHtml(post.maxParticipants))}</span>
          </div>
          <div class="seller-post-actions">
            <a
              class="post-edit-hint"
              href="/seller/edit/${encodeURIComponent(post.id)}"
              aria-label="${escapeHtml(post.title)} ${sellerText("productEdit")}"
            >
              ${sellerText("productEdit")} <span>→</span>
            </a>
            <button
              class="seller-delete-post-button"
              type="button"
              data-delete-seller-post="${escapeHtml(post.id)}"
            >
              ${sellerText("productDelete")}
            </button>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderReservations() {
  const waitingReservations = waitingSellerReservations();
  reservationCount.textContent = sellerText(
    "contractCount",
    waitingReservations.length,
  );

  if (!sellerState.reservations.length) {
    reservationList.innerHTML = `
      <div class="empty-state">
        <strong>${sellerText("reservationsEmptyTitle")}</strong>
        <span>${sellerText("reservationsEmptyDescription")}</span>
      </div>
    `;
    return;
  }

  reservationList.innerHTML = sellerState.reservations
    .map((reservation) => {
      const contract = reservation.contract;
      const cancelled = reservation.status === "CANCELLED";
      const sellerCancelled = reservation.status === "SELLER_CANCELLED";
      const cancellationRequested =
        reservation.status === "CANCELLATION_REQUESTED";
      const canSellerCancel = !cancelled && !sellerCancelled;
      const status = sellerCancelled
        ? { label: sellerText("sellerCancelled"), className: "is-failed" }
        : cancellationRequested
          ? { label: sellerText("cancelRequest"), className: "is-cancellation" }
          : cancelled
            ? { label: sellerText("cancelReservation"), className: "is-failed" }
            : contract
              ? contractStatusDetails(contract.status)
              : { label: sellerText("newReservation"), className: "is-new" };
      const actionItems = [];

      if (sellerCancelled) {
        actionItems.push(
          `<span class="reservation-contract-state is-failed">${escapeHtml(sellerText("sellerCancelledReservation"))}</span>`,
        );
      } else if (cancellationRequested) {
        actionItems.push(
          `<span class="reservation-contract-state is-cancellation">${escapeHtml(sellerText("buyerCancellationRequested"))}</span>`,
        );
      } else if (cancelled) {
        actionItems.push(
          `<span class="reservation-contract-state is-failed">${escapeHtml(sellerText("buyerCancelledReservation"))}</span>`,
        );
      } else if (contract) {
        actionItems.push(
          `<span class="reservation-contract-state ${status.className}">${escapeHtml(status.label)}</span>`,
        );
      } else {
        actionItems.push(
          `<button class="send-contract-button" type="button" data-send-contract="${escapeHtml(reservation.id)}">${sellerText("sendContract")} <span>→</span></button>`,
        );
      }

      if (canSellerCancel) {
        actionItems.push(`
          <button
            class="seller-cancel-reservation-button"
            type="button"
            data-cancel-seller-reservation="${escapeHtml(reservation.id)}"
          >
            ${cancellationRequested ? sellerText("approveCancellation") : sellerText("cancelReservation")}
            <span>×</span>
          </button>
        `);
      }

      if (
        ["CANCELLED", "SELLER_CANCELLED"].includes(reservation.status) &&
        reservation.cancellationNoticePending
      ) {
        actionItems.push(`
          <button
            class="seller-confirm-cancellation-button"
            type="button"
            data-acknowledge-seller-cancellation="${escapeHtml(reservation.id)}"
          >
            ${sellerText("confirmAndRemove")} <span>→</span>
          </button>
        `);
      }

      const cardStateClass = sellerCancelled
        ? "is-seller-cancelled"
        : cancellationRequested
          ? "is-cancellation-requested"
          : !contract && !cancelled
            ? "is-unread"
            : "";

      return `
        <article class="seller-reservation-card ${cardStateClass}">
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
            <span>${sellerText("usageDate")} ${formatReservationDate(reservation.date)}</span>
            ${reservation.time ? `<span>${escapeHtml(reservation.time)}</span>` : ""}
            <span>${sellerText("people", escapeHtml(reservation.people))}</span>
          </div>
          <div class="reservation-actions">${actionItems.join("")}</div>
        </article>
      `;
    })
    .join("");
}

function renderContracts() {
  if (!sellerState.contracts.length) {
    contractList.innerHTML = `
      <div class="empty-state">
        <strong>${sellerText("contractsEmptyTitle")}</strong>
        <span>${sellerText("contractsEmptyDescription")}</span>
      </div>
    `;
    return;
  }

  contractList.innerHTML = sellerState.contracts
    .map((contract) => {
      const status = contractStatusDetails(contract.status);
      const action =
        contract.status === "SEND_FAILED"
          ? `<button class="seller-small-button" type="button" data-resend-contract="${escapeHtml(contract.id)}">${sellerText("resend")}</button>`
          : contract.documentId
            ? `<button class="seller-small-button" type="button" data-refresh-contract="${escapeHtml(contract.id)}">${sellerText("checkStatus")}</button>`
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
            <span>${sellerText("reservationDate")} ${formatReservationDate(contract.reservationDate)}</span>
            <span>${sellerText("people", escapeHtml(contract.people))}</span>
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
    ? sellerText("eContractConfigured")
    : sellerText("eContractSetupRequired");
  modusignState.classList.toggle("is-offline", !sellerState.modusignConfigured);

  postStat.textContent = sellerState.posts.length;
  contractStat.textContent = sellerState.contracts.length;
  completedStat.textContent = sellerState.contracts.filter((contract) =>
    ["COMPLETED", "SIGNED"].includes(contract.status),
  ).length;

  renderPosts();
  renderReservations();
  renderContracts();
  renderReservationNotifications();
}

window.addEventListener("sellerlocalechange", () => {
  if (sellerState.user) renderDashboard();
});

async function loadOverview({ silent = false } = {}) {
  try {
    const result = await requestJson("/api/seller/overview");
    const previousReservationIds = new Set(
      sellerState.reservations.map((reservation) => reservation.id),
    );
    const previousReservationStatuses = new Map(
      sellerState.reservations.map((reservation) => [
        reservation.id,
        reservation.status,
      ]),
    );
    const incomingReservations = result.reservations || [];
    const newReservationCount = sellerState.overviewLoaded
      ? incomingReservations.filter(
          (reservation) =>
            !previousReservationIds.has(reservation.id) &&
            waitingSellerReservations([reservation]).length > 0,
        ).length
      : 0;
    const newCancellationCount = sellerState.overviewLoaded
      ? incomingReservations.filter(
          (reservation) =>
            reservation.status === "CANCELLATION_REQUESTED" &&
            previousReservationStatuses.get(reservation.id) !==
              "CANCELLATION_REQUESTED",
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

    if (silent && (newReservationCount > 0 || newCancellationCount > 0)) {
      const updates = [];
      if (newReservationCount > 0) {
        updates.push(sellerText("newReservationCount", newReservationCount));
      }
      if (newCancellationCount > 0) {
        updates.push(sellerText("cancellationRequestCount", newCancellationCount));
      }
      showToast(updates.join(" · "));
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
    showToast(sellerText("overviewRefreshed"));
  } finally {
    refreshButton.disabled = false;
  }
});

reservationNotificationButton.addEventListener(
  "click",
  scrollToReservationInbox,
);
reservationAlert.addEventListener("click", scrollToReservationInbox);

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

postList.addEventListener("click", async (event) => {
  const deleteButton = event.target.closest("[data-delete-seller-post]");
  if (!deleteButton) return;

  const post = sellerState.posts.find(
    (item) => item.id === deleteButton.dataset.deleteSellerPost,
  );
  if (!post || !window.confirm(sellerText("productDeleteConfirm", post.title))) {
    return;
  }

  deleteButton.disabled = true;
  deleteButton.textContent = sellerText("productDeleting");
  try {
    await requestJson(`/api/seller/posts/${encodeURIComponent(post.id)}`, {
      method: "DELETE",
    });
    await loadOverview();
    showToast(sellerText("productDeleted"));
  } catch (error) {
    if (error.status === 401) {
      showLogin();
      return;
    }
    showToast(getSellerErrorMessage(error));
    await loadOverview();
  } finally {
    deleteButton.disabled = false;
  }
});

reservationList.addEventListener("click", async (event) => {
  const acknowledgeButton = event.target.closest(
    "[data-acknowledge-seller-cancellation]",
  );
  if (acknowledgeButton) {
    const reservation = sellerState.reservations.find(
      (item) =>
        item.id === acknowledgeButton.dataset.acknowledgeSellerCancellation,
    );
    if (!reservation) return;

    acknowledgeButton.disabled = true;
    try {
      await requestJson(
        `/api/seller/reservations/${encodeURIComponent(reservation.id)}/cancellation/read`,
        { method: "POST" },
      );
      await loadOverview();
      showToast(sellerText("cancellationConfirmed"));
    } catch (error) {
      if (error.status === 401) {
        showLogin();
        return;
      }
      showToast(getSellerErrorMessage(error));
      await loadOverview();
    } finally {
      acknowledgeButton.disabled = false;
    }
    return;
  }

  const cancelButton = event.target.closest(
    "[data-cancel-seller-reservation]",
  );
  if (cancelButton) {
    const reservation = sellerState.reservations.find(
      (item) => item.id === cancelButton.dataset.cancelSellerReservation,
    );
    if (
      !reservation ||
      !window.confirm(
        sellerText(
          "cancellationConfirm",
          reservation.name,
          reservation.activity,
        ),
      )
    ) {
      return;
    }

    cancelButton.disabled = true;
    cancelButton.textContent = sellerText("cancelling");
    try {
      await requestJson(
        `/api/seller/reservations/${encodeURIComponent(reservation.id)}/cancel`,
        { method: "POST" },
      );
      await loadOverview();
      showToast(sellerText("cancellationCompleted"));
    } catch (error) {
      if (error.status === 401) {
        showLogin();
        return;
      }
      showToast(getSellerErrorMessage(error));
      await loadOverview();
    } finally {
      cancelButton.disabled = false;
    }
    return;
  }

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
