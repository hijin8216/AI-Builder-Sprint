let experiences = [];
let productDetails = {};
let productContracts = {};
let productMedia = {};

const state = {
  category: "",
  region: "",
  keyword: "",
  sort: "popular",
  selectedExperience: null,
  favorites: new Set(),
  recommendedIds: null,
  recommendationMap: new Map(),
  recommendationMessage: "",
  contractSummaryCache: new Map(),
  page: 0,
};

const categoryGroups = {
  "": [],
  요트: ["요트", "크루즈"],
  서핑: ["서핑", "바디보드"],
  다이빙: ["다이빙", "스노클링", "프리다이빙"],
  SUP: ["SUP", "카약"],
  낚시: ["낚시"],
};

const categoryImages = {
  요트: [
    "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=900&q=86",
    "https://images.unsplash.com/photo-1562281302-809108fd533c?auto=format&fit=crop&w=900&q=86",
  ],
  크루즈: [
    "https://images.unsplash.com/photo-1540946485063-a40da27545f8?auto=format&fit=crop&w=900&q=86",
  ],
  서핑: [
    "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=86",
    "https://images.unsplash.com/photo-1455729552865-3658a5d39692?auto=format&fit=crop&w=900&q=86",
  ],
  바디보드: [
    "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=86",
  ],
  다이빙: [
    "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=900&q=86",
  ],
  스노클링: [
    "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=900&q=86",
  ],
  프리다이빙: [
    "https://images.unsplash.com/photo-1530130270670-4c1bfa14390b?auto=format&fit=crop&w=900&q=86",
  ],
  SUP: [
    "https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=900&q=86",
  ],
  카약: [
    "https://images.unsplash.com/photo-1521120413309-42e7eada0334?auto=format&fit=crop&w=900&q=86",
  ],
  낚시: [
    "https://images.unsplash.com/photo-1510137600163-2729bc695e3a?auto=format&fit=crop&w=900&q=86",
  ],
  제트스키: [
    "https://images.unsplash.com/photo-1544550285-f813152fb2fd?auto=format&fit=crop&w=900&q=86",
  ],
  바나나보트: [
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=86",
  ],
  웨이크보드: [
    "https://images.unsplash.com/photo-1528150177508-7cc0c36cda5c?auto=format&fit=crop&w=900&q=86",
  ],
};

const EXPERIENCES_PER_PAGE = 8;

const experienceGrid = document.querySelector("#experience-grid");
const experiencePagination = document.querySelector("#experience-pagination");
const paginationDots = document.querySelector("#pagination-dots");
const paginationPrev = document.querySelector("#pagination-prev");
const paginationNext = document.querySelector("#pagination-next");
const emptyState = document.querySelector("#empty-state");
const resultCount = document.querySelector("#result-count");
const resultDescription = document.querySelector("#result-description");
const categoryButtons = [...document.querySelectorAll("[data-category]")];
const regionSelect = document.querySelector("#region-select");
const keywordInput = document.querySelector("#keyword-input");
const sortSelect = document.querySelector("#sort-select");
const bookingDialog = document.querySelector("#booking-dialog");
const bookingDate = document.querySelector("#booking-date");
const bookingTime = document.querySelector("#booking-time");
const searchDate = document.querySelector("#search-date");
const productDetailDialog = document.querySelector("#product-detail-dialog");
const recommendationDialog = document.querySelector("#recommendation-dialog");
const recommendationError = document.querySelector("#recommendation-error");
const recommendationSubmit = document.querySelector("#recommendation-submit");
const toast = document.querySelector("#toast");
const loginButton = document.querySelector("#login-button");
const authDialog = document.querySelector("#auth-dialog");
const authForm = document.querySelector("#auth-form");
const authTitle = document.querySelector("#auth-title");
const authDescription = document.querySelector("#auth-description");
const authEmailField = document.querySelector("#auth-email-field");
const authEmail = document.querySelector("#auth-email");
const authUserId = document.querySelector("#auth-user-id");
const authPassword = document.querySelector("#auth-password");
const authPasswordConfirmField = document.querySelector("#auth-password-confirm-field");
const authPasswordConfirm = document.querySelector("#auth-password-confirm");
const authError = document.querySelector("#auth-error");
const authSubmit = document.querySelector("#auth-submit");
const authModeButtons = [...document.querySelectorAll("[data-auth-mode]")];
const mypageDialog = document.querySelector("#mypage-dialog");
const mypageUserId = document.querySelector("#mypage-user-id");
const mypageEmail = document.querySelector("#mypage-email");
const mypageReservationCount = document.querySelector("#mypage-reservation-count");
const mypageReservationList = document.querySelector("#mypage-reservation-list");
const reservationDetailDialog = document.querySelector("#reservation-detail-dialog");
const reservationDetailContent = document.querySelector("#reservation-detail-content");
const bookingName = document.querySelector("#booking-name");
const bookingEmail = document.querySelector("#booking-email");
const notificationButton = document.querySelector("#notification-button");
const notificationBadge = document.querySelector("#notification-badge");
const contractNotification = document.querySelector("#contract-notification");
const contractNotificationItem = document.querySelector("#contract-notification-item");
const contractDialog = document.querySelector("#contract-dialog");
const contractBookingSummary = document.querySelector("#contract-booking-summary");
const contractAgreement = document.querySelector("#contract-agreement");
const startSignatureButton = document.querySelector("#start-signature-button");
const signatureDialog = document.querySelector("#signature-dialog");
const signatureFrameWrap = document.querySelector("#signature-frame-wrap");
const signatureStatus = document.querySelector("#signature-status");

