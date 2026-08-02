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
const sellerSettings = document.querySelector("#seller-settings");
const sellerSettingsToggle = document.querySelector("#seller-settings-toggle");
const sellerSettingsMenu = document.querySelector("#seller-settings-menu");
const sellerSettingsClose = document.querySelector("#seller-settings-close");
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
const reservationNotificationButton = document.querySelector(
  "#seller-reservation-notification",
);
const reservationBadge = document.querySelector("#seller-reservation-badge");
const reservationAlert = document.querySelector("#seller-reservation-alert");
const reservationAlertTitle = document.querySelector(
  "#seller-reservation-alert-title",
);
const contractList = document.querySelector("#seller-contract-list");
const contractDraftDialog = document.querySelector("#contract-draft-dialog");
const contractDraftForm = document.querySelector("#contract-draft-form");
const contractDraftReservation = document.querySelector("#contract-draft-reservation");
const contractDraftError = document.querySelector("#contract-draft-error");
const contractDraftClose = document.querySelector("#contract-draft-close");
const contractDraftSave = document.querySelector("#contract-draft-save");
const contractDraftSend = document.querySelector("#contract-draft-send");
const contractTemplateSelect = document.querySelector("#contract-template-select");
const contractTemplateEdit = document.querySelector("#contract-template-edit");
const contractTemplateStatus = document.querySelector("#contract-template-status");
const contractAiRecommend = document.querySelector("#contract-ai-recommend");
const contractAiResult = document.querySelector("#contract-ai-result");
const contractAiMode = document.querySelector("#contract-ai-mode");
const contractAiMessage = document.querySelector("#contract-ai-message");
const contractAiList = document.querySelector("#contract-ai-list");
const contractReviewNext = document.querySelector("#contract-review-next");
const contractReviewBack = document.querySelector("#contract-review-back");
const contractReviewSummary = document.querySelector("#contract-review-summary");
const contractStartTemplate = document.querySelector("#contract-start-template");
const contractStartManual = document.querySelector("#contract-start-manual");
const draftTemplateWorkflow = document.querySelector("#draft-template-workflow");
const draftManualWorkflow = document.querySelector("#draft-manual-workflow");
const contractManualStart = document.querySelector("#contract-manual-start");
const contractManualToolbar = document.querySelector("#contract-manual-toolbar");
const contractManualLoadBase = document.querySelector("#contract-manual-load-base");
const contractManualDetails = document.querySelector("#draft-manual-details");
const contractManualPreview = document.querySelector("#contract-manual-preview");
const contractManualPreviewContent = document.querySelector(
  "#contract-manual-preview-content",
);
const contractReviewTitle = document.querySelector("#contract-review-title");
const contractReviewDescription = document.querySelector(
  "#contract-review-description",
);
const draftAuthoringLayout = document.querySelector("#draft-authoring-layout");
const contractSafeguardCheck = document.querySelector("#contract-safeguard-check");
const contractSafeguardResult = document.querySelector("#contract-safeguard-result");
const contractDraftStepPanels = document.querySelectorAll("[data-draft-step-panel]");
const contractDraftStepIndicators = document.querySelectorAll(
  "[data-draft-step-indicator]",
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
  activeDraftContractId: "",
  activeDraftReservationId: "",
  templateOptionsByPost: new Map(),
  templateTitleByKey: new Map(),
  activeRecommendedTemplateKeys: [],
  activeDraftMode: "template",
  activeDraftStoredMode: "template",
  activeDraftBase: null,
};

const sellerProductTranslationCache = new Map([
  ["en", new Map()],
  ["ja", new Map()],
  ["zh", new Map()],
]);
const pendingSellerProductTranslations = new Set();
let sellerProductTranslationTimer = null;
let sellerProductTranslationRequest = null;

function sellerText(key, ...args) {
  return window.SellerLocale?.getText?.(key, ...args) ?? "";
}

function sellerContractActionText(action) {
  const copy = {
    reviewDraft: {
      ko: "초안 검토",
      en: "Review draft",
      ja: "下書きを確認",
      zh: "查看草稿",
    },
    deleteDraft: {
      ko: "초안 삭제",
      en: "Delete draft",
      ja: "下書きを削除",
      zh: "删除草稿",
    },
  };
  const locale = window.SellerLocale?.getLocale?.() ?? "ko";
  return copy[action]?.[locale] ?? copy[action]?.ko ?? "";
}

function sellerProductText(value) {
  const source = String(value ?? "").trim();
  const locale = window.SellerLocale?.getLocale?.() ?? "ko";
  if (!source || locale === "ko") return source;

  const cache = sellerProductTranslationCache.get(locale);
  const translation = cache?.get(source);
  if (translation) return translation;

  pendingSellerProductTranslations.add(source);
  if (!sellerProductTranslationTimer && !sellerProductTranslationRequest) {
    sellerProductTranslationTimer = window.setTimeout(() => {
      sellerProductTranslationTimer = null;
      requestSellerProductTranslations();
    }, 80);
  }
  return source;
}

async function requestSellerProductTranslations() {
  const locale = window.SellerLocale?.getLocale?.() ?? "ko";
  if (
    locale === "ko" ||
    sellerProductTranslationRequest ||
    pendingSellerProductTranslations.size === 0
  ) {
    return;
  }

  const texts = [...pendingSellerProductTranslations].slice(0, 24);
  texts.forEach((text) => pendingSellerProductTranslations.delete(text));
  sellerProductTranslationRequest = fetch("/api/interface-translations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ locale, texts }),
  })
    .then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Translation is unavailable.");

      const cache = sellerProductTranslationCache.get(locale);
      result.translations.forEach(({ source, translation }) => {
        if (source && translation) cache?.set(source, translation);
      });
      if ((window.SellerLocale?.getLocale?.() ?? "ko") === locale) {
        renderPosts();
        renderReservations();
        renderContracts();
      }
    })
    .catch((error) => {
      console.error("Seller product translation failed:", error.message);
    })
    .finally(() => {
      sellerProductTranslationRequest = null;
      if (pendingSellerProductTranslations.size > 0) requestSellerProductTranslations();
    });

  await sellerProductTranslationRequest;
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

function reservationNotificationKey(reservation) {
  return [
    reservation.id,
    reservation.status,
    reservation.contract?.id || "",
    reservation.contract?.status || "",
    reservation.cancellationNoticePending ? "notice" : "",
  ].join(":");
}

function getSeenReservationNotificationKeys() {
  const userId = sellerState.user?.userId;
  if (!userId) return new Set();
  try {
    const saved = JSON.parse(
      window.localStorage.getItem(`waveon-seller-seen-notices:${userId}`) || "[]",
    );
    return new Set(Array.isArray(saved) ? saved : []);
  } catch {
    return new Set();
  }
}

function markReservationNotificationsSeen() {
  const userId = sellerState.user?.userId;
  if (!userId) return;
  const notices = [
    ...waitingSellerReservations(),
    ...cancellationRequestReservations(),
    ...cancelledReservationNotices(),
  ];
  const seenKeys = getSeenReservationNotificationKeys();
  notices.forEach((reservation) => seenKeys.add(reservationNotificationKey(reservation)));
  try {
    window.localStorage.setItem(
      `waveon-seller-seen-notices:${userId}`,
      JSON.stringify([...seenKeys]),
    );
  } catch {
    // 브라우저 저장소를 사용할 수 없으면 현재 화면에서만 알림을 정리합니다.
  }
  renderReservationNotifications();
}

function scrollToReservationInbox() {
  markReservationNotificationsSeen();
  document.querySelector("#contracts")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function renderReservationNotifications() {
  const seenKeys = getSeenReservationNotificationKeys();
  const waitingCount = waitingSellerReservations().filter(
    (reservation) => !seenKeys.has(reservationNotificationKey(reservation)),
  ).length;
  const cancellationCount = cancellationRequestReservations().filter(
    (reservation) => !seenKeys.has(reservationNotificationKey(reservation)),
  ).length;
  const cancelledNoticeCount = cancelledReservationNotices().filter(
    (reservation) => !seenKeys.has(reservationNotificationKey(reservation)),
  ).length;
  const attentionCount = waitingCount + cancellationCount + cancelledNoticeCount;
  const hasNotification = attentionCount > 0;

  reservationNotificationButton.hidden = false;
  reservationAlert.hidden = !hasNotification;
  reservationBadge.hidden = !hasNotification;
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
  const toastHost = contractDraftDialog?.open
    ? contractDraftDialog
    : document.body;
  if (toast.parentElement !== toastHost) toastHost.append(toast);
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3200);
}

function contractDraftPayload() {
  const formData = new FormData(contractDraftForm);
  return {
    title: String(formData.get("title") || "").trim(),
    termsAndConditions: String(formData.get("termsAndConditions") || "").trim(),
    refundPolicy: String(formData.get("refundPolicy") || "").trim(),
    safetyNotes: String(formData.get("safetyNotes") || "").trim(),
    additionalClauses: String(formData.get("additionalClauses") || "").trim(),
    sellerMessage: String(formData.get("sellerMessage") || "").trim(),
  };
}

function selectedDraftTemplateKey() {
  return sellerState.activeDraftMode === "manual"
    ? "product-default"
    : contractTemplateSelect.value;
}

function selectedDraftTemplateKeys() {
  return sellerState.activeDraftMode === "manual"
    ? []
    : selectedRecommendedTemplateKeys();
}

function setDraftStartMode(mode) {
  const manualMode = mode === "manual";
  sellerState.activeDraftMode = manualMode ? "manual" : "template";
  contractStartTemplate.classList.toggle("is-active", !manualMode);
  contractStartManual.classList.toggle("is-active", manualMode);
  contractStartTemplate.setAttribute("aria-pressed", String(!manualMode));
  contractStartManual.setAttribute("aria-pressed", String(manualMode));
  draftTemplateWorkflow.hidden = manualMode;
  draftManualWorkflow.hidden = !manualMode;
}

function getSuggestedContractDraft(contract) {
  const post = sellerState.posts.find((item) => item.id === contract?.postId);
  const savedDraft = contract?.draft || {};
  return {
    title:
      savedDraft.title ||
      `${contract?.reservationDate || ""}_${contract?.postTitle || post?.title || "계약서"}_${contract?.customerName || ""}`,
    termsAndConditions:
      post?.termsAndConditions || post?.description || savedDraft.termsAndConditions || "",
    refundPolicy: post?.refundPolicy || savedDraft.refundPolicy || "",
    safetyNotes: Array.isArray(post?.safetyNotes)
      ? post.safetyNotes.join("\n")
      : savedDraft.safetyNotes || "",
    additionalClauses: Array.isArray(post?.participantRequirements)
      ? post.participantRequirements.join("\n")
      : savedDraft.additionalClauses || "",
    sellerMessage: savedDraft.sellerMessage || "",
  };
}

function setContractDraftFields(draft = {}) {
  for (const fieldName of [
    "title",
    "termsAndConditions",
    "refundPolicy",
    "safetyNotes",
    "additionalClauses",
    "sellerMessage",
  ]) {
    contractDraftForm.elements[fieldName].value = draft[fieldName] || "";
  }
  renderContractManualPreview();
}

function renderDraftPreviewSection(number, title, value) {
  return `
    <section>
      <span>${number}</span>
      <div>
        <strong>${escapeHtml(title)}</strong>
        <p class="${value ? "" : "is-empty"}">${value ? escapeHtml(value).replaceAll("\n", "<br />") : "아직 작성하지 않았습니다."}</p>
      </div>
    </section>
  `;
}