let toastTimer;
let currentUser = null;
let authMode = "login";
let pendingExperienceId = null;
let pendingBooking = null;
let contractNotificationRead = false;
let myReservations = [];
let expandedReservationId = null;
let activeReservationId = null;
let signatureStatusTimer = null;
let signatureFrameLoaded = false;

function formatPrice(price) {
  return `${price.toLocaleString("ko-KR")}원`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function categoryMatches(productCategory, selectedCategory) {
  if (!selectedCategory) return true;
  const groupedCategories = categoryGroups[selectedCategory] ?? [selectedCategory];
  return groupedCategories.includes(productCategory);
}

function getProductImage(product) {
  const productCover = productMedia[product.id]?.cover;
  if (productCover) return productCover;

  const images = categoryImages[product.category] ?? categoryImages.요트;
  const numericId = Number(product.id.replace(/\D/g, "")) || 0;
  return images[numericId % images.length];
}

function getProductImageAlt(product) {
  return productMedia[product.id]?.coverAlt ?? `${product.name} 체험 모습`;
}

function getVisibleExperiences() {
  if (state.recommendedIds) {
    const experienceMap = new Map(
      experiences.map((experience) => [experience.id, experience]),
    );

    return state.recommendedIds
      .map((id) => experienceMap.get(id))
      .filter(Boolean);
  }

  const normalizedKeyword = state.keyword.trim().toLowerCase();

  const filtered = experiences.filter((experience) => {
    const matchesCategory = categoryMatches(
      experience.category,
      state.category,
    );
    const matchesRegion = !state.region || experience.region === state.region;
    const searchableText =
      `${experience.partnerName} ${experience.name} ${experience.description} ${experience.category} ${experience.region} ${experience.moods.join(" ")}`.toLowerCase();
    const matchesKeyword =
      !normalizedKeyword || searchableText.includes(normalizedKeyword);

    return matchesCategory && matchesRegion && matchesKeyword;
  });

  return [...filtered].sort((first, second) => {
    if (state.sort === "rating") {
      return second.rating - first.rating || second.reviewCount - first.reviewCount;
    }

    if (state.sort === "low-price") {
      return first.pricePerPerson - second.pricePerPerson;
    }

    return second.reviewCount - first.reviewCount;
  });
}

function renderPagination(totalPages) {
  experiencePagination.hidden = false;
  experiencePagination.classList.toggle("is-single-page", totalPages <= 1);
  paginationPrev.disabled = state.page === 0;
  paginationNext.disabled = state.page >= totalPages - 1;
  paginationDots.innerHTML = Array.from({ length: totalPages }, (_, index) => `
    <button
      class="pagination-dot ${index === state.page ? "is-active" : ""}"
      type="button"
      data-page="${index}"
      aria-label="${index + 1}페이지 보기"
      aria-current="${index === state.page ? "page" : "false"}"
    ></button>
  `).join("");
}

function renderExperiences() {
  const visibleExperiences = getVisibleExperiences();
  const totalPages = Math.max(1, Math.ceil(visibleExperiences.length / EXPERIENCES_PER_PAGE));
  state.page = Math.min(state.page, totalPages - 1);
  const pageStart = state.page * EXPERIENCES_PER_PAGE;
  const pageExperiences = visibleExperiences.slice(pageStart, pageStart + EXPERIENCES_PER_PAGE);

  experienceGrid.innerHTML = pageExperiences
    .map((experience) => {
      const recommendation = state.recommendationMap.get(experience.id);
      const recommendationNote = recommendation
        ? `
          <div class="recommendation-note">
            <strong>✦ AI 추천 이유 · 적합도 ${recommendation.score}점</strong>
            ${escapeHtml(recommendation.reason)}
            <span class="recommendation-tags">
              ${recommendation.fitPoints
                .map((point) => `<span>${escapeHtml(point)}</span>`)
                .join("")}
            </span>
            <span class="recommendation-caution">주의: ${escapeHtml(recommendation.caution)}</span>
          </div>
        `
        : "";

      return `
        <article class="experience-card">
          <div class="card-image">
            <img
              src="${getProductImage(experience)}"
              alt="${escapeHtml(getProductImageAlt(experience))}"
              loading="lazy"
            />
            <span class="card-badge">${experience.rating >= 4.9 ? "BEST" : "AVAILABLE"}</span>
            <button
              class="favorite-button ${state.favorites.has(experience.id) ? "is-active" : ""}"
              type="button"
              data-favorite="${experience.id}"
              aria-label="${escapeHtml(experience.name)} 찜하기"
              aria-pressed="${state.favorites.has(experience.id)}"
            >${state.favorites.has(experience.id) ? "♥" : "♡"}</button>
          </div>
          <button class="card-button" type="button" data-booking="${experience.id}">
            <span class="card-meta">
              <span>${escapeHtml(experience.region)} · ${escapeHtml(experience.category)}</span>
              <span class="card-rating">★ ${experience.rating} (${experience.reviewCount})</span>
            </span>
            <h3>${escapeHtml(experience.name)}</h3>
            <span class="card-footer">
              <span>${escapeHtml(experience.partnerName)} · ${experience.durationMinutes}분</span>
              <strong>${formatPrice(experience.pricePerPerson)}</strong>
            </span>
          </button>
          ${recommendationNote}
        </article>
      `;
    })
    .join("");

  resultCount.textContent = `${visibleExperiences.length}개의 경험`;
  emptyState.hidden = visibleExperiences.length !== 0;
  renderPagination(totalPages);

  if (state.recommendedIds) {
    resultDescription.textContent = state.recommendationMessage;
    return;
  }

  const descriptions = [];
  if (state.category) descriptions.push(`${state.category} 카테고리`);
  if (state.region) descriptions.push(`${state.region} 지역`);
  if (state.keyword) descriptions.push(`“${state.keyword}” 검색`);

  resultDescription.textContent = descriptions.length
    ? `${descriptions.join(" · ")} 결과입니다.`
    : "이번 주 여행자들이 가장 많이 선택한 해양레저예요.";
}

function updateCategoryCounts() {
  categoryButtons.forEach((button) => {
    const category = button.dataset.category;
    const count = experiences.filter((experience) =>
      categoryMatches(experience.category, category),
    ).length;
    const countLabel = button.querySelector("small");

    if (countLabel) countLabel.textContent = `${count} experiences`;
  });
}

function clearRecommendations() {
  state.recommendedIds = null;
  state.recommendationMap.clear();
  state.recommendationMessage = "";
  state.page = 0;
}

function setCategory(category) {
  clearRecommendations();
  state.category = category;

  categoryButtons.forEach((button) => {
    const isActive = button.dataset.category === category;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  renderExperiences();
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2800);
}

function updateAuthInterface() {
  if (currentUser) {
    loginButton.textContent = "마이페이지";
    loginButton.classList.add("is-authenticated");
    loginButton.setAttribute("aria-label", `${currentUser.userId} 계정 마이페이지 열기`);
    notificationButton.hidden = false;
  } else {
    loginButton.textContent = "로그인";
    loginButton.classList.remove("is-authenticated");
    loginButton.setAttribute("aria-label", "로그인 또는 회원가입");
    notificationButton.hidden = true;
    notificationBadge.hidden = true;
    contractNotification.hidden = true;
    notificationButton.setAttribute("aria-expanded", "false");
  }
}

function setAuthMode(mode) {
  authMode = mode === "register" ? "register" : "login";
  const isRegister = authMode === "register";
  authTitle.textContent = isRegister ? "회원가입" : "로그인";
  authDescription.textContent = isRegister
    ? "계정을 만들면 로그인 이메일로 전자서명 완료 문서를 보내드립니다."
    : "아이디와 비밀번호로 로그인해 주세요.";
  authSubmit.innerHTML = `${isRegister ? "회원가입" : "로그인"} <span>→</span>`;
  authPassword.autocomplete = isRegister ? "new-password" : "current-password";
  authEmailField.hidden = !isRegister;
  authEmail.required = isRegister;
  authPasswordConfirmField.hidden = !isRegister;
  authPasswordConfirm.required = isRegister;
  if (!isRegister) authPasswordConfirm.value = "";
  authError.hidden = true;

  authModeButtons.forEach((button) => {
    const isActive = button.dataset.authMode === authMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
}

function openAuthDialog(mode = "login") {
  setAuthMode(mode);
  authPassword.value = "";
  authPasswordConfirm.value = "";
  authDialog.showModal();
  document.body.classList.add("dialog-open");
}

async function loadCurrentUser() {
  try {
    const response = await fetch("/api/auth/me");
    if (!response.ok) return;
    const result = await response.json();
    currentUser = result.user;
  } catch {
    currentUser = null;
  } finally {
    updateAuthInterface();
  }
}

async function logout() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } finally {
    currentUser = null;
    myReservations = [];
    expandedReservationId = null;
    pendingBooking = null;
    notificationBadge.hidden = true;
    contractNotification.hidden = true;
    if (mypageDialog.open) mypageDialog.close();
    updateAuthInterface();
    showToast("로그아웃되었습니다.");
  }
}

function reservationStatusDetails(status) {
  return {
    CONTRACT_PENDING: { label: "계약 확인 필요", className: "pending" },
    SIGNING: { label: "전자서명 진행 중", className: "signing" },
    COMPLETED: { label: "예약 확정", className: "completed" },
    ABORTED: { label: "서명 중단", className: "failed" },
    PROCESSING_FAILED: { label: "문서 처리 실패", className: "failed" },
  }[status] ?? { label: "상태 확인 중", className: "signing" };
}

function reservationSignatureDetails(reservation) {
  if (reservation.documentAvailable) {
    return {
      label: "전자서명 완료",
      className: "completed",
      description: "완료된 전자서명 문서가 이 예약에 안전하게 연결되어 있습니다.",
    };
  }

  if (reservation.status === "SIGNING") {
    return {
      label: "전자서명 진행 중",
      className: "signing",
      description: "서명을 완료하면 이곳에서 완료 문서를 확인할 수 있습니다.",
    };
  }

  if (["ABORTED", "PROCESSING_FAILED"].includes(reservation.status)) {
    return {
      label: "전자서명 확인 필요",
      className: "failed",
      description: "전자서명 문서가 저장되지 않았습니다. 고객센터에 문의해 주세요.",
    };
  }

  return {
    label: "전자서명 전",
    className: "pending",
    description: "아직 완료된 전자서명이 없습니다. 전자서명 기능이 준비되면 이곳에 저장됩니다.",
  };
}

function formatKoreanDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function renderMyReservations() {
  mypageReservationCount.textContent = `${myReservations.length}건`;

  if (myReservations.length === 0) {
    mypageReservationList.innerHTML = `
      <div class="mypage-empty">
        <strong>아직 예약 내역이 없습니다.</strong>
        <p>마음에 드는 부산 바다 경험을 선택해 첫 예약을 만들어 보세요.</p>
      </div>
    `;
    return;
  }

  mypageReservationList.innerHTML = myReservations
    .map((reservation) => {
      const status = reservationStatusDetails(reservation.status);
      const createdDate = formatKoreanDate(reservation.createdAt);
      const isExpanded = expandedReservationId === reservation.id;

      return `
        <article class="reservation-card ${isExpanded ? "is-expanded" : ""}">
          <button
            class="reservation-card-toggle"
            type="button"
            data-toggle-reservation="${reservation.id}"
            aria-expanded="${isExpanded}"
          >
            <span class="reservation-card-top">
              <span class="reservation-status is-${status.className}">${status.label}</span>
              <time>${createdDate} 예약</time>
            </span>
            <span class="reservation-card-copy">
              <strong>${escapeHtml(reservation.activity)}</strong>
              <span>${escapeHtml(reservation.venue)}</span>
            </span>
            <span class="reservation-card-open">
              ${isExpanded ? "예약 메뉴 닫기" : "예약 메뉴 열기"}
              <b aria-hidden="true">${isExpanded ? "⌃" : "⌄"}</b>
            </span>
          </button>
          <div class="reservation-card-panel" ${isExpanded ? "" : "hidden"}>
            <button type="button" data-view-reservation="${reservation.id}">
              예약내역 확인하기 <span>→</span>
            </button>
            <button type="button" class="is-secondary" data-reservation-product="${reservation.id}">
              상세페이지로 가기 <span>↗</span>
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function openReservationProduct(reservation) {
  const experience = experiences.find(
    (item) => item.name === reservation.activity,
  );
  if (!experience) {
    showToast("연결된 상품 상세정보를 찾지 못했습니다.");
    return;
  }

  mypageDialog.close();
  openProductDetail(experience.id);
}

function openReservationDetail(reservation) {
  const status = reservationStatusDetails(reservation.status);
  const signature = reservationSignatureDetails(reservation);
  const documentAction = reservation.documentAvailable
    ? `
      <a
        class="reservation-document-button"
        href="/api/reservations/${encodeURIComponent(reservation.id)}/document"
        target="_blank"
        rel="noopener"
      >
        전자서명 확인하기 <span>↗</span>
      </a>
    `
    : `
      <button class="reservation-document-button" type="button" disabled>
        저장된 전자서명 없음
      </button>
    `;

  reservationDetailContent.innerHTML = `
    <section class="reservation-detail-summary">
      <span class="reservation-status is-${status.className}">${status.label}</span>
      <p>예약번호 ${escapeHtml(reservation.id.slice(0, 10).toUpperCase())}</p>
      <h3>${escapeHtml(reservation.activity)}</h3>
      <span>${escapeHtml(reservation.venue)}</span>
    </section>
    <dl class="reservation-detail-grid">
      <div><dt>예약 날짜</dt><dd>${escapeHtml(reservation.date)}${reservation.time ? ` · ${escapeHtml(reservation.time)}` : ""}</dd></div>
      <div><dt>예약 인원</dt><dd>${escapeHtml(reservation.people)}명</dd></div>
      <div><dt>예약자</dt><dd>${escapeHtml(reservation.name)}</dd></div>
      <div><dt>예약 신청일</dt><dd>${formatKoreanDate(reservation.createdAt)}</dd></div>
    </dl>
    <section class="reservation-signature-card is-${signature.className}">
      <div>
        <p>E-SIGNATURE</p>
        <h3>${signature.label}</h3>
        <span>${signature.description}</span>
      </div>
      ${documentAction}
    </section>
  `;

  mypageDialog.close();
  reservationDetailDialog.showModal();
  document.body.classList.add("dialog-open");
}

async function loadMyReservations() {
  mypageReservationList.innerHTML =
    '<p class="mypage-loading">예약과 전자서명 상태를 확인하고 있어요.</p>';

  try {
    const response = await fetch("/api/reservations");
    const result = await response.json();
    if (response.status === 401) {
      currentUser = null;
      updateAuthInterface();
      mypageDialog.close();
      openAuthDialog("login");
    }
    if (!response.ok) throw new Error(result.message || "예약 내역을 불러오지 못했습니다.");
    myReservations = result.reservations;
    renderMyReservations();
  } catch (error) {
    mypageReservationList.innerHTML = `
      <div class="mypage-empty">
        <strong>예약 내역을 불러오지 못했습니다.</strong>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;
  }
}

function openMyPage() {
  mypageUserId.textContent = currentUser.userId;
  mypageEmail.textContent = currentUser.email;
  mypageDialog.showModal();
  document.body.classList.add("dialog-open");
  loadMyReservations();
}

function openBooking(experienceId) {
  if (!currentUser) {
    pendingExperienceId = experienceId;
    openAuthDialog("login");
    showToast("예약하려면 먼저 로그인해 주세요.");
    return;
  }

  const selectedExperience = experiences.find(
    (experience) => experience.id === experienceId,
  );

  if (!selectedExperience) return;

  state.selectedExperience = selectedExperience;
  document.querySelector("#dialog-image").src =
    getProductImage(selectedExperience);
  document.querySelector("#dialog-image").alt = selectedExperience.name;
  document.querySelector("#dialog-title").textContent = selectedExperience.name;
  document.querySelector("#dialog-location").textContent =
    `${selectedExperience.region} · ${selectedExperience.partnerName} · ${selectedExperience.durationMinutes}분`;
  document.querySelector("#dialog-price").textContent = formatPrice(
    selectedExperience.pricePerPerson,
  );

  bookingDate.value = searchDate.value;
  bookingName.value = currentUser.userId;
  bookingEmail.value = currentUser.email;
  bookingTime.innerHTML = selectedExperience.timeSlots
    .map((time) => `<option value="${escapeHtml(time)}">${escapeHtml(time)}</option>`)
    .join("");
  bookingTime.value = selectedExperience.timeSlots[0] ?? "";
  bookingDialog.showModal();
  document.body.classList.add("dialog-open");
}

function renderList(elementId, items, itemTemplate) {
  document.querySelector(elementId).innerHTML = items.map(itemTemplate).join("");
}

function buildVisibleContractTerms(experience, detail, contract) {
  return [
    ...detail.refundRules.map((text) => ({ type: "환불", text })),
    ...detail.bookingConditions.map((text) => ({ type: "예약", text })),
    ...contract.additionalClauses.map((text) => ({ type: "추가", text })),
    ...experience.safetyNotes.map((text) => ({ type: "안전", text })),
  ];
}

function renderContractSummary(result) {
  const summary = result.summary;
  const summaryPanel = document.querySelector("#detail-ai-summary");
  const riskElement = document.querySelector("#detail-ai-risk");

  document.querySelector("#detail-ai-mode").textContent =
    result.mode === "solar" ? "UPSTAGE SOLAR 분석 완료" : "기본 분석 결과";
  riskElement.textContent = `주의도 ${summary.riskLevel}`;
  riskElement.dataset.risk = summary.riskLevel;
  document.querySelector("#detail-ai-headline").textContent = summary.headline;
  renderList(
    "#detail-ai-refund-warnings",
    summary.refundWarnings,
    (item) => `<li>${escapeHtml(item)}</li>`,
  );
  renderList(
    "#detail-ai-watch-out",
    summary.unfairTerms,
    (item) => `<li>${escapeHtml(item)}</li>`,
  );
  summaryPanel.hidden = false;
}

function openProductDetail(experienceId) {
  const selectedExperience = experiences.find(
    (experience) => experience.id === experienceId,
  );
  const detail = productDetails[experienceId];
  const contract = productContracts[experienceId];
  const media = productMedia[experienceId];

  if (!selectedExperience || !detail || !contract || !media) {
    showToast("상품 상세 정보를 불러오지 못했습니다.");
    return;
  }

  state.selectedExperience = selectedExperience;
  document.querySelector("#detail-image").src = getProductImage(selectedExperience);
  document.querySelector("#detail-image").alt = getProductImageAlt(selectedExperience);
  document.querySelector("#detail-category").textContent =
    `${selectedExperience.region} · ${selectedExperience.category}`;
  document.querySelector("#detail-title").textContent = selectedExperience.name;
  document.querySelector("#detail-partner").textContent =
    `${selectedExperience.partnerName} · ★ ${selectedExperience.rating} (${selectedExperience.reviewCount})`;
  document.querySelector("#detail-promotion").textContent = detail.promotion;
  renderList(
    "#detail-story",
    contract.story,
    (paragraph) => `<p>${escapeHtml(paragraph)}</p>`,
  );
  document.querySelector("#detail-price").textContent = formatPrice(
    selectedExperience.pricePerPerson,
  );
  document.querySelector("#detail-location").textContent = selectedExperience.location;
  document.querySelector("#detail-duration").textContent =
    `${selectedExperience.durationMinutes}분`;
  document.querySelector("#detail-age").textContent =
    `만 ${selectedExperience.minAge}세 이상`;
  document.querySelector("#detail-capacity").textContent =
    `${selectedExperience.maxParticipants}명`;
  document.querySelector("#detail-time-slots").textContent =
    selectedExperience.timeSlots.join(" · ");

  renderList(
    "#detail-highlights",
    detail.highlights,
    (item) => `<li>${escapeHtml(item)}</li>`,
  );
  renderList(
    "#detail-itinerary",
    contract.itinerary,
    (item) => `<li>${escapeHtml(item)}</li>`,
  );
  renderList(
    "#detail-gallery",
    media.gallery,
    (imageUrl, index) => `
      <figure>
        <img src="${imageUrl}" alt="${escapeHtml(selectedExperience.name)} 관련 사진 ${index + 1}" loading="lazy" />
      </figure>
    `,
  );

  const photoSource = document.querySelector("#detail-photo-source");
  photoSource.href = media.sourceUrl;
  photoSource.textContent = media.sourceUrl.includes("unsplash.com")
    ? "대표 사진 출처 · Unsplash ↗"
    : "대표 사진 출처 확인 ↗";
  renderList(
    "#detail-included",
    selectedExperience.included,
    (item) => `<span>${escapeHtml(item)}</span>`,
  );
  renderList(
    "#detail-contract-terms",
    buildVisibleContractTerms(selectedExperience, detail, contract),
    (term) =>
      `<li><strong>${escapeHtml(term.type)}.</strong> ${escapeHtml(term.text)}</li>`,
  );

  const cachedSummary = state.contractSummaryCache.get(experienceId);
  const summaryPanel = document.querySelector("#detail-ai-summary");
  const summaryButton = document.querySelector("#detail-ai-summary-button");
  summaryPanel.hidden = true;
  summaryButton.disabled = false;
  summaryButton.querySelector("span").textContent = cachedSummary
    ? "AI 요약 다시 보기"
    : "AI로 이 페이지 요약하기";
  if (cachedSummary) renderContractSummary(cachedSummary);

  productDetailDialog.scrollTop = 0;
  productDetailDialog.showModal();
  document.body.classList.add("dialog-open");
}

async function loadProducts() {
  try {
    const [
      productsResponse,
      detailsResponse,
      contractsResponse,
      mediaResponse,
    ] = await Promise.all([
      fetch("/data/products.json"),
      fetch("/data/product-details.json"),
      fetch("/data/product-contracts.json"),
      fetch("/data/product-media.json"),
    ]);
    if (
      !productsResponse.ok ||
      !detailsResponse.ok ||
      !contractsResponse.ok ||
      !mediaResponse.ok
    ) {
      throw new Error("상품 데이터를 불러오지 못했습니다.");
    }

    const [productsData, detailsData, contractsData, mediaData] = await Promise.all([
      productsResponse.json(),
      detailsResponse.json(),
      contractsResponse.json(),
      mediaResponse.json(),
    ]);
    experiences = productsData.products;
    productDetails = detailsData.details;
    productContracts = contractsData.contracts;
    productMedia = mediaData.media;
    updateCategoryCounts();
    renderExperiences();
  } catch (error) {
    resultCount.textContent = "불러오기 실패";
    resultDescription.textContent = error.message;
    emptyState.hidden = false;
  }
}

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setCategory(button.dataset.category);
  });
});