function renderContractManualPreview() {
  if (!contractManualPreviewContent) return;
  const contract = sellerState.contracts.find(
    (item) => item.id === sellerState.activeDraftContractId,
  );
  const draft = contractDraftPayload();
  contractManualPreviewContent.innerHTML = `
    <header>
      <small>WAVEON BUSAN · ELECTRONIC CONTRACT</small>
      <h4>${escapeHtml(draft.title || "계약서 제목을 입력해 주세요")}</h4>
      <dl>
        <div><dt>상품</dt><dd>${escapeHtml(contract?.postTitle || "-")}</dd></div>
        <div><dt>구매자</dt><dd>${escapeHtml(contract?.customerName || "-")}</dd></div>
        <div><dt>예약일</dt><dd>${escapeHtml(contract?.reservationDate || "-")}${contract?.reservationTime ? ` · ${escapeHtml(contract.reservationTime)}` : ""}</dd></div>
        <div><dt>인원</dt><dd>${escapeHtml(contract?.people || "-")}명</dd></div>
      </dl>
    </header>
    ${renderDraftPreviewSection("01", "계약 목적·이용 조건", draft.termsAndConditions)}
    ${renderDraftPreviewSection("02", "결제·환불·취소 규정", draft.refundPolicy)}
    ${renderDraftPreviewSection("03", "안전·책임·면책 범위", draft.safetyNotes)}
    ${renderDraftPreviewSection("04", "추가 특약", draft.additionalClauses)}
    ${renderDraftPreviewSection("05", "구매자 전달사항", draft.sellerMessage)}
    <footer>최종 전자서명 문서는 모두싸인 화면에서 다시 확인합니다.</footer>
  `;
}

function setContractReviewMode(mode = sellerState.activeDraftMode) {
  const manualMode = mode === "manual";
  sellerState.activeDraftMode = manualMode ? "manual" : "template";
  contractReviewTitle.textContent = manualMode
    ? "계약서 초안 직접 작성"
    : "선택한 계약서 검토·수정";
  contractReviewDescription.textContent = manualMode
    ? "예약 기본정보는 자동으로 연결됩니다. 계약 내용을 조항별로 직접 작성해 주세요."
    : "예약 정보와 선택한 계약서를 확인한 뒤 모두싸인에서 실제 문서를 수정하세요.";
  contractManualToolbar.hidden = !manualMode;
  contractManualPreview.hidden = !manualMode;
  draftAuthoringLayout.classList.toggle("is-manual", manualMode);
  contractManualDetails.open = manualMode;
  contractTemplateEdit.innerHTML = manualMode
    ? "모두싸인에서 서명 문서 최종 확인 <span>↗</span>"
    : "모두싸인에서 실제 계약서 검토·수정 <span>↗</span>";
  if (!contractDraftSend.disabled) {
    contractDraftSend.textContent = manualMode
      ? "직접 작성 초안 최종 서명 요청"
      : "수정 없이 최종 서명 요청";
  }
  document.querySelector("#draft-mapping-note").textContent = manualMode
    ? "직접 입력한 값은 모두싸인 기본 전자서명 서식의 해당 입력란에 반영됩니다. 최종 발송 전 모두싸인 화면에서 실제 문서를 다시 확인하세요."
    : "수정한 값은 모두싸인 템플릿에 같은 이름의 요청자 입력란이 있을 때 실제 서명 문서에 자동 반영됩니다.";
  renderContractManualPreview();
}

function setContractDraftBusy(isBusy, message = "") {
  contractDraftSave.disabled = isBusy;
  contractDraftSend.disabled = isBusy;
  contractDraftClose.disabled = isBusy;
  contractTemplateEdit.disabled = isBusy;
  contractAiRecommend.disabled = isBusy;
  contractSafeguardCheck.disabled = isBusy;
  contractReviewNext.disabled = isBusy;
  contractReviewBack.disabled = isBusy;
  contractStartTemplate.disabled = isBusy;
  contractStartManual.disabled = isBusy;
  contractManualStart.disabled = isBusy;
  contractManualLoadBase.disabled = isBusy;
  contractDraftSend.textContent =
    message ||
    (sellerState.activeDraftMode === "manual"
      ? "직접 작성 초안 최종 서명 요청"
      : "수정 없이 최종 서명 요청");
}

function setContractDraftStep(step) {
  contractDraftStepPanels.forEach((panel) => {
    const panelStep = panel.dataset.draftStepPanel;
    panel.hidden = step === "send" ? panelStep !== "review" : panelStep !== step;
  });
  const stepOrder = ["select", "review", "send"];
  const activeIndex = stepOrder.indexOf(step);
  contractDraftStepIndicators.forEach((indicator) => {
    const indicatorIndex = stepOrder.indexOf(indicator.dataset.draftStepIndicator);
    indicator.classList.toggle("is-active", indicatorIndex === activeIndex);
    indicator.classList.toggle("is-completed", indicatorIndex < activeIndex);
  });
}

function renderContractReviewSummary() {
  if (sellerState.activeDraftMode === "manual") {
    contractReviewSummary.innerHTML = `
      <strong>직접 작성 계약서</strong>
      <div class="contract-review-template-list">
        <span>예약 정보 자동 연결</span><span>기본 전자서명 서식</span><span>직접 작성 조항</span>
      </div>
      <p>판매자가 입력한 계약 내용으로 초안을 저장합니다. 서명 위치와 실제 반영 내용을 모두싸인 화면에서 확인한 뒤 구매자에게 발송해 주세요.</p>
    `;
    return;
  }
  const recommendedKeys = selectedRecommendedTemplateKeys();
  const templateKeys = recommendedKeys.length
    ? recommendedKeys
    : [contractTemplateSelect.value];
  const templateTitles = templateKeys.map((key) =>
    key === "product-default"
      ? contractTemplateSelect.options[contractTemplateSelect.selectedIndex]?.text ||
        "상품 기본 계약서 묶음"
      : sellerState.templateTitleByKey.get(key) || key,
  );
  contractReviewSummary.innerHTML = `
    <strong>${recommendedKeys.length ? `AI 추천 계약서 ${recommendedKeys.length}종` : "직접 선택한 계약서"}</strong>
    <div class="contract-review-template-list">
      ${templateTitles.map((title) => `<span>${escapeHtml(title)}</span>`).join("")}
    </div>
    <p>다음 버튼을 누르면 모두싸인에 예약별 복사본을 만들고 실제 계약서 내용을 검토·수정할 수 있습니다. 수정이 필요 없다면 아래 최종 서명 요청을 사용할 수 있습니다.</p>
  `;
}

function selectedRecommendedTemplateKeys() {
  if (!sellerState.activeRecommendedTemplateKeys.length) return [];
  if (contractAiResult.hidden) return sellerState.activeRecommendedTemplateKeys;
  return [...contractAiList.querySelectorAll("[data-contract-template-key]:checked")]
    .map((input) => input.dataset.contractTemplateKey)
    .filter(Boolean);
}

function renderContractRecommendations(result) {
  const priorityLabels = {
    required: "필수",
    recommended: "추천",
    optional: "선택",
  };
  sellerState.activeRecommendedTemplateKeys = result.recommendedTemplateKeys || [];
  contractAiMode.textContent = result.mode === "solar" ? "SOLAR AI" : "기본 안전 규칙";
  contractAiMessage.textContent = result.message || "";
  contractAiList.innerHTML = (result.recommendations || [])
    .map(
      (item) => `
        <label class="contract-ai-item">
          <input
            type="checkbox"
            data-contract-template-key="${escapeHtml(item.key)}"
            ${item.selected ? "checked" : ""}
            ${item.ruleRequired ? "disabled" : ""}
          />
          <span class="contract-ai-item-copy">
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.reason)}</span>
          </span>
          <span class="contract-ai-priority ${item.priority === "required" ? "is-required" : ""}">${priorityLabels[item.priority] || "선택"}</span>
        </label>
      `,
    )
    .join("");
  contractAiResult.hidden = false;
  contractTemplateStatus.textContent = `AI 추천 계약서 ${sellerState.activeRecommendedTemplateKeys.length}종을 선택했습니다. 아래 항목을 확인한 뒤 초안을 열어 주세요.`;
}

async function loadContractTemplateOptions(postId, selectedKey = "product-default") {
  let templateData = sellerState.templateOptionsByPost.get(postId);
  if (!templateData) {
    templateData = await requestJson(
      `/api/seller/contract-templates?postId=${encodeURIComponent(postId)}`,
    );
    sellerState.templateOptionsByPost.set(postId, templateData);
  }

  const recommended = templateData.templates.filter((item) => item.recommended);
  const others = templateData.templates.filter((item) => !item.recommended);
  templateData.templates.forEach((item) => {
    sellerState.templateTitleByKey.set(item.key, item.title);
  });
  const renderOptions = (items) =>
    items
      .map(
        (item) =>
          `<option value="${escapeHtml(item.key)}">${escapeHtml(item.title)}</option>`,
      )
      .join("");
  contractTemplateSelect.innerHTML = `
    <option value="product-default">${escapeHtml(templateData.defaultOption.title)}</option>
    ${recommended.length ? `<optgroup label="이 상품에 추천">${renderOptions(recommended)}</optgroup>` : ""}
    ${others.length ? `<optgroup label="전체 템플릿">${renderOptions(others)}</optgroup>` : ""}
  `;
  contractTemplateSelect.value =
    [...contractTemplateSelect.options].some((option) => option.value === selectedKey)
      ? selectedKey
      : "product-default";
}

function fillContractDraftForm(contract, reservation) {
  const draft = contract.draft || {};
  contractDraftReservation.innerHTML = `
    <div><span>상품</span><strong>${escapeHtml(contract.postTitle || reservation?.activity)}</strong></div>
    <div><span>구매자</span><strong>${escapeHtml(contract.customerName)} · ${escapeHtml(contract.customerEmail)}</strong></div>
    <div><span>예약 일시</span><strong>${formatReservationDate(contract.reservationDate)}${contract.reservationTime ? ` · ${escapeHtml(contract.reservationTime)}` : ""}</strong></div>
    <div><span>인원</span><strong>${escapeHtml(contract.people)}명</strong></div>
  `;
  sellerState.activeDraftContractId = contract.id;
  sellerState.activeDraftReservationId = contract.reservationId;
  sellerState.activeDraftStoredMode = contract.draftMode === "manual" ? "manual" : "template";
  sellerState.activeDraftBase = getSuggestedContractDraft(contract);
  sellerState.activeRecommendedTemplateKeys = Array.isArray(
    contract.selectedTemplateKeys,
  )
    ? [...contract.selectedTemplateKeys]
    : [];
  setContractDraftFields(draft);
  setDraftStartMode(sellerState.activeDraftStoredMode);
  setContractReviewMode(sellerState.activeDraftStoredMode);
  setFormError(contractDraftError);
  contractSafeguardResult.hidden = true;
  contractSafeguardResult.innerHTML = "";
  setContractDraftBusy(false);
}

async function openContractDraft(reservationId, contractId = "") {
  try {
    contractAiResult.hidden = true;
    contractAiList.innerHTML = "";
    let contract = contractId
      ? sellerState.contracts.find((item) => item.id === contractId)
      : null;
    if (!contract) {
      const result = await requestJson("/api/seller/contracts/draft", {
        method: "POST",
        body: JSON.stringify({ reservationId }),
      });
      contract = result.contract;
      await loadOverview();
    }
    const reservation = sellerState.reservations.find(
      (item) => item.id === (contract.reservationId || reservationId),
    );
    await loadContractTemplateOptions(
      contract.postId,
      contract.selectedTemplateKey || "product-default",
    );
    fillContractDraftForm(contract, reservation);
    contractTemplateStatus.textContent = contract.selectedTemplateKeys?.length
      ? `저장된 AI 추천 계약서 ${contract.selectedTemplateKeys.length}종을 사용합니다. 추천받기 버튼을 누르면 근거를 다시 확인할 수 있습니다.`
      : contract.embeddedDraftId
        ? `${contract.selectedTemplateTitle} 초안이 생성되어 있습니다. 다시 열면 새 편집 초안을 만듭니다.`
        : "템플릿을 선택하거나 AI 추천을 받은 뒤 모두싸인 편집 화면을 열어 주세요.";
    setContractDraftStep("select");
    contractDraftDialog.showModal();
  } catch (error) {
    if (error.status === 401) {
      showLogin();
      return;
    }
    showToast(getSellerErrorMessage(error));
    await loadOverview();
  }
}