document.querySelectorAll("[data-region]").forEach((button) => {
  button.addEventListener("click", () => {
    clearRecommendations();
    state.region = button.dataset.region;
    regionSelect.value = state.region;
    renderExperiences();
    document.querySelector("#experiences").scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  clearRecommendations();
  state.region = regionSelect.value;
  state.keyword = keywordInput.value;
  renderExperiences();
  document.querySelector("#experiences").scrollIntoView({ behavior: "smooth" });
});

sortSelect.addEventListener("change", () => {
  state.sort = sortSelect.value;
  state.page = 0;
  renderExperiences();
});

paginationPrev.addEventListener("click", () => {
  if (state.page === 0) return;
  state.page -= 1;
  renderExperiences();
});

paginationNext.addEventListener("click", () => {
  const totalPages = Math.ceil(getVisibleExperiences().length / EXPERIENCES_PER_PAGE);
  if (state.page >= totalPages - 1) return;
  state.page += 1;
  renderExperiences();
});

paginationDots.addEventListener("click", (event) => {
  const pageButton = event.target.closest("[data-page]");
  if (!pageButton) return;
  state.page = Number(pageButton.dataset.page);
  renderExperiences();
});

experienceGrid.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest("[data-favorite]");
  const detailButton = event.target.closest("[data-booking]");

  if (favoriteButton) {
    const experienceId = favoriteButton.dataset.favorite;
    const isFavorite = state.favorites.has(experienceId);

    if (isFavorite) {
      state.favorites.delete(experienceId);
      showToast("찜 목록에서 제외했어요.");
    } else {
      state.favorites.add(experienceId);
      showToast("찜 목록에 담았어요.");
    }

    renderExperiences();
  }

  if (detailButton) {
    openProductDetail(detailButton.dataset.booking);
  }
});