async function saveContractDraft({ silent = false } = {}) {
  const contractId = sellerState.activeDraftContractId;
  if (!contractId) return null;
  const result = await requestJson(
    `/api/seller/contracts/${encodeURIComponent(contractId)}/draft`,
    {
      method: "PATCH",
      body: JSON.stringify({
        draft: contractDraftPayload(),
        draftMode: sellerState.activeDraftMode,
        templateKey: selectedDraftTemplateKey(),
        templateKeys: selectedDraftTemplateKeys(),
      }),
    },
  );
  if (!silent) showToast("계약 초안을 저장했습니다. 아직 발송되지 않았습니다.");
  sellerState.contracts = sellerState.contracts.map((contract) =>
    contract.id === result.contract.id ? result.contract : contract,
  );
  renderContracts();
  return result.contract;
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
  setSellerSettingsOpen(false);
  sellerState.user = null;
  sellerState.overviewLoaded = false;
  reservationNotificationButton.hidden = true;
  reservationAlert.hidden = true;
  sellerAccess.hidden = false;
  sellerDashboard.hidden = true;
}

function showDashboard() {
  sellerAccess.hidden = true;
  sellerDashboard.hidden = false;
}

function setSellerSettingsOpen(isOpen) {
  sellerSettingsMenu.hidden = !isOpen;
  sellerSettingsToggle.setAttribute("aria-expanded", String(isOpen));
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
    ABORTED: { label: "요청 취소", className: "is-failed" },
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
      (post) => {
        const title = sellerProductText(post.title);
        const category = sellerProductText(post.category);
        const description = sellerProductText(post.description);
        const partnerName = sellerProductText(post.partnerName);
        const region = sellerProductText(post.region);
        return `
        <article
          class="seller-post-card seller-post-card-link"
          data-edit-seller-post="/seller/edit/${encodeURIComponent(post.id)}"
          role="link"
          tabindex="0"
          aria-label="${escapeHtml(title)} ${sellerText("productEdit")}" 
        >
          ${
            post.thumbnailImage
              ? `<img class="seller-post-image" src="${escapeHtml(post.thumbnailImage)}" alt="${escapeHtml(title)} ${sellerText("productPhoto")}" />`
              : ""
          }
          <div class="seller-post-card-body">
            <div class="card-top">
              <span class="card-status">${escapeHtml(category)}</span>
              <time>${formatDate(post.createdAt)}</time>
            </div>
            <h4>${escapeHtml(title)}</h4>
            <p>${escapeHtml(description)}</p>
            <div class="post-meta">
              <span>${escapeHtml(partnerName)}</span>
              <span>${escapeHtml(region)}</span>
              <span>${sellerText("priceWithCurrency", formatPrice(post.pricePerPerson))}</span>
              <span>${sellerText("minutes", escapeHtml(post.durationMinutes))}</span>
              <span>${sellerText("difficulty", escapeHtml(post.difficulty || 2))}</span>
              <span>${sellerText("maxParticipants", escapeHtml(post.maxParticipants))}</span>
            </div>
            <div class="seller-post-actions">
              <a
                class="post-edit-hint"
                href="/seller/edit/${encodeURIComponent(post.id)}"
                aria-label="${escapeHtml(title)} ${sellerText("productEdit")}" 
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
          </div>
        </article>
      `;
      },
    )
    .join("");
}