document.querySelector("#detail-close").addEventListener("click", () => {
  productDetailDialog.close();
});

document.querySelector("#detail-book-button").addEventListener("click", () => {
  const experienceId = state.selectedExperience?.id;
  productDetailDialog.close();
  if (experienceId) openBooking(experienceId);
});

productDetailDialog.addEventListener("close", () => {
  if (!bookingDialog.open) document.body.classList.remove("dialog-open");
});

productDetailDialog.addEventListener("click", (event) => {
  if (event.target === productDetailDialog) productDetailDialog.close();
});

document
  .querySelector("#detail-ai-summary-button")
  .addEventListener("click", async () => {
    const selectedExperience = state.selectedExperience;
    if (!selectedExperience) return;

    const summaryButton = document.querySelector("#detail-ai-summary-button");
    const summaryPanel = document.querySelector("#detail-ai-summary");
    summaryButton.disabled = true;
    summaryButton.querySelector("span").textContent = "긴 약관을 읽는 중...";
    summaryPanel.hidden = true;

    try {
      const response = await fetch("/api/contract-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedExperience.id }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "약관을 요약하지 못했습니다.");
      }

      state.contractSummaryCache.set(selectedExperience.id, result);
      renderContractSummary(result);
      summaryButton.querySelector("span").textContent = "AI 요약 다시 보기";
    } catch (error) {
      showToast(error.message);
      summaryButton.querySelector("span").textContent = "AI 요약 다시 시도하기";
    } finally {
      summaryButton.disabled = false;
    }
  });