function renderReservations() {
  const waitingReservations = waitingSellerReservations();
  const attentionCount =
    waitingReservations.length +
    cancellationRequestReservations().length +
    cancelledReservationNotices().length;
  reservationCount.textContent = sellerText(
    "contractCount",
    attentionCount,
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
      const activity = sellerProductText(reservation.activity);
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
        if (contract.status === "DRAFT") {
          actionItems.push(`
            <button
              class="send-contract-button"
              type="button"
              data-review-contract-draft="${escapeHtml(contract.id)}"
              data-draft-reservation="${escapeHtml(reservation.id)}"
            >
              ${sellerContractActionText("reviewDraft")} <span>→</span>
            </button>
          `);
        }
      } else {
        actionItems.push(`
              <p class="template-delivery-note">
                ${
                  sellerState.modusignConfigured
                    ? `${escapeHtml(reservation.email)} · 발송 전 초안을 먼저 검토합니다.`
                    : sellerText("eContractSetupRequired")
                }
              </p>
              <button
                class="send-contract-button"
                type="button"
                data-send-contract="${escapeHtml(reservation.id)}"
                ${sellerState.modusignConfigured ? "" : "disabled"}
              >
                ${
                  sellerState.modusignConfigured
                    ? sellerText("sendContract")
                    : sellerText("eContractSetupRequired")
                }
                <span>→</span>
              </button>
            `);
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
          <h4>${escapeHtml(activity)}</h4>
          <div class="reservation-customer">
            <strong>${escapeHtml(reservation.name)}</strong>
            <span>${escapeHtml(reservation.email)}</span>
          </div>
          <div class="contract-meta">
            <span class="reservation-date">${sellerText("usageDate")} ${formatReservationDate(reservation.date)}</span>
            <span class="reservation-detail-row">
              ${reservation.time ? `<span>${escapeHtml(reservation.time)}</span>` : ""}
              <span>${sellerText("people", escapeHtml(reservation.people))}</span>
              ${reservation.isMinor ? `<span>${escapeHtml(sellerText("minorReservation"))}</span>` : ""}
            </span>
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
      const postTitle = sellerProductText(contract.postTitle);
      const needsUnifiedResend =
        contract.documentId &&
        !contract.deliveryMode &&
        !["COMPLETED", "SIGNED"].includes(contract.status);
      const canArchiveContract = contract.status !== "SENDING";
      const actions = [];
      if (contract.status === "DRAFT") {
        actions.push(
          `<button class="seller-small-button is-primary" type="button" data-review-contract-draft="${escapeHtml(contract.id)}">${sellerContractActionText("reviewDraft")}</button>`,
        );
      } else if (contract.status === "SEND_FAILED" || needsUnifiedResend) {
        actions.push(
          `<button class="seller-small-button" type="button" data-resend-contract="${escapeHtml(contract.id)}">${sellerText("resend")}</button>`,
        );
      } else if (contract.documentId) {
        actions.push(
          `<button class="seller-small-button" type="button" data-refresh-contract="${escapeHtml(contract.id)}">${sellerText("checkStatus")}</button>`,
        );
      }
      if (canArchiveContract) {
        actions.push(
          `<button class="seller-small-button is-archive" type="button" data-archive-contract="${escapeHtml(contract.id)}">${contract.status === "DRAFT" ? sellerContractActionText("deleteDraft") : sellerText("confirmAndRemove")}</button>`,
        );
      }
      const action = actions.join("");

      return `
        <article class="seller-contract-card">
          <div class="card-top">
            <span class="card-status ${status.className}">${escapeHtml(status.label)}</span>
            <time>${formatDate(contract.createdAt, true)}</time>
          </div>
          <h4>${escapeHtml(postTitle)}</h4>
          <div class="reservation-customer">
            <strong>${escapeHtml(contract.customerName)}</strong>
            <span>${escapeHtml(contract.customerEmail)}</span>
          </div>
          <div class="contract-meta">
            <span>${sellerText("usageDate")} ${formatReservationDate(contract.reservationDate)}</span>
            ${contract.reservationTime ? `<span>${escapeHtml(contract.reservationTime)}</span>` : ""}
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
    const newCancelledNoticeCount = sellerState.overviewLoaded
      ? incomingReservations.filter(
          (reservation) =>
            ["CANCELLED", "SELLER_CANCELLED"].includes(reservation.status) &&
            reservation.cancellationNoticePending &&
            previousReservationStatuses.get(reservation.id) !==
              reservation.status,
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

    if (
      silent &&
      (newReservationCount > 0 ||
        newCancellationCount > 0 ||
        newCancelledNoticeCount > 0)
    ) {
      const updates = [];
      if (newReservationCount > 0) {
        updates.push(sellerText("newReservationCount", newReservationCount));
      }
      if (newCancellationCount > 0) {
        updates.push(sellerText("cancellationRequestCount", newCancellationCount));
      }
      if (newCancelledNoticeCount > 0) {
        updates.push(sellerText("cancellationNoticeCount", newCancelledNoticeCount));
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

sellerSettingsToggle.addEventListener("click", () => {
  setSellerSettingsOpen(sellerSettingsMenu.hidden);
});

sellerSettingsClose.addEventListener("click", () => {
  setSellerSettingsOpen(false);
  sellerSettingsToggle.focus();
});

document.addEventListener("click", (event) => {
  if (!sellerSettingsMenu.hidden && !sellerSettings.contains(event.target)) {
    setSellerSettingsOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !sellerSettingsMenu.hidden) {
    setSellerSettingsOpen(false);
    sellerSettingsToggle.focus();
  }
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
  if (!deleteButton) {
    const editCard = event.target.closest("[data-edit-seller-post]");
    if (!editCard || event.target.closest("a, button")) return;
    window.location.href = editCard.dataset.editSellerPost;
    return;
  }

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

postList.addEventListener("keydown", (event) => {
  const editCard = event.target.closest("[data-edit-seller-post]");
  if (!editCard || event.target !== editCard) return;
  if (!["Enter", " "].includes(event.key)) return;

  event.preventDefault();
  window.location.href = editCard.dataset.editSellerPost;
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

  const draftReviewButton = event.target.closest("[data-review-contract-draft]");
  if (draftReviewButton) {
    await openContractDraft(
      draftReviewButton.dataset.draftReservation || "",
      draftReviewButton.dataset.reviewContractDraft,
    );
    return;
  }

  const actionButton = event.target.closest("[data-send-contract]");
  if (!actionButton) {
    return;
  }

  const reservation = sellerState.reservations.find(
    (item) => item.id === actionButton.dataset.sendContract,
  );
  if (!reservation) return;

  actionButton.disabled = true;
  actionButton.textContent = "초안 생성 중…";

  try {
    await openContractDraft(actionButton.dataset.sendContract);
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
    "[data-resend-contract], [data-refresh-contract], [data-archive-contract], [data-review-contract-draft]",
  );

  if (!actionButton) {
    return;
  }

  if (actionButton.dataset.reviewContractDraft) {
    const contract = sellerState.contracts.find(
      (item) => item.id === actionButton.dataset.reviewContractDraft,
    );
    await openContractDraft(
      contract?.reservationId || "",
      actionButton.dataset.reviewContractDraft,
    );
    return;
  }

  const contractId =
    actionButton.dataset.resendContract ||
    actionButton.dataset.refreshContract ||
    actionButton.dataset.archiveContract;
  const action = actionButton.dataset.archiveContract
    ? "archive"
    : actionButton.dataset.resendContract
      ? "resend"
      : "refresh";
  const selectedContract = sellerState.contracts.find(
    (item) => item.id === contractId,
  );
  if (
    action === "archive" &&
    !window.confirm(
      selectedContract?.status === "DRAFT"
        ? "저장한 계약 초안을 삭제하시겠습니까?\n예약은 삭제되지 않으며 새 초안을 다시 만들 수 있습니다."
        : "이 계약 발송 내역을 목록에서 정리하시겠습니까?\n모두싸인 계약과 전자서명 문서는 삭제되지 않습니다.",
    )
  ) {
    return;
  }

  actionButton.disabled = true;

  try {
    await requestJson(`/api/seller/contracts/${encodeURIComponent(contractId)}/${action}`, {
      method: "POST",
    });
    await loadOverview();
    showToast(
      action === "archive"
        ? selectedContract?.status === "DRAFT"
          ? "계약 초안을 삭제했습니다. 예약에서 다시 만들 수 있습니다."
          : "확인한 계약 발송 내역을 목록에서 정리했습니다."
        : action === "resend"
        ? "구매자 웹 알림과 이메일로 계약서를 다시 발송했습니다."
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

contractDraftClose.addEventListener("click", () => {
  contractDraftDialog.close();
});

contractDraftDialog.addEventListener("click", (event) => {
  if (event.target === contractDraftDialog) contractDraftDialog.close();
});
contractDraftDialog.addEventListener("close", () => {
  if (toast.parentElement === contractDraftDialog) document.body.append(toast);
});

contractStartTemplate.addEventListener("click", () => {
  if (
    sellerState.activeDraftMode === "manual" &&
    sellerState.activeDraftStoredMode !== "manual" &&
    sellerState.activeDraftBase
  ) {
    setContractDraftFields(sellerState.activeDraftBase);
  }
  setDraftStartMode("template");
});

contractStartManual.addEventListener("click", () => {
  setDraftStartMode("manual");
});

contractManualStart.addEventListener("click", () => {
  if (sellerState.activeDraftStoredMode !== "manual") {
    const title = sellerState.activeDraftBase?.title || contractDraftPayload().title;
    setContractDraftFields({ title });
  }
  setDraftStartMode("manual");
  setContractReviewMode("manual");
  renderContractReviewSummary();
  setContractDraftStep("review");
});

contractManualLoadBase.addEventListener("click", () => {
  if (!sellerState.activeDraftBase) return;
  setContractDraftFields(sellerState.activeDraftBase);
  showToast("판매 상품의 기본 약관과 안전 정보를 불러왔습니다.");
});

contractReviewNext.addEventListener("click", () => {
  setDraftStartMode("template");
  setContractReviewMode("template");
  renderContractReviewSummary();
  setContractDraftStep("review");
});

contractReviewBack.addEventListener("click", () => {
  setDraftStartMode(sellerState.activeDraftMode);
  setContractDraftStep("select");
});

contractDraftForm.addEventListener("input", (event) => {
  if (
    sellerState.activeDraftMode === "manual" &&
    event.target.matches("input[name], textarea[name]")
  ) {
    renderContractManualPreview();
  }
});

contractSafeguardCheck.addEventListener("click", async () => {
  const contractId = sellerState.activeDraftContractId;
  if (!contractId) return;

  contractSafeguardCheck.disabled = true;
  contractSafeguardCheck.textContent = "점검 중…";
  try {
    const result = await requestJson(
      `/api/seller/contracts/${encodeURIComponent(contractId)}/safeguards`,
      {
        method: "POST",
        body: JSON.stringify({ draft: contractDraftPayload() }),
      },
    );
    const review = result.review;
    const clauses = review.standardClauses || [];
    contractSafeguardResult.innerHTML = `
      <p class="contract-safeguard-missing"><strong>보완이 필요한 항목</strong><span>${(review.missingSafeguards || []).map(escapeHtml).join(" · ") || "추가 확인이 필요한 항목이 없습니다."}</span></p>
      ${clauses.length ? `<div class="contract-safeguard-clauses">${clauses.map((clause, index) => `<label><input type="checkbox" data-safeguard-clause="${index}" checked /><span>${escapeHtml(clause)}</span></label>`).join("")}</div><button type="button" data-apply-safeguards>선택 문구를 추가 특약에 반영</button>` : ""}
    `;
    contractSafeguardResult.hidden = false;
  } catch (error) {
    showToast(getSellerErrorMessage(error));
  } finally {
    contractSafeguardCheck.disabled = false;
    contractSafeguardCheck.textContent = "안전장치 점검하기";
  }
});

contractSafeguardResult.addEventListener("click", (event) => {
  const applyButton = event.target.closest("[data-apply-safeguards]");
  if (!applyButton) return;
  const clauses = [...contractSafeguardResult.querySelectorAll("[data-safeguard-clause]:checked")]
    .map((input) => input.nextElementSibling?.textContent?.trim())
    .filter(Boolean);
  if (!clauses.length) return;
  const field = contractDraftForm.elements.additionalClauses;
  const existing = String(field.value || "").trim();
  const uniqueClauses = clauses.filter((clause) => !existing.includes(clause));
  field.value = [existing, ...uniqueClauses].filter(Boolean).join("\n");
  showToast("선택한 표준 문구를 추가 특약에 반영했습니다. 저장 후 계약서를 열어 주세요.");
});

contractAiRecommend.addEventListener("click", async () => {
  const contract = sellerState.contracts.find(
    (item) => item.id === sellerState.activeDraftContractId,
  );
  if (!contract?.postId) return;

  contractAiRecommend.disabled = true;
  contractAiRecommend.textContent = "AI 분석 중…";
  contractTemplateStatus.textContent = "상품의 활동 방식과 위험 요소를 분석하고 있습니다…";
  setFormError(contractDraftError);
  try {
    const result = await requestJson("/api/seller/contract-recommendations", {
      method: "POST",
      body: JSON.stringify({
        postId: contract.postId,
        reservationId: contract.reservationId,
      }),
    });
    renderContractRecommendations(result);
  } catch (error) {
    if (error.status === 401) {
      contractDraftDialog.close();
      showLogin();
      return;
    }
    setRequestError(contractDraftError, error);
    contractTemplateStatus.textContent = "계약서 추천을 준비하지 못했습니다.";
  } finally {
    contractAiRecommend.disabled = false;
    contractAiRecommend.textContent = "AI 계약서 추천받기";
  }
});

contractAiList.addEventListener("change", () => {
  sellerState.activeRecommendedTemplateKeys = selectedRecommendedTemplateKeys();
  contractTemplateStatus.textContent = `추천 계약서 ${sellerState.activeRecommendedTemplateKeys.length}종을 사용합니다.`;
});

contractTemplateSelect.addEventListener("change", async () => {
  sellerState.activeRecommendedTemplateKeys = [];
  contractAiResult.hidden = true;
  const selectedTitle =
    contractTemplateSelect.options[contractTemplateSelect.selectedIndex]?.text ||
    "선택한 템플릿";
  contractTemplateStatus.textContent = `${selectedTitle}을(를) 예약별 초안으로 복사해 엽니다.`;
});

contractTemplateSelect.addEventListener("change", async () => {
  try {
    await saveContractDraft({ silent: true });
  } catch (error) {
    setRequestError(contractDraftError, error);
  }
});

contractTemplateEdit.addEventListener("click", async () => {
  setFormError(contractDraftError);
  if (!contractDraftForm.reportValidity()) {
    document.querySelector(".draft-manual-details")?.setAttribute("open", "");
    return;
  }

  const editorWindow = window.open(
    "",
    "waveon-modusign-draft",
    "width=1440,height=900,scrollbars=yes,resizable=yes",
  );
  if (!editorWindow) {
    setFormError(
      contractDraftError,
      "팝업이 차단되었습니다. 브라우저에서 이 사이트의 팝업을 허용해 주세요.",
    );
    return;
  }
  editorWindow.document.title = "모두싸인 계약 초안 준비 중";
  editorWindow.document.body.textContent = "모두싸인 계약 초안 편집 화면을 준비하고 있습니다…";

  setContractDraftBusy(true);
  contractTemplateStatus.textContent =
    sellerState.activeDraftMode === "manual"
      ? "직접 작성한 내용을 기본 전자서명 서식에 반영하고 있습니다…"
      : "선택한 템플릿으로 편집 초안을 만드는 중입니다…";
  try {
    const contractId = sellerState.activeDraftContractId;
    const result = await requestJson(
      `/api/seller/contracts/${encodeURIComponent(contractId)}/embedded-draft`,
      {
        method: "POST",
        body: JSON.stringify({
          draft: contractDraftPayload(),
          draftMode: sellerState.activeDraftMode,
          templateKey: selectedDraftTemplateKey(),
          templateKeys: selectedDraftTemplateKeys(),
        }),
      },
    );
    contractTemplateStatus.textContent = sellerState.activeDraftMode === "manual"
      ? "모두싸인 확인 화면이 열렸습니다. 직접 작성한 내용과 서명 위치를 확인한 뒤 서명 요청을 완료해 주세요."
      : "모두싸인 편집 화면이 열렸습니다. 내용을 수정한 뒤 그 화면에서 서명 요청을 완료해 주세요.";
    setContractDraftStep("send");
    editorWindow.location.replace(result.embeddedUrl);
    await loadOverview();
  } catch (error) {
    editorWindow.close();
    if (error.status === 401) {
      contractDraftDialog.close();
      showLogin();
      return;
    }
    setRequestError(contractDraftError, error);
    contractTemplateStatus.textContent = "모두싸인 편집 화면을 열지 못했습니다.";
    setContractDraftStep("review");
  } finally {
    setContractDraftBusy(false);
  }
});

contractDraftSave.addEventListener("click", async () => {
  setFormError(contractDraftError);
  setContractDraftBusy(true, "저장 중… ");
  try {
    const contract = await saveContractDraft();
    const reservation = sellerState.reservations.find(
      (item) => item.id === contract?.reservationId,
    );
    if (contract) fillContractDraftForm(contract, reservation);
    await loadOverview();
  } catch (error) {
    if (error.status === 401) {
      contractDraftDialog.close();
      showLogin();
      return;
    }
    setRequestError(contractDraftError, error);
  } finally {
    setContractDraftBusy(false);
  }
});

contractDraftForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFormError(contractDraftError);
  if (!contractDraftForm.reportValidity()) return;
  if (
    !window.confirm(
      sellerState.activeDraftMode === "manual"
        ? "직접 작성한 계약 초안을 구매자에게 바로 발송하시겠습니까?\n구매자 웹 알림과 이메일로 전송되며 발송 후에는 수정할 수 없습니다."
        : "모두싸인 편집 화면을 열지 않고 선택한 템플릿을 바로 발송하시겠습니까?\n구매자 웹 알림과 이메일로 전송되며 발송 후에는 수정할 수 없습니다.",
    )
  ) {
    return;
  }

  const contractId = sellerState.activeDraftContractId;
  setContractDraftStep("send");
  setContractDraftBusy(true, "계약서 발송 중… ");
  try {
    await requestJson(
      `/api/seller/contracts/${encodeURIComponent(contractId)}/send`,
      {
        method: "POST",
        body: JSON.stringify({
          draft: contractDraftPayload(),
          draftMode: sellerState.activeDraftMode,
          templateKey: selectedDraftTemplateKey(),
          templateKeys: selectedDraftTemplateKeys(),
        }),
      },
    );
    contractDraftDialog.close();
    sellerState.activeDraftContractId = "";
    sellerState.activeDraftReservationId = "";
    await loadOverview();
    showToast("구매자 웹 알림과 이메일로 검토한 계약서를 발송했습니다.");
  } catch (error) {
    if (error.status === 401) {
      contractDraftDialog.close();
      showLogin();
      return;
    }
    setRequestError(contractDraftError, error);
    setContractDraftStep("review");
    await loadOverview();
  } finally {
    setContractDraftBusy(false);
  }
});

loadOverview().then(async () => {
  const pageState = new URLSearchParams(window.location.search);
  const embeddedContractId = pageState.get("embeddedContract");
  if (embeddedContractId) {
    try {
      await requestJson(
        `/api/seller/contracts/${encodeURIComponent(embeddedContractId)}/embedded-complete`,
        { method: "POST" },
      );
      await loadOverview();
      showToast("모두싸인 서명 요청을 구매자 예약과 연결했습니다.");
      window.history.replaceState({}, "", "/seller");
    } catch (error) {
      showToast(getSellerErrorMessage(error));
    }
  } else if (pageState.get("created") === "1") {
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
}, 5000);