document.querySelectorAll("[data-notice]").forEach((button) => {
  button.addEventListener("click", () => {
    showToast(button.dataset.notice);
  });
});

loginButton.addEventListener("click", () => {
  if (currentUser) {
    openMyPage();
    return;
  }
  openAuthDialog("login");
});

authModeButtons.forEach((button) => {
  button.addEventListener("click", () => setAuthMode(button.dataset.authMode));
});

document.querySelector("#auth-close").addEventListener("click", () => authDialog.close());

authDialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
  authError.hidden = true;
});

authDialog.addEventListener("click", (event) => {
  if (event.target === authDialog) authDialog.close();
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  authError.hidden = true;
  authSubmit.disabled = true;
  authSubmit.innerHTML = `${authMode === "register" ? "계정 만드는 중…" : "로그인 중…"}`;

  try {
    if (
      authMode === "register" &&
      authPassword.value !== authPasswordConfirm.value
    ) {
      throw new Error("비밀번호와 비밀번호 확인 값이 일치하지 않습니다.");
    }

    const response = await fetch(`/api/auth/${authMode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(authMode === "register" ? { email: authEmail.value } : {}),
        userId: authUserId.value,
        password: authPassword.value,
        ...(authMode === "register"
          ? { passwordConfirm: authPasswordConfirm.value }
          : {}),
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "계정 요청을 처리하지 못했습니다.");

    currentUser = result.user;
    updateAuthInterface();
    authDialog.close();
    showToast(
      result.existing
        ? "이미 가입된 계정으로 로그인되었습니다."
        : authMode === "register"
          ? "회원가입과 로그인이 완료되었습니다."
          : "로그인되었습니다.",
    );

    const experienceId = pendingExperienceId;
    pendingExperienceId = null;
    if (experienceId) openBooking(experienceId);
  } catch (error) {
    authError.textContent = error.message;
    authError.hidden = false;
  } finally {
    authSubmit.disabled = false;
    authSubmit.innerHTML = `${authMode === "register" ? "회원가입" : "로그인"} <span>→</span>`;
  }
});

document.querySelector("#mypage-close").addEventListener("click", () => mypageDialog.close());
document.querySelector("#logout-button").addEventListener("click", logout);

mypageDialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
});

mypageDialog.addEventListener("click", (event) => {
  if (event.target === mypageDialog) mypageDialog.close();
});

mypageReservationList.addEventListener("click", (event) => {
  const toggleButton = event.target.closest("[data-toggle-reservation]");
  if (toggleButton) {
    expandedReservationId =
      expandedReservationId === toggleButton.dataset.toggleReservation
        ? null
        : toggleButton.dataset.toggleReservation;
    renderMyReservations();
    return;
  }

  const productButton = event.target.closest("[data-reservation-product]");
  if (productButton) {
    const reservation = myReservations.find(
      (item) => item.id === productButton.dataset.reservationProduct,
    );
    if (reservation) openReservationProduct(reservation);
    return;
  }

  const detailButton = event.target.closest("[data-view-reservation]");
  if (!detailButton) return;
  const reservation = myReservations.find(
    (item) => item.id === detailButton.dataset.viewReservation,
  );
  if (reservation) openReservationDetail(reservation);
});

document.querySelector("#reservation-detail-back").addEventListener("click", () => {
  reservationDetailDialog.close();
  openMyPage();
});

document.querySelector("#reservation-detail-close").addEventListener("click", () => {
  reservationDetailDialog.close();
});

reservationDetailDialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
});

reservationDetailDialog.addEventListener("click", (event) => {
  if (event.target === reservationDetailDialog) reservationDetailDialog.close();
});

document.querySelector("#open-recommendation").addEventListener("click", () => {
  recommendationError.hidden = true;
  recommendationDialog.showModal();
  document.body.classList.add("dialog-open");
});

document.querySelector(".recommendation-close").addEventListener("click", () => {
  recommendationDialog.close();
});

recommendationDialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
});

recommendationDialog.addEventListener("click", (event) => {
  if (event.target === recommendationDialog) recommendationDialog.close();
});

document
  .querySelector("#recommendation-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    recommendationError.hidden = true;
    recommendationSubmit.disabled = true;
    recommendationSubmit.querySelector("span").textContent = "추천을 찾는 중...";

    const profile = {
      budget: Number(document.querySelector("#recommend-budget").value),
      age: Number(document.querySelector("#recommend-age").value),
      region: document.querySelector("#recommend-region").value,
      category: document.querySelector("#recommend-category").value,
      experienceLevel: document.querySelector("#recommend-level").value,
      canSwim: document.querySelector("#recommend-swimming").value === "true",
      companion: document.querySelector("#recommend-companion").value,
      mood: document.querySelector("#recommend-mood").value,
    };

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "추천 결과를 불러오지 못했습니다.");
      }

      state.recommendedIds = result.recommendations.map(
        (recommendation) => recommendation.product.id,
      );
      state.recommendationMap = new Map(
        result.recommendations.map((recommendation) => [
          recommendation.product.id,
          recommendation,
        ]),
      );
      state.recommendationMessage = result.message;
      state.page = 0;
      state.category = "";
      state.region = "";
      state.keyword = "";
      regionSelect.value = "";
      keywordInput.value = "";

      categoryButtons.forEach((button) => {
        const isActive = button.dataset.category === "";
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });

      recommendationDialog.close();
      renderExperiences();
      document.querySelector("#experiences").scrollIntoView({ behavior: "smooth" });
      showToast(
        result.mode === "solar"
          ? "Solar가 맞춤 추천을 완성했어요."
          : "상품 점수로 추천했어요. Solar 연결 상태를 확인해주세요.",
      );
    } catch (error) {
      recommendationError.textContent = error.message;
      recommendationError.hidden = false;
    } finally {
      recommendationSubmit.disabled = false;
      recommendationSubmit.querySelector("span").textContent = "AI 추천 받기";
    }
  });

document.querySelector(".dialog-close").addEventListener("click", () => {
  bookingDialog.close();
});

bookingDialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
});

bookingDialog.addEventListener("click", (event) => {
  if (event.target === bookingDialog) bookingDialog.close();
});

document.querySelector("#booking-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUser) {
    bookingDialog.close();
    openAuthDialog("login");
    showToast("로그인 정보를 다시 확인해 주세요.");
    return;
  }

  const people = document.querySelector("#booking-people").value;
  const experienceTitle = state.selectedExperience?.name ?? "선택한 경험";
  const submitButton = event.currentTarget.querySelector(".dialog-submit");
  const bookingDraft = {
    name: bookingName.value.trim(),
    productId: state.selectedExperience?.id ?? "",
    people,
    date: bookingDate.value,
    time: bookingTime.value,
    activity: experienceTitle,
    venue: state.selectedExperience?.partnerName ?? "WAVEON BUSAN 제휴 업체",
  };

  submitButton.disabled = true;
  submitButton.textContent = "예약 저장 중…";

  try {
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingDraft),
    });
    const result = await response.json();
    if (response.status === 401) {
      currentUser = null;
      updateAuthInterface();
      bookingDialog.close();
      openAuthDialog("login");
    }
    if (!response.ok) throw new Error(result.message || "예약을 저장하지 못했습니다.");

    pendingBooking = result.reservation;
    contractNotificationRead = false;
    bookingDialog.close();
    notificationBadge.hidden = false;
    contractNotification.hidden = true;
    notificationButton.setAttribute("aria-expanded", "false");
    contractNotificationItem.classList.remove("is-read");
    showToast(
      `${experienceTitle} 예약이 저장됐어요. 계약서 확인 알림을 확인해 주세요.`,
    );
  } catch (error) {
    showToast(error.message);
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = "예약 요청하기 <span>→</span>";
  }
});

function openContractReview() {
  if (!pendingBooking) {
    showToast("확인할 계약서 알림이 없습니다.");
    return;
  }
  notificationBadge.hidden = true;
  contractNotificationRead = true;
  contractNotificationItem.classList.add("is-read");
  contractNotification.hidden = true;
  notificationButton.setAttribute("aria-expanded", "false");
  contractAgreement.checked = false;
  contractBookingSummary.textContent = `${pendingBooking.activity} · ${pendingBooking.date}${pendingBooking.time ? ` ${pendingBooking.time}` : ""} · ${pendingBooking.people}명 / ${pendingBooking.venue}`;
  contractDialog.showModal();
}

notificationButton.addEventListener("click", () => {
  if (!pendingBooking) {
    showToast("새 알림이 없습니다.");
    return;
  }
  const willOpen = contractNotification.hidden;
  contractNotification.hidden = !willOpen;
  notificationButton.setAttribute("aria-expanded", String(willOpen));
  contractNotificationItem.classList.toggle("is-read", contractNotificationRead);
});
contractNotificationItem.addEventListener("click", openContractReview);
contractNotificationItem.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openContractReview();
  }
});
document.querySelector("#contract-close").addEventListener("click", () => contractDialog.close());

startSignatureButton.addEventListener("click", async () => {
  if (!contractAgreement.checked) {
    showToast("계약서 주요 약관을 확인하고 동의해 주세요.");
    return;
  }

  startSignatureButton.disabled = true;
  startSignatureButton.textContent = "계약서 준비 중…";
  try {
    const response = await fetch("/api/signature/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservationId: pendingBooking.id }),
    });
    const result = await response.json();
    if (response.status === 401) {
      currentUser = null;
      updateAuthInterface();
      contractDialog.close();
      notificationBadge.hidden = false;
      contractNotification.hidden = false;
      openAuthDialog("login");
    }
    if (!response.ok) throw new Error(result.message || "전자서명 요청에 실패했습니다.");

    if (result.completed) {
      contractDialog.close();
      showToast("이미 전자서명이 완료된 예약입니다. 마이페이지에서 문서를 확인해 주세요.");
      return;
    }
    if (!result.embeddedUrl) {
      throw new Error("전자서명 화면 주소를 받지 못했습니다.");
    }

    activeReservationId = result.reservationId;
    contractDialog.close();
    signatureFrameLoaded = false;
    signatureStatus.textContent = "계약서에 서명해 주세요.";
    signatureFrameWrap.innerHTML = `
      <iframe title="모두싸인 전자서명" src="${escapeHtml(result.embeddedUrl)}"></iframe>
      <div id="signature-waiting" class="signature-waiting" hidden>
        <strong>서명 완료를 확인하고 있어요</strong>
        <p>완료된 계약서는 로그인 이메일로 보내드리고 마이페이지에도 저장합니다.</p>
      </div>
    `;
    signatureFrameWrap.querySelector("iframe").addEventListener("load", () => {
      if (signatureFrameLoaded) {
        signatureFrameWrap.querySelector("#signature-waiting").hidden = false;
        signatureStatus.textContent = "서명 완료를 확인하고 있어요.";
      }
      signatureFrameLoaded = true;
    });
    signatureDialog.showModal();
    signatureStatusTimer = window.setInterval(checkSignatureStatus, 4000);
  } catch (error) {
    showToast(error.message);
  } finally {
    startSignatureButton.disabled = false;
    startSignatureButton.innerHTML = "전자서명 진행 <span>→</span>";
  }
});

async function checkSignatureStatus() {
  if (!activeReservationId) return;
  try {
    const response = await fetch(`/api/signature/status?reservationId=${encodeURIComponent(activeReservationId)}`);
    const result = await response.json();
    if (response.status === 401) {
      currentUser = null;
      updateAuthInterface();
    }
    if (!response.ok) throw new Error(result.message);
    if (result.status === "COMPLETED") {
      closeSignatureDialog();
      showToast(
        result.forwarded
          ? "전자서명이 완료되어 예약자 이메일로 완료 문서를 보냈습니다!"
          : "전자서명이 완료되어 예약이 확정되었습니다!",
      );
    }
  } catch (error) {
    signatureStatus.textContent = "서명 상태를 확인할 수 없습니다.";
  }
}

function closeSignatureDialog() {
  if (signatureStatusTimer) window.clearInterval(signatureStatusTimer);
  signatureStatusTimer = null;
  activeReservationId = null;
  signatureFrameLoaded = false;
  signatureDialog.close();
  signatureFrameWrap.innerHTML = "";
}

document.querySelector("#signature-close").addEventListener("click", closeSignatureDialog);

document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const emailInput = document.querySelector("#newsletter-email");

  showToast(`${emailInput.value}로 바다 소식을 보내드릴게요.`);
  emailInput.value = "";
});

const menuButton = document.querySelector(".menu-button");
const mainNavigation = document.querySelector("#main-navigation");

menuButton.addEventListener("click", () => {
  const isOpen = mainNavigation.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
});

mainNavigation.addEventListener("click", (event) => {
  if (event.target.closest("a, button")) {
    mainNavigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "메뉴 열기");
  }
});

const localToday = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

searchDate.min = localToday;
bookingDate.min = localToday;

async function initialize() {
  await Promise.all([loadCurrentUser(), loadProducts()]);
}

initialize();
