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
  regions: new Set(),
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
const productTranslationStatus = document.querySelector("#product-translation-status");
const productTranslationStatusMessage = document.querySelector(
  "#product-translation-status-message",
);
const categoryButtons = [...document.querySelectorAll("[data-category]")];
const regionFilterButtons = [...document.querySelectorAll("[data-region-filter]")];
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
const sellerPageLink = document.querySelector("#seller-page-link");
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
const mypageTitle = document.querySelector("#mypage-title");
const mypageMainAccount = document.querySelector("#mypage-main-account");
const mypageMainTabs = document.querySelector("#mypage-main-tabs");
const mypageMainReservations = document.querySelector("#mypage-main-reservations");
const mypageUserId = document.querySelector("#mypage-user-id");
const mypageEmail = document.querySelector("#mypage-email");
const mypageReservationCount = document.querySelector("#mypage-reservation-count");
const mypageReservationList = document.querySelector("#mypage-reservation-list");
const mypageSectionKicker = document.querySelector("#mypage-section-kicker");
const mypageReservationsTitle = document.querySelector("#mypage-reservations-title");
const mypageTabButtons = [...document.querySelectorAll("[data-mypage-view]")];
const mypageSettingsButton = document.querySelector("#mypage-settings-button");
const mypageSettingsPanel = document.querySelector("#mypage-settings-panel");
const mypageSettingsClose = document.querySelector("#mypage-settings-close");
const mypageSettingsMenu = document.querySelector("#mypage-settings-menu");
const mypageOpenPassword = document.querySelector("#mypage-open-password");
const mypageOpenDelete = document.querySelector("#mypage-open-delete");
const mypagePasswordVerifyForm = document.querySelector("#mypage-password-verify-form");
const mypagePasswordVerifySubmit = document.querySelector("#mypage-password-verify-submit");
const mypagePasswordForm = document.querySelector("#mypage-password-form");
const mypagePasswordCurrent = document.querySelector("#mypage-password-current");
const mypagePasswordNew = document.querySelector("#mypage-password-new");
const mypagePasswordConfirm = document.querySelector("#mypage-password-confirm");
const mypagePasswordSubmit = document.querySelector("#mypage-password-submit");
const mypageDeleteVerifyForm = document.querySelector("#mypage-delete-verify-form");
const mypageDeleteVerifySubmit = document.querySelector("#mypage-delete-verify-submit");
const mypageDeletePassword = document.querySelector("#mypage-delete-password");
const mypageDeleteSubmit = document.querySelector("#mypage-delete-submit");
const mypageDeleteConfirm = document.querySelector("#mypage-delete-confirm");
const mypageSettingsBackButtons = [...document.querySelectorAll("[data-settings-back]")];
const mypageSettingsStatus = document.querySelector("#mypage-settings-status");
const reservationDetailDialog = document.querySelector("#reservation-detail-dialog");
const reservationDetailContent = document.querySelector("#reservation-detail-content");
const reservationCancelDialog = document.querySelector("#reservation-cancel-dialog");
const reservationCancelTitle = document.querySelector("#reservation-cancel-title");
const reservationCancelDescription = document.querySelector(
  "#reservation-cancel-description",
);
const reservationCancelDismiss = document.querySelector(
  "#reservation-cancel-dismiss",
);
const reservationCancelConfirm = document.querySelector(
  "#reservation-cancel-confirm",
);
const bookingName = document.querySelector("#booking-name");
const bookingEmail = document.querySelector("#booking-email");
const notificationButton = document.querySelector("#notification-button");
const notificationTrigger = document.querySelector("#notification-trigger");
const notificationBadge = document.querySelector("#notification-badge");
const contractNotification = document.querySelector("#contract-notification");
const contractNotificationList = document.querySelector("#contract-notification-list");
const notificationPanelCount = document.querySelector("#notification-panel-count");
const contractDialog = document.querySelector("#contract-dialog");
const contractBookingSummary = document.querySelector("#contract-booking-summary");
const contractAgreement = document.querySelector("#contract-agreement");
const startSignatureButton = document.querySelector("#start-signature-button");
const contractAiLoading = document.querySelector("#contract-ai-loading");
const contractAiSummary = document.querySelector("#contract-ai-summary");
const contractAiRisk = document.querySelector("#contract-ai-risk");
const contractAiMode = document.querySelector("#contract-ai-mode");
const contractAiHeadline = document.querySelector("#contract-ai-headline");
const contractAiRefund = document.querySelector("#contract-ai-refund");
const contractAiWatchout = document.querySelector("#contract-ai-watchout");
const contractAiReloadButton = document.querySelector("#contract-ai-reload");
const signatureDialog = document.querySelector("#signature-dialog");
const signatureFrameWrap = document.querySelector("#signature-frame-wrap");
const signatureStatus = document.querySelector("#signature-status");
const detailFontDecreaseButton = document.querySelector("#detail-font-decrease-button");
const detailFontIncreaseButton = document.querySelector("#detail-font-increase-button");
const detailSpeechToggleButton = document.querySelector("#detail-speech-toggle-button");
const languageButtons = [...document.querySelectorAll("[data-locale]")];

if (sellerPageLink && window.location.protocol === "file:") {
  sellerPageLink.href = "http://127.0.0.1:3000/seller";
}

let toastTimer;
let currentUser = null;
let authMode = "login";
let pendingExperienceId = null;
let pendingBooking = null;
let myReservations = [];
let mypageView = "reservations";
let mypageSettingsOpen = false;
let verifiedMypagePassword = "";
let reservationsLoading = false;
let expandedReservationId = null;
let reservationToCancel = null;
let activeReservationId = null;
let viewedReservationId = null;
let signatureStatusTimer = null;
let isResumingSignature = false;
let notificationCloseTimer = null;
let signatureFrameLoaded = false;
const detailFontScaleOptions = ["normal", "large", "x-large"];

function updateHeaderScrollState() {
  document.body.classList.toggle("is-scrolled", window.scrollY > 36);
}

window.addEventListener("scroll", updateHeaderScrollState, { passive: true });
updateHeaderScrollState();
let detailFontScaleIndex = getSavedDetailFontScaleIndex();
let isReadingDetailTerms = false;
const supportedLocales = new Set(["ko", "en", "ja", "zh"]);
let activeLocale = getSavedLocale();
const localeFormats = {
  ko: "ko-KR",
  en: "en-US",
  ja: "ja-JP",
  zh: "zh-CN",
};
const mypageCopy = {
  ko: {
    reservationsTab: "내 예약",
    favoritesTab: "찜 목록",
    reservationsKicker: "RESERVATIONS",
    favoritesKicker: "SAVED EXPERIENCES",
    reservationsTitle: "내 예약",
    favoritesTitle: "찜 목록",
    reservationCount: (count) => `${count}건`,
    favoriteCount: (count) => `${count}개`,
    noFavoritesTitle: "찜한 상품이 없습니다.",
    noFavoritesDescription: "마음에 드는 상품의 하트를 눌러 찜 목록에 저장해 보세요.",
  },
  en: {
    reservationsTab: "My reservations",
    favoritesTab: "Saved experiences",
    reservationsKicker: "RESERVATIONS",
    favoritesKicker: "SAVED EXPERIENCES",
    reservationsTitle: "My reservations",
    favoritesTitle: "Saved experiences",
    reservationCount: (count) => `${count} reservations`,
    favoriteCount: (count) => `${count} saved`,
    noFavoritesTitle: "No saved experiences yet.",
    noFavoritesDescription: "Use the heart on an experience to save it here.",
  },
  ja: {
    reservationsTab: "予約一覧",
    favoritesTab: "お気に入り",
    reservationsKicker: "予約一覧",
    favoritesKicker: "保存済みの体験",
    reservationsTitle: "予約一覧",
    favoritesTitle: "お気に入りリスト",
    reservationCount: (count) => `${count}件`,
    favoriteCount: (count) => `${count}件`,
    noFavoritesTitle: "お気に入りの商品がありません。",
    noFavoritesDescription: "気に入った商品のハートを押して、お気に入りリストに保存してみてください。",
  },
  zh: {
    reservationsTab: "我的预约",
    favoritesTab: "收藏列表",
    reservationsKicker: "我的预约",
    favoritesKicker: "已收藏的体验",
    reservationsTitle: "我的预约",
    favoritesTitle: "收藏列表",
    reservationCount: (count) => `${count}条预约`,
    favoriteCount: (count) => `${count}个收藏`,
    noFavoritesTitle: "还没有收藏的体验。",
    noFavoritesDescription: "点击体验商品上的爱心，将它保存到收藏列表中。",
  },
};
const footerPartnerCopy = {
  ko: {
    label: "파트너 입점",
    notice: "파트너 입점 문의가 접수되었습니다.",
  },
  en: {
    label: "Partner with us",
    notice: "Your partner inquiry has been received.",
  },
  ja: {
    label: "パートナーとして参加",
    notice: "パートナー登録に関するお問い合わせを受け付けました。",
  },
  zh: {
    label: "商家入驻",
    notice: "已收到您的商家入驻咨询。",
  },
};
const sellerPortalCopy = {
  ko: "판매점 입점",
  en: "Seller portal",
  ja: "出店者登録",
  zh: "商家入驻",
};
const productTranslationCache = new Map(
  [...supportedLocales]
    .filter((locale) => locale !== "ko")
    .map((locale) => [locale, new Map()]),
);
const productTranslationRequests = new Map();
const productCardTranslationRequests = new Map();
const interfaceTranslationCache = new Map(
  [...supportedLocales]
    .filter((locale) => locale !== "ko")
    .map((locale) => [locale, new Map()]),
);
const pendingInterfaceTranslations = new Set();
let interfaceTranslationTimer = null;
let interfaceTranslationRequest = null;

const englishCategoryNames = {
  요트: "Yacht",
  크루즈: "Cruise",
  서핑: "Surfing",
  바디보드: "Bodyboarding",
  다이빙: "Diving",
  스노클링: "Snorkeling",
  프리다이빙: "Freediving",
  SUP: "SUP",
  카약: "Kayaking",
  낚시: "Fishing",
  제트스키: "Jet Ski",
  바나나보트: "Banana Boat",
  웨이크보드: "Wakeboarding",
};

const englishRegionNames = {
  해운대: "Haeundae",
  광안리: "Gwangalli",
  송정: "Songjeong",
  기장: "Gijang",
  다대포: "Dadaepo",
  영도: "Yeongdo",
  남구: "Nam-gu",
};

const japaneseRegionNames = {
  해운대: "ヘウンデ",
  광안리: "広安里",
  송정: "松亭",
  기장: "機張",
  다대포: "多大浦",
  영도: "影島",
  남구: "南区",
  수영구: "水営区",
  송도: "松島",
};

const chineseRegionNames = {
  해운대: "海云台",
  광안리: "广安里",
  송정: "松亭",
  기장: "机张",
  다대포: "多大浦",
  영도: "影岛",
  남구: "南区",
  수영구: "水营区",
  송도: "松岛",
};

const englishRiskLevels = {
  매우높음: "Very high",
  높음: "High",
  보통: "Medium",
  낮음: "Low",
  매우낮음: "Very low",
};

const japaneseRiskLevels = {
  매우높음: "非常に高い",
  높음: "高い",
  보통: "普通",
  낮음: "低い",
  매우낮음: "非常に低い",
};

const chineseRiskLevels = {
  매우높음: "很高",
  높음: "高",
  보통: "中等",
  낮음: "低",
  매우낮음: "很低",
};

const builtInInterfaceTranslations = {
  ja: {
    "Language selection": "言語を選択",
    "Skip to content": "本文へ移動",
    "Experiences": "体験を探す",
    "Regions": "エリアを見る",
    "How it works": "利用方法",
    "Partner with us": "パートナーになる",
    "Open menu": "メニューを開く",
    "Notifications": "お知らせ",
    "BUSAN MARINE LEISURE GUIDE": "釜山マリンレジャーガイド",
    "Today, Busan's sea<br>becomes <em>your playground</em>": "今日、釜山の海が<br><em>あなたの遊び場</em>になります",
    "Compare marine leisure experiences in one place<br class=\"desktop-break\">and reserve the one that fits you.": "釜山のマリンレジャーをひとつの場所で比べて<br class=\"desktop-break\">あなたに合う海の体験を予約しましょう。",
    "Get AI recommendations": "AIおすすめを見る",
    "<b>64+</b> Busan experiences": "<b>64+</b>件の釜山体験",
    "<b>4.9</b> average rating": "<b>4.9</b> 平均評価",
    "<b>100%</b> verified partners": "<b>100%</b> 確認済みパートナー",
    "All": "すべて",
    "Yachts & boats": "ヨット・ボート",
    "Surfing": "サーフィン",
    "Diving": "ダイビング",
    "SUP & kayaking": "SUP・カヤック",
    "Sea fishing": "海釣り",
    "Busan's most-loved experiences": "釜山で人気の体験",
    "Most popular": "人気順",
    "Highest rated": "評価順",
    "Lowest price": "価格が低い順",
    "Make enjoying the sea<br>feel effortless.": "海を楽しむ時間を<br>もっと気軽に。",
    "Verified local partners": "確認済みの地域パートナー",
    "Clear information at a glance": "一目で分かる情報",
    "Curated for Busan": "釜山に合わせた体験",
    "Explore Busan by the waves": "波と一緒に釜山を巡る",
    "Three choices<br>to reach the sea.": "3つの選択で<br>海へ出かけよう。",
    "Find your experience": "自分に合う体験を探す",
    "Review options and reserve": "内容を確認して予約",
    "Enjoy the Busan sea": "釜山の海を楽しむ",
    "AI highlights easy-to-miss terms": "AIが見落としやすい規約を整理します",
    "We highlight refund limits and terms that may be unfavorable to you.": "返金制限や利用者に不利な可能性がある条件をお知らせします。",
    "Summarize this page with AI": "AIでこのページを要約",
    "Pre-booking terms": "予約前の詳細条件",
    "These are the full terms covering refunds, reservations, additional clauses, and safety. Read each item carefully.": "返金、予約、追加条項、安全条件を含む全文です。各項目をよくお読みください。",
    "Read": "読み上げ",
    "Log in": "ログイン",
    "My page": "マイページ",
    "Close my page": "マイページを閉じる",
    "My account": "アカウント",
    "Signed-in account": "ログインアカウント",
    "Log out": "ログアウト",
    "My reservations": "予約一覧",
    "Loading reservations…": "予約履歴を読み込んでいます…",
    "Notifications": "お知らせ",
    "Contract review required": "契約内容の確認が必要",
    "E-signature in progress": "電子署名を進行中",
    "Reservation confirmed": "予約確定",
    "Cancellation request received": "キャンセル申請を受付",
    "Reservation cancelled": "予約キャンセル",
    "Signature stopped": "署名を中断しました",
    "Document processing failed": "書類の処理に失敗しました",
    "Checking status": "状態を確認中",
    "View reservation details": "予約内容を確認",
    "Go to product page": "詳細ページへ",
    "Open reservation menu": "予約メニューを開く",
    "Close reservation menu": "予約メニューを閉じる",
    "Cancel reservation": "予約をキャンセル",
    "Request cancellation": "キャンセルを申請",
    "reservation": "予約",
    "← My reservations": "← 予約一覧",
    "Reservation details": "予約内容の確認",
    "Close reservation details": "予約内容の確認画面を閉じる",
    "E-signature completed": "電子署名完了",
    "E-signature review required": "電子署名の確認が必要",
    "Before e-signature": "電子署名前",
    "View e-signature": "電子署名を確認",
    "Continue e-signature": "電子署名を続ける",
    "Review contract and e-sign": "契約書を確認して電子署名",
    "No saved e-signature": "保存された電子署名はありません",
    "Reservation number": "予約番号",
    "Reservation date": "利用日",
    "Guests": "利用人数",
    "Booker": "予約者",
    "Booked on": "申込日",
    "There is no completed e-signature yet. It will appear here once available.": "まだ完了した電子署名はありません。電子署名を完了すると、ここに保存されます。",
    "RESERVATION CONTRACT": "予約契約書",
    "Review reservation contract": "予約契約書を確認",
    "Close contract review": "契約書確認画面を閉じる",
    "Key terms": "主な利用規約",
    "For safety reasons such as worsening weather, the schedule may change. Cancellation fees may apply from three days before use, and the user is responsible for accidents or equipment damage caused by not following safety rules.": "天候悪化など安全上の理由により、日程が変更される場合があります。利用日の3日前からキャンセル料が発生する場合があり、安全規則を守らないことによる事故や機材の破損は利用者の責任となります。",
    "I have reviewed the key terms, read the full contract, and agree to proceed with e-signature.": "主な規約を確認し、契約書全文を読んだうえで電子署名に同意します。",
    "Proceed to e-signature": "電子署名へ進む",
  },
  zh: {
    "Language selection": "选择语言",
    "Skip to content": "跳转到正文",
    "Experiences": "查找体验",
    "Regions": "查看地区",
    "How it works": "使用方法",
    "Partner with us": "成为合作伙伴",
    "Open menu": "打开菜单",
    "Notifications": "通知",
    "BUSAN MARINE LEISURE GUIDE": "釜山海洋休闲指南",
    "Today, Busan's sea<br>becomes <em>your playground</em>": "今天，釜山的大海<br>成为<em>你的游乐场</em>",
    "Compare marine leisure experiences in one place<br class=\"desktop-break\">and reserve the one that fits you.": "在一个地方比较釜山海洋休闲体验，<br class=\"desktop-break\">预订最适合你的海上体验。",
    "Get AI recommendations": "获取 AI 推荐",
    "<b>64+</b> Busan experiences": "<b>64+</b> 项釜山体验",
    "<b>4.9</b> average rating": "<b>4.9</b> 平均评分",
    "<b>100%</b> verified partners": "<b>100%</b> 已验证合作伙伴",
    "All": "全部",
    "Yachts & boats": "游艇和船只",
    "Surfing": "冲浪",
    "Diving": "潜水",
    "SUP & kayaking": "桨板和皮划艇",
    "Sea fishing": "海钓",
    "Busan's most-loved experiences": "釜山最受欢迎的体验",
    "Most popular": "最受欢迎",
    "Highest rated": "评分最高",
    "Lowest price": "价格最低",
    "Make enjoying the sea<br>feel effortless.": "轻松享受<br>大海时光。",
    "Verified local partners": "已验证的本地合作伙伴",
    "Clear information at a glance": "一目了然的信息",
    "Curated for Busan": "为釜山精心挑选",
    "Explore Busan by the waves": "随海浪探索釜山",
    "Three choices<br>to reach the sea.": "三步选择<br>走向大海。",
    "Find your experience": "找到你的体验",
    "Review options and reserve": "查看选项并预订",
    "Enjoy the Busan sea": "享受釜山的大海",
    "AI highlights easy-to-miss terms": "AI 提醒容易忽略的条款",
    "We highlight refund limits and terms that may be unfavorable to you.": "我们会提示退款限制和可能对你不利的条款。",
    "Summarize this page with AI": "用 AI 总结此页面",
    "Pre-booking terms": "预订前详细条款",
    "These are the full terms covering refunds, reservations, additional clauses, and safety. Read each item carefully.": "这是包含退款、预订、附加条款和安全条件的完整条款。请仔细阅读每一项。",
    "Read": "朗读",
    "Log in": "登录",
    "My page": "我的页面",
    "Close my page": "关闭我的页面",
    "My account": "我的账户",
    "Signed-in account": "登录账户",
    "Log out": "退出登录",
    "My reservations": "我的预订",
    "Loading reservations…": "正在查看预订记录…",
    "Notifications": "通知",
    "Contract review required": "需要确认合同",
    "E-signature in progress": "正在进行电子签名",
    "Reservation confirmed": "预订已确认",
    "Cancellation request received": "已收到取消申请",
    "Reservation cancelled": "预订已取消",
    "Signature stopped": "签名已中止",
    "Document processing failed": "文件处理失败",
    "Checking status": "正在确认状态",
    "View reservation details": "查看预订详情",
    "Go to product page": "前往详情页",
    "Open reservation menu": "打开预订菜单",
    "Close reservation menu": "关闭预订菜单",
    "Cancel reservation": "取消预订",
    "Request cancellation": "申请取消",
    "reservation": "预订",
    "← My reservations": "← 我的预订",
    "Reservation details": "预订详情",
    "Close reservation details": "关闭预订详情",
    "E-signature completed": "电子签名已完成",
    "E-signature review required": "需要确认电子签名",
    "Before e-signature": "电子签名前",
    "View e-signature": "查看电子签名",
    "Continue e-signature": "继续电子签名",
    "Review contract and e-sign": "确认合同并电子签名",
    "No saved e-signature": "没有已保存的电子签名",
    "Reservation number": "预订编号",
    "Reservation date": "预订日期",
    "Guests": "人数",
    "Booker": "预订人",
    "Booked on": "申请日期",
    "There is no completed e-signature yet. It will appear here once available.": "尚未完成电子签名。完成后将显示在此处。",
    "RESERVATION CONTRACT": "预订合同",
    "Review reservation contract": "确认预订合同",
    "Close contract review": "关闭合同确认窗口",
    "Key terms": "主要条款说明",
    "For safety reasons such as worsening weather, the schedule may change. Cancellation fees may apply from three days before use, and the user is responsible for accidents or equipment damage caused by not following safety rules.": "因天气恶化等安全原因，行程可能会变更。使用日前3天起可能收取取消费用；未遵守安全规定造成的事故和设备损坏由使用者负责。",
    "I have reviewed the key terms, read the full contract, and agree to proceed with e-signature.": "我已确认主要条款，阅读完整合同，并同意进行电子签名。",
    "Proceed to e-signature": "进行电子签名",
  },
};

function isTranslatedLocale(locale = activeLocale) {
  return locale !== "ko";
}

function getProductTranslationCache(locale = activeLocale) {
  return productTranslationCache.get(locale) ?? new Map();
}

function formatPrice(price) {
  const formattedPrice = price.toLocaleString(localeFormats[activeLocale]);
  if (activeLocale === "ko") return `${formattedPrice}원`;
  return activeLocale === "zh" ? `KRW ${formattedPrice}` : `KRW ${formattedPrice}`;
}

function getSavedLocale() {
  try {
    const savedLocale = window.localStorage.getItem("waveon-locale");
    return supportedLocales.has(savedLocale) ? savedLocale : "ko";
  } catch {
    return "ko";
  }
}

function localizeText(korean, english) {
  if (activeLocale === "ko") return korean;
  if (activeLocale === "en") return english;

  const builtInTranslation = builtInInterfaceTranslations[activeLocale]?.[english];
  if (builtInTranslation) return builtInTranslation;

  const cache = interfaceTranslationCache.get(activeLocale);
  const translation = cache?.get(korean);
  if (translation) return translation;
  queueInterfaceTranslation(korean);
  return english;
}

function localizeCategory(category) {
  return localizeText(category, englishCategoryNames[category] ?? category);
}

function localizeRegion(region) {
  if (activeLocale === "ja") return japaneseRegionNames[region] ?? region;
  if (activeLocale === "zh") return chineseRegionNames[region] ?? region;
  return localizeText(region, englishRegionNames[region] ?? region);
}

function formatDuration(minutes) {
  return localizeText(`${minutes}분`, `${minutes} min`);
}

function formatPeople(count) {
  return localizeText(`${count}명`, `${count} guest${count === 1 ? "" : "s"}`);
}

function localizeRiskLevel(riskLevel) {
  if (activeLocale === "ko") return riskLevel;
  if (activeLocale === "en") return englishRiskLevels[riskLevel] ?? riskLevel;
  if (activeLocale === "ja") return japaneseRiskLevels[riskLevel] ?? riskLevel;
  return chineseRiskLevels[riskLevel] ?? riskLevel;
}

function getContractSummaryCacheKey(experienceId) {
  return `${activeLocale}:${experienceId}`;
}

function getDisplayExperience(experience) {
  const translation = isTranslatedLocale()
    ? getProductTranslationCache().get(experience.id)
    : null;
  return translation ? { ...experience, ...translation.product } : experience;
}

function getMyPageCopy() {
  return mypageCopy[activeLocale] ?? mypageCopy.ko;
}

function getFooterPartnerCopy() {
  return footerPartnerCopy[activeLocale] ?? footerPartnerCopy.ko;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setLocaleContent(selector, korean, english, property = "textContent") {
  document.querySelectorAll(selector).forEach((element) => {
    element[property] = localizeText(korean, english);
  });
}

function queueInterfaceTranslation(korean) {
  if (!isTranslatedLocale() || !korean || interfaceTranslationCache.get(activeLocale)?.has(korean)) {
    return;
  }

  pendingInterfaceTranslations.add(korean);
  if (interfaceTranslationTimer || interfaceTranslationRequest) return;
  interfaceTranslationTimer = window.setTimeout(() => {
    interfaceTranslationTimer = null;
    requestInterfaceTranslations();
  }, 80);
}

async function requestInterfaceTranslations() {
  if (!isTranslatedLocale() || interfaceTranslationRequest || pendingInterfaceTranslations.size === 0) {
    return;
  }

  const locale = activeLocale;
  const texts = [...pendingInterfaceTranslations].slice(0, 24);
  texts.forEach((text) => pendingInterfaceTranslations.delete(text));
  interfaceTranslationRequest = fetch("/api/interface-translations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ locale, texts }),
  })
    .then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Interface translation is unavailable.");

      const cache = interfaceTranslationCache.get(locale);
      result.translations.forEach(({ source, translation }) => {
        if (source && translation) cache.set(source, translation);
      });
      if (activeLocale === locale) applyLocale();
    })
    .catch((error) => {
      console.error("화면 문구 번역 오류:", error.message);
    })
    .finally(() => {
      interfaceTranslationRequest = null;
      if (pendingInterfaceTranslations.size > 0) requestInterfaceTranslations();
    });

  await interfaceTranslationRequest;
}

function applyStaticLocale() {
  document.documentElement.lang = activeLocale === "zh" ? "zh-CN" : activeLocale;
  document.title = localizeText("WAVEON BUSAN | 부산 해양레저", "WAVEON BUSAN | Marine Leisure");
  document.querySelector(".mypage-language-switcher").setAttribute(
    "aria-label",
    localizeText("언어 선택", "Language selection"),
  );
  languageButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.locale === activeLocale));
  });

  setLocaleContent(".skip-link", "본문 바로가기", "Skip to content");
  notificationButton.setAttribute("aria-label", localizeText("알림", "Notifications"));
  setLocaleContent("#mypage-dialog h2", "마이페이지", "My page");
  document.querySelector("#mypage-close").setAttribute(
    "aria-label",
    localizeText("마이페이지 닫기", "Close my page"),
  );
  document.querySelector(".mypage-account").setAttribute(
    "aria-label",
    localizeText("내 계정", "My account"),
  );
  setLocaleContent(".mypage-account span", "로그인 계정", "Signed-in account");
  setLocaleContent("#logout-button", "로그아웃", "Log out");
  const myPageText = getMyPageCopy();
  document.querySelector("[data-mypage-view='reservations']").textContent = myPageText.reservationsTab;
  document.querySelector("[data-mypage-view='favorites']").textContent = myPageText.favoritesTab;
  mypageReservationsTitle.textContent = myPageText.reservationsTitle;
  setLocaleContent(".notification-panel-head strong", "알림", "Notifications");
  setLocaleContent("#reservation-detail-back", "← 내 예약", "← My reservations");
  setLocaleContent("#reservation-detail-dialog h2", "예약내역 확인", "Reservation details");
  document.querySelector("#reservation-detail-close").setAttribute(
    "aria-label",
    localizeText("예약내역 확인 창 닫기", "Close reservation details"),
  );
  setLocaleContent("#contract-dialog .contract-dialog-head p", "RESERVATION CONTRACT", "RESERVATION CONTRACT");
  setLocaleContent("#contract-dialog h2", "예약 계약서 확인", "Review reservation contract");
  document.querySelector("#contract-close").setAttribute(
    "aria-label",
    localizeText("계약서 확인 창 닫기", "Close contract review"),
  );
  setLocaleContent(".contract-terms h3", "주요 약관 안내", "Key terms");
  setLocaleContent(
    ".contract-terms p",
    "기상 악화 등 안전상 사유로 일정이 변경될 수 있습니다. 이용 3일 전부터는 취소 수수료가 발생할 수 있으며, 안전수칙 미준수로 인한 사고 및 장비 파손은 이용자 책임입니다.",
    "For safety reasons such as worsening weather, the schedule may change. Cancellation fees may apply from three days before use, and the user is responsible for accidents or equipment damage caused by not following safety rules.",
  );
  setLocaleContent(
    ".contract-agreement span",
    "주요 약관을 확인했으며, 전체 계약서를 읽고 전자서명하는 것에 동의합니다.",
    "I have reviewed the key terms, read the full contract, and agree to proceed with e-signature.",
  );
  startSignatureButton.innerHTML = `${localizeText("전자서명 진행", "Proceed to e-signature")} <span>→</span>`;
  document.querySelector(".hero-kicker").innerHTML =
    `<span></span>${localizeText("부산 해양레저 가이드", "BUSAN MARINE LEISURE GUIDE")}`;

  setLocaleContent(
    ".hero h1",
    "오늘, 부산의 바다가<br><em>당신의 놀이터</em>가 됩니다",
    "Today, Busan's sea<br>becomes <em>your playground</em>",
    "innerHTML",
  );
  setLocaleContent(
    ".hero-copy",
    "흩어진 해양레저 정보를 한곳에서 비교하고<br class=\"desktop-break\">내 취향에 꼭 맞는 바다 경험을 예약하세요.",
    "Compare marine leisure experiences in one place<br class=\"desktop-break\">and reserve the one that fits you.",
    "innerHTML",
  );
  setLocaleContent("#open-recommendation span:nth-child(2)", "AI 추천받기", "Get AI recommendations");
  setLocaleContent(".hero-meta span:nth-child(1)", "<b>64+</b> 부산 레저", "<b>64+</b> Busan experiences", "innerHTML");
  setLocaleContent(".hero-meta span:nth-child(2)", "<b>4.9</b> 평균 평점", "<b>4.9</b> average rating", "innerHTML");
  setLocaleContent(".hero-meta span:nth-child(3)", "<b>100%</b> 검증된 파트너", "<b>100%</b> verified partners", "innerHTML");

  const categoryLabels = [
    ["전체", "All"],
    ["요트·보트", "Yachts & boats"],
    ["서핑", "Surfing"],
    ["다이빙", "Diving"],
    ["SUP·카약", "SUP & kayaking"],
    ["바다낚시", "Sea fishing"],
  ];
  categoryButtons.forEach((button, index) => {
    const label = button.querySelector("strong");
    if (label) label.textContent = localizeText(...categoryLabels[index]);
  });

  setLocaleContent("#experience-title", "부산에서 가장 사랑받는 경험", "Busan's most-loved experiences");
  setLocaleContent("#sort-select option[value='popular']", "인기순", "Most popular");
  setLocaleContent("#sort-select option[value='rating']", "평점순", "Highest rated");
  setLocaleContent("#sort-select option[value='low-price']", "낮은 가격순", "Lowest price");
  document.querySelector(".region-filter")?.setAttribute(
    "aria-label",
    localizeText("지역 다중 선택", "Select one or more regions"),
  );
  regionFilterButtons.forEach((button) => {
    const region = button.dataset.regionFilter;
    button.textContent = region ? localizeRegion(region) : localizeText("전체", "All");
  });
  paginationPrev.setAttribute("aria-label", localizeText("이전 상품 보기", "View previous products"));
  paginationNext.setAttribute("aria-label", localizeText("다음 상품 보기", "View next products"));
  setLocaleContent("#empty-state", "조건에 맞는 경험을 찾지 못했어요. 다른 지역이나 검색어를 선택해 주세요.", "No matching experiences were found. Try another region or search term.");

  setLocaleContent(".statement-content h2", "바다를 즐기는 일에<br>망설임이 없도록.", "Make enjoying the sea<br>feel effortless.", "innerHTML");
  setLocaleContent(".statement-content > p:not(.section-kicker)", "처음 타는 서핑 보드도, 특별한 날의 요트도<br>비교부터 예약까지 쉽고 투명하게 준비합니다.", "From your first surfboard to a special yacht trip,<br>compare and book with clarity.", "innerHTML");
  setLocaleContent(".statement-points > div:nth-child(1) strong", "검증된 로컬 파트너", "Verified local partners");
  setLocaleContent(".statement-points > div:nth-child(1) p", "안전 기준과 이용 후기를 꼼꼼하게 확인해요.", "We carefully check safety standards and reviews.");
  setLocaleContent(".statement-points > div:nth-child(2) strong", "한눈에 보는 정보", "Clear information at a glance");
  setLocaleContent(".statement-points > div:nth-child(2) p", "가격, 일정, 준비물을 쉽게 비교할 수 있어요.", "Compare prices, schedules, and what to bring.");
  setLocaleContent(".statement-points > div:nth-child(3) strong", "부산다운 큐레이션", "Curated for Busan");
  setLocaleContent(".statement-points > div:nth-child(3) p", "계절과 지역에 어울리는 경험을 먼저 소개해요.", "Discover experiences suited to each season and area.");

  setLocaleContent("#guide-title", "세 번의 선택으로<br>바다 위에 도착하세요.", "Three choices<br>to reach the sea.", "innerHTML");
  setLocaleContent(".guide-steps li:nth-child(1) strong", "내게 맞는 경험 찾기", "Find your experience");
  setLocaleContent(".guide-steps li:nth-child(1) p", "지역, 날짜, 하고 싶은 활동으로 검색해요.", "Search by location, date, and activity.");
  setLocaleContent(".guide-steps li:nth-child(2) strong", "옵션 확인하고 예약하기", "Review options and reserve");
  setLocaleContent(".guide-steps li:nth-child(2) p", "가격과 준비물, 이용 후기를 꼼꼼히 비교해요.", "Compare price, preparation, and reviews.");
  setLocaleContent(".guide-steps li:nth-child(3) strong", "부산 바다 즐기기", "Enjoy the Busan sea");
  setLocaleContent(".guide-steps li:nth-child(3) p", "예약 시간에 맞춰 도착하면 준비는 끝이에요.", "Arrive on time and you are ready to go.");

  setLocaleContent(".footer-brand + p", "부산의 바다를 더 가깝고, 더 쉽게.", "Closer, simpler access to Busan's sea.");
  setLocaleContent(".footer-links > div:nth-child(1) strong", "서비스", "Service");
  setLocaleContent(".footer-links > div:nth-child(1) a[href='#experiences']", "레저 찾기", "Experiences");
  setLocaleContent(".footer-links > div:nth-child(1) a[href='#experiences']:nth-of-type(2)", "지역별 보기", "Regions");
  setLocaleContent(".footer-links > div:nth-child(1) a[href='#how-it-works']", "이용 방법", "How it works");
  setLocaleContent(".footer-links > div:nth-child(2) strong", "고객지원", "Support");
  const footerPartner = document.querySelector(".footer-partner");
  const footerPartnerText = getFooterPartnerCopy();
  footerPartner.textContent = footerPartnerText.label;
  footerPartner.dataset.notice = footerPartnerText.notice;
  if (sellerPageLink) {
    sellerPageLink.textContent = sellerPortalCopy[activeLocale] ?? sellerPortalCopy.ko;
  }
  setLocaleContent(".footer-links > div:nth-child(2) button:nth-child(3)", "자주 묻는 질문", "FAQ");
  setLocaleContent(".footer-links > div:nth-child(2) button:nth-child(4)", "1:1 문의", "Contact us");
  setLocaleContent(".footer-links > div:nth-child(2) button:nth-child(5)", "안전 가이드", "Safety guide");
  setLocaleContent(".footer-bottom span:last-child", "해커톤 시연을 위한 데모 서비스입니다.", "A demo service for a hackathon presentation.");

  setLocaleContent("#detail-ai-title", "AI가 놓치기 쉬운 약관을 정리해요", "AI highlights easy-to-miss terms");
  setLocaleContent(".detail-ai-heading div > p:last-child", "긴 예약 약관에서 환불 제한과 소비자에게 불리할 수 있는 조건만 골라 보여드립니다.", "We highlight refund limits and terms that may be unfavorable to you.");
  setLocaleContent(".detail-ai-refund strong", "환불 주의사항", "Refund watch-outs");
  setLocaleContent(".detail-ai-watchout strong", "나에게 불리할 수 있어요", "Possible disadvantages");
  setLocaleContent(".detail-ai-summary > small", "AI 요약은 이해를 돕기 위한 참고 자료입니다. 아래 원문 약관과 최종 전자계약서를 함께 확인하세요.", "The AI summary is for reference. Review the full terms and final e-contract as well.");
  setLocaleContent("#detail-terms-title", "예약 전 세부 조건", "Pre-booking terms");
  setLocaleContent("#detail-itinerary-title", "체험은 이렇게 진행돼요", "Here's how the experience works");
  setLocaleContent(".detail-terms-intro", "취소·환불, 지각, 일정 변경, 참여 기준과 안전 수칙 등 예약 전 확인할 핵심 조건입니다.", "Review the key booking conditions, including cancellation, late arrival, schedule changes, participation requirements, and safety rules.");
  document.querySelector(".detail-terms-accessibility").setAttribute("aria-label", localizeText("예약 조건 접근성 도구", "Booking terms accessibility tools"));
  detailFontDecreaseButton.setAttribute("aria-label", localizeText("예약 조건 글자 작게", "Decrease booking terms text"));
  detailFontIncreaseButton.setAttribute("aria-label", localizeText("예약 조건 글자 크게", "Increase booking terms text"));
  detailSpeechToggleButton.title = localizeText("예약 조건 읽기", "Read booking terms");
  if (!isReadingDetailTerms) detailSpeechToggleButton.textContent = localizeText("읽기", "Read");
  setLocaleContent(".detail-price-row span", "1인 기준", "Per person");
  setLocaleContent(".detail-facts div:nth-child(1) dt", "장소", "Location");
  setLocaleContent(".detail-facts div:nth-child(2) dt", "소요 시간", "Duration");
  setLocaleContent(".detail-facts div:nth-child(3) dt", "최소 연령", "Minimum age");
  setLocaleContent(".detail-facts div:nth-child(4) dt", "최대 인원", "Max guests");
  setLocaleContent(".detail-facts div:nth-child(5) dt", "운영 시간", "Time slots");
  setLocaleContent(".detail-included > strong", "포함 사항", "Included");
  setLocaleContent("#detail-book-button", "조건을 확인하고 예약하기 →", "Review terms and reserve →");
  setLocaleContent(".product-detail-booking > small", "예약 요청 후 약관 검토와 전자서명이 진행됩니다.", "After booking, you will review the terms and complete e-signature.");

  setLocaleContent(".dialog-price span", "1인 기준", "Per person");
  setLocaleContent(".booking-form label:nth-of-type(1) > span", "예약자 이름", "Guest name");
  setLocaleContent(".booking-form label:nth-of-type(2) > span", "전자서명 수신 이메일", "E-signature email");
  setLocaleContent(".booking-form label:nth-of-type(3) > span", "이용 날짜", "Date");
  setLocaleContent(".booking-form label:nth-of-type(4) > span", "운영 시간", "Time slot");
  setLocaleContent(".booking-people-field > span", "인원", "Guests");
  setLocaleContent("#booking-people option[value='1']", "1명", "1 guest");
  setLocaleContent("#booking-people option[value='2']", "2명", "2 guests");
  setLocaleContent("#booking-people option[value='3']", "3명", "3 guests");
  setLocaleContent("#booking-people option[value='4']", "4명", "4 guests");
  setLocaleContent("#booking-people option[value='5']", "5명 이상", "5+ guests");
  setLocaleContent("#booking-form .dialog-submit", "예약 요청하기 →", "Request reservation →");
  setLocaleContent(".booking-form > small", "웹사이트에서 전자서명을 완료하면 로그인 이메일로 완료 문서를 보내드립니다.", "After completing e-signature here, the completed document will be sent to your login email.");

  setLocaleContent("#recommendation-dialog h2", "나에게 맞는 바다 찾기", "Find your ideal sea experience");
  setLocaleContent(".recommendation-dialog-head > div > p:last-child", "간단한 조건을 알려주면 상품을 비교하고 Solar가 추천 이유를 설명해요.", "Tell us a few preferences and Solar will compare products and explain its recommendations.");
  setLocaleContent("#recommendation-form label:nth-of-type(1) > span", "1인 최대 예산", "Maximum budget per person");
  setLocaleContent("#recommendation-form label:nth-of-type(2) > span", "이용자 나이", "Guest age");
  setLocaleContent("#recommendation-form label:nth-of-type(3) > span", "희망 지역", "Preferred area");
  setLocaleContent("#recommendation-form label:nth-of-type(4) > span", "관심 활동", "Activity preference");
  setLocaleContent("#recommendation-form label:nth-of-type(5) > span", "경험 수준", "Experience level");
  setLocaleContent("#recommendation-form label:nth-of-type(6) > span", "수영 가능 여부", "Swimming ability");
  setLocaleContent("#recommendation-form label:nth-of-type(7) > span", "누구와 가나요?", "Who are you going with?");
  setLocaleContent("#recommendation-form label:nth-of-type(8) > span", "원하는 분위기", "Desired mood");
  setLocaleContent("#recommend-budget option[value='30000']", "3만원 이하", "Up to KRW 30,000");
  setLocaleContent("#recommend-budget option[value='50000']", "5만원 이하", "Up to KRW 50,000");
  setLocaleContent("#recommend-budget option[value='80000']", "8만원 이하", "Up to KRW 80,000");
  setLocaleContent("#recommend-budget option[value='120000']", "12만원 이하", "Up to KRW 120,000");
  setLocaleContent("#recommend-region option[value='']", "부산 전체", "All Busan");
  document.querySelectorAll("#recommend-region option[value]").forEach((option) => {
    if (option.value) option.textContent = localizeRegion(option.value);
  });
  setLocaleContent("#recommend-category option[value='']", "상관없음", "No preference");
  document.querySelectorAll("#recommend-category option[value]").forEach((option) => {
    if (option.value) option.textContent = localizeCategory(option.value);
  });
  setLocaleContent("#recommend-level option[value='beginner']", "처음이에요", "Beginner");
  setLocaleContent("#recommend-level option[value='intermediate']", "몇 번 해봤어요", "Some experience");
  setLocaleContent("#recommend-level option[value='advanced']", "숙련자예요", "Experienced");
  setLocaleContent("#recommend-swimming option[value='false']", "수영을 못해요", "Cannot swim");
  setLocaleContent("#recommend-swimming option[value='true']", "수영할 수 있어요", "Can swim");
  setLocaleContent("#recommend-companion option[value='혼자']", "혼자", "Solo");
  setLocaleContent("#recommend-companion option[value='연인']", "연인", "Partner");
  setLocaleContent("#recommend-companion option[value='친구']", "친구", "Friends");
  setLocaleContent("#recommend-companion option[value='가족']", "가족", "Family");
  setLocaleContent("#recommend-companion option[value='단체']", "단체", "Group");
  setLocaleContent("#recommend-mood option[value='휴식']", "조용한 휴식", "Quiet relaxation");
  setLocaleContent("#recommend-mood option[value='사진']", "사진과 추억", "Photos and memories");
  setLocaleContent("#recommend-mood option[value='도전']", "새로운 도전", "A new challenge");
  setLocaleContent("#recommend-mood option[value='스릴']", "짜릿한 스릴", "High-energy thrills");
  setLocaleContent("#recommend-mood option[value='자연']", "자연과 풍경", "Nature and scenery");
  setLocaleContent("#recommend-mood option[value='야경']", "야경과 도시", "Night views and city lights");
  setLocaleContent("#recommendation-submit span:first-child", "AI 추천 받기", "Get AI recommendations");
  setLocaleContent(".recommendation-privacy", "입력한 조건은 추천을 위해서만 사용하며 이름이나 연락처는 받지 않습니다.", "Your preferences are used only for recommendations. We do not collect your name or contact details.");
}

function applyLocale() {
  applyStaticLocale();
  setProductTranslationStatus("idle");
  updateAuthInterface();
  updateCategoryCounts();

  if (experiences.length > 0) renderExperiences();
  if (currentUser) {
    renderMyPageContent();
    renderContractNotifications();
  }
  if (reservationDetailDialog.open && viewedReservationId) {
    const reservation = myReservations.find(
      (item) => item.id === viewedReservationId,
    );
    if (reservation) openReservationDetail(reservation);
  }
  if (contractDialog.open && pendingBooking) {
    renderContractBookingSummary(pendingBooking);
  }
  if (productDetailDialog.open && state.selectedExperience) {
    if (
      isTranslatedLocale() &&
      !getProductTranslationCache().get(state.selectedExperience.id)?.detail
    ) {
      openProductDetail(state.selectedExperience.id);
    } else {
      renderProductDetail(state.selectedExperience.id);
    }
  }
}

function categoryMatches(productCategory, selectedCategory) {
  if (!selectedCategory) return true;
  const groupedCategories = categoryGroups[selectedCategory] ?? [selectedCategory];
  return groupedCategories.includes(productCategory);
}

function getProductImage(product) {
  if (product.thumbnailImage) return product.thumbnailImage;
  const productCover = productMedia[product.id]?.cover;
  if (productCover) return productCover;

  const images = categoryImages[product.category] ?? categoryImages.요트;
  const numericId = Number(product.id.replace(/\D/g, "")) || 0;
  return images[numericId % images.length];
}

function getProductImageAlt(product) {
  return (
    productMedia[product.id]?.coverAlt ??
    localizeText(`${product.name} 체험 모습`, `${product.name} experience`)
  );
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
    const matchesRegion =
      state.regions.size === 0 || state.regions.has(experience.region);
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
      aria-label="${localizeText(`${index + 1}페이지 보기`, `View page ${index + 1}`)}"
      aria-current="${index === state.page ? "page" : "false"}"
    ></button>
  `).join("");
}

function renderExperiences() {
  const visibleExperiences = getVisibleExperiences();
  const reviewRankedExperiences = [...experiences].sort(
    (first, second) =>
      second.reviewCount - first.reviewCount || first.id.localeCompare(second.id),
  );
  const bestExperienceIds = new Set(
    reviewRankedExperiences.slice(0, 3).map((experience) => experience.id),
  );
  const hotExperienceIds = new Set(
    reviewRankedExperiences.slice(-3).map((experience) => experience.id),
  );
  const totalPages = Math.max(1, Math.ceil(visibleExperiences.length / EXPERIENCES_PER_PAGE));
  state.page = Math.min(state.page, totalPages - 1);
  const pageStart = state.page * EXPERIENCES_PER_PAGE;
  const pageExperiences = visibleExperiences.slice(pageStart, pageStart + EXPERIENCES_PER_PAGE);

  experienceGrid.innerHTML = pageExperiences
    .map((experience) => {
      const displayExperience = getDisplayExperience(experience);
      const cardBadge = bestExperienceIds.has(experience.id)
        ? "BEST"
        : hotExperienceIds.has(experience.id)
          ? "HOT"
          : "AVAILABLE";
      const recommendation = state.recommendationMap.get(experience.id);
      const recommendationNote = recommendation
        ? `
          <div class="recommendation-note">
            <strong>${localizeText(`✦ AI 추천 이유 · 적합도 ${recommendation.score}점`, `✦ AI recommendation · ${recommendation.score} score`)}</strong>
            ${escapeHtml(recommendation.reason)}
            <span class="recommendation-tags">
              ${recommendation.fitPoints
                .map((point) => `<span>${escapeHtml(point)}</span>`)
                .join("")}
            </span>
            <span class="recommendation-caution">${localizeText("주의:", "Caution:")} ${escapeHtml(recommendation.caution)}</span>
          </div>
        `
        : "";

      return `
        <article class="experience-card">
          <button
            class="card-image"
            type="button"
            data-booking="${experience.id}"
            aria-label="${escapeHtml(localizeText(`${displayExperience.name} 상세 보기`, `Open details for ${displayExperience.name}`))}"
          >
            <img
              src="${getProductImage(experience)}"
              alt="${escapeHtml(getProductImageAlt(experience))}"
              loading="lazy"
            />
            <span class="card-badge">${cardBadge}</span>
          </button>
          <button
            class="favorite-button ${state.favorites.has(experience.id) ? "is-active" : ""}"
            type="button"
            data-favorite="${experience.id}"
            aria-label="${escapeHtml(localizeText(`${displayExperience.name} 찜하기`, `Save ${displayExperience.name}`))}"
            aria-pressed="${state.favorites.has(experience.id)}"
          >${state.favorites.has(experience.id) ? "♥" : "♡"}</button>
          <button class="card-button" type="button" data-booking="${experience.id}">
            <span class="card-meta">
              <span>${escapeHtml(localizeRegion(experience.region))} · ${escapeHtml(localizeCategory(experience.category))}</span>
              <span class="card-rating">★ ${experience.rating} (${experience.reviewCount})</span>
            </span>
            <h3>${escapeHtml(displayExperience.name)}</h3>
            <span class="card-footer">
              <span>${escapeHtml(displayExperience.partnerName)} · ${formatDuration(experience.durationMinutes)}</span>
              <strong>${formatPrice(experience.pricePerPerson)}</strong>
            </span>
          </button>
          ${recommendationNote}
        </article>
      `;
    })
    .join("");

  resultCount.textContent = localizeText(
    `${visibleExperiences.length}개의 경험`,
    `${visibleExperiences.length} experiences`,
  );
  emptyState.hidden = visibleExperiences.length !== 0;
  renderPagination(totalPages);
  if (isTranslatedLocale() && pageExperiences.length > 0) {
    requestProductCardTranslations(pageExperiences);
  }

  if (state.recommendedIds) {
    resultDescription.textContent = state.recommendationMessage;
    return;
  }

  const descriptions = [];
  if (state.category) {
    descriptions.push(localizeText(`${state.category} 카테고리`, `${localizeCategory(state.category)} category`));
  }
  if (state.regions.size > 0) {
    const regions = [...state.regions].map((region) => localizeRegion(region));
    descriptions.push(localizeText(`${regions.join(", ")} 지역`, `${regions.join(", ")} area`));
  }
  if (state.keyword) {
    descriptions.push(localizeText(`“${state.keyword}” 검색`, `Search: “${state.keyword}”`));
  }

  resultDescription.textContent = descriptions.length
    ? localizeText(`${descriptions.join(" · ")} 결과입니다.`, `${descriptions.join(" · ")} results.`)
    : localizeText(
      "이번 주 여행자들이 가장 많이 선택한 해양레저예요.",
      "Marine experiences most chosen by travelers this week.",
    );
}

function updateCategoryCounts() {
  categoryButtons.forEach((button) => {
    const category = button.dataset.category;
    const count = experiences.filter((experience) =>
      categoryMatches(experience.category, category),
    ).length;
    const countLabel = button.querySelector("small");

    if (countLabel) {
      countLabel.textContent = localizeText(`${count}개 경험`, `${count} experiences`);
    }
  });
}

function setProductTranslationStatus(state) {
  if (!productTranslationStatus || !productTranslationStatusMessage) return;

  if (activeLocale === "ko" || state === "idle") {
    productTranslationStatus.hidden = true;
    productTranslationStatus.classList.remove("is-error");
    return;
  }

  productTranslationStatus.hidden = false;
  productTranslationStatus.classList.toggle("is-error", state === "error");
  productTranslationStatusMessage.textContent = state === "error"
    ? localizeText(
      "상품 카드 번역을 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      "Card translation is unavailable. Please try again shortly.",
    )
    : "Translating the experiences on this page.";
}

function updateRegionFilterButtons() {
  const isAllRegions = state.regions.size === 0;

  regionFilterButtons.forEach((button) => {
    const region = button.dataset.regionFilter;
    const isActive = region ? state.regions.has(region) : isAllRegions;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function toggleRegionFilter(region) {
  clearRecommendations();

  if (!region) {
    state.regions.clear();
  } else if (state.regions.has(region)) {
    state.regions.delete(region);
  } else {
    state.regions.add(region);
  }

  regionSelect.value = state.regions.values().next().value ?? "";
  updateRegionFilterButtons();
  renderExperiences();
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

function getSavedDetailFontScaleIndex() {
  try {
    const savedScale = window.localStorage.getItem("waveon-detail-terms-font-scale");
    const savedIndex = detailFontScaleOptions.indexOf(savedScale);
    return savedIndex === -1 ? 0 : savedIndex;
  } catch {
    return 0;
  }
}

function updateDetailFontScale() {
  const fontScale = detailFontScaleOptions[detailFontScaleIndex];
  productDetailDialog.dataset.termsFontScale = fontScale;
  detailFontDecreaseButton.disabled = detailFontScaleIndex === 0;
  detailFontIncreaseButton.disabled =
    detailFontScaleIndex === detailFontScaleOptions.length - 1;

  try {
    window.localStorage.setItem("waveon-detail-terms-font-scale", fontScale);
  } catch {
    // 브라우저 저장소를 사용할 수 없어도 현재 창의 글자 크기는 적용합니다.
  }
}

function getDetailTermsSpeechText() {
  if (!productDetailDialog.open) return "";

  const detailTermsTitle = document.querySelector("#detail-terms-title");
  const detailTermsIntro = document.querySelector(".detail-terms-intro");
  const detailContractTerms = document.querySelector("#detail-contract-terms");

  return [
    detailTermsTitle?.textContent,
    detailTermsIntro?.textContent,
    detailContractTerms?.textContent,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function stopDetailTermsReading() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  isReadingDetailTerms = false;
  detailSpeechToggleButton.textContent = localizeText("읽기", "Read");
  detailSpeechToggleButton.setAttribute("aria-pressed", "false");
}

function toggleDetailTermsReading() {
  if (!("speechSynthesis" in window)) {
    showToast(localizeText("이 브라우저에서는 읽어주기 기능을 사용할 수 없습니다.", "This browser does not support read aloud."));
    return;
  }

  if (isReadingDetailTerms || window.speechSynthesis.speaking) {
    stopDetailTermsReading();
    return;
  }

  if (
    isTranslatedLocale() &&
    state.selectedExperience &&
    !getProductTranslationCache().get(state.selectedExperience.id)?.detail
  ) {
    showToast(
      localizeText(
        "번역된 약관을 준비하고 있습니다. 잠시 후 다시 시도해 주세요.",
        "Translated terms are still being prepared. Please try again in a moment.",
      ),
    );
    return;
  }

  const speechText = getDetailTermsSpeechText();
  if (!speechText) {
    showToast(localizeText("상품 상세에서 예약 조건을 연 뒤 이용해주세요.", "Open the product details and booking terms first."));
    return;
  }

  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.lang = localeFormats[activeLocale];
  utterance.rate = 0.95;
  utterance.onend = stopDetailTermsReading;
  utterance.onerror = stopDetailTermsReading;

  isReadingDetailTerms = true;
  detailSpeechToggleButton.textContent = localizeText("멈춤", "Stop");
  detailSpeechToggleButton.setAttribute("aria-pressed", "true");
  window.speechSynthesis.speak(utterance);
}

function updateAuthInterface() {
  if (currentUser) {
    loginButton.textContent = localizeText("마이페이지", "My page");
    loginButton.classList.add("is-authenticated");
    loginButton.setAttribute(
      "aria-label",
      localizeText(
        `${currentUser.userId} 계정 마이페이지 열기`,
        `Open ${currentUser.userId}'s account page`,
      ),
    );
    notificationButton.hidden = false;
  } else {
    loginButton.textContent = localizeText("로그인", "Log in");
    loginButton.classList.remove("is-authenticated");
    loginButton.setAttribute(
      "aria-label",
      localizeText("로그인 또는 회원가입", "Log in or create an account"),
    );
    notificationButton.hidden = true;
    notificationBadge.hidden = true;
    contractNotification.hidden = true;
    notificationButton.setAttribute("aria-expanded", "false");
  }
}

function setAuthMode(mode) {
  authMode = mode === "register" ? "register" : "login";
  const isRegister = authMode === "register";
  authTitle.textContent = isRegister
    ? localizeText("회원가입", "Create account")
    : localizeText("로그인", "Log in");
  authDescription.textContent = isRegister
    ? localizeText(
      "계정을 만들면 로그인 이메일로 전자서명 완료 문서를 보내드립니다.",
      "After you create an account, completed e-signature documents will be sent to your login email.",
    )
    : localizeText("아이디와 비밀번호로 로그인해 주세요.", "Log in with your ID and password.");
  authSubmit.innerHTML = `${isRegister ? localizeText("회원가입", "Create account") : localizeText("로그인", "Log in")} <span>→</span>`;
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
    if (currentUser) loadMyReservations();
  }
}

async function logout() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } finally {
    setMypageSettingsOpen(false);
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
    SELLER_REVIEW: {
      label: localizeText("판매자 확인 중", "Seller review pending"),
      className: "pending",
    },
    CONTRACT_PENDING: { label: localizeText("계약 확인 필요", "Contract review required"), className: "pending" },
    SIGNING: { label: localizeText("전자서명 진행 중", "E-signature in progress"), className: "signing" },
    COMPLETED: { label: localizeText("예약 확정", "Reservation confirmed"), className: "completed" },
    CANCELLATION_REQUESTED: {
      label: localizeText("취소 요청 접수", "Cancellation request received"),
      className: "cancellation-requested",
    },
    CANCELLED: { label: localizeText("예약 취소", "Reservation cancelled"), className: "cancelled" },
    SELLER_CANCELLED: {
      label: localizeText("판매자 예약 취소", "Cancelled by seller"),
      className: "cancelled",
    },
    ABORTED: { label: localizeText("서명 중단", "Signature stopped"), className: "failed" },
    PROCESSING_FAILED: { label: localizeText("문서 처리 실패", "Document processing failed"), className: "failed" },
  }[status] ?? { label: localizeText("상태 확인 중", "Checking status"), className: "signing" };
}

function reservationSignatureDetails(reservation) {
  if (reservation.status === "SELLER_CANCELLED") {
    return {
      label: localizeText("판매자 예약 취소", "Cancelled by seller"),
      className: "cancelled",
      description: reservation.documentAvailable
        ? localizeText(
            "판매자가 예약을 취소했습니다. 완료된 전자서명 문서는 계속 확인할 수 있습니다.",
            "The seller cancelled this reservation. Your completed e-signature document remains available.",
          )
        : localizeText(
            "판매자 사정으로 예약이 취소되었고 진행 중인 전자서명은 중단되었습니다.",
            "The seller cancelled this reservation and the pending e-signature was stopped.",
          ),
    };
  }

  if (reservation.status === "CANCELLATION_REQUESTED") {
    return {
      label: localizeText("취소 요청 접수", "Cancellation request received"),
      className: "cancellation-requested",
      description: localizeText("판매자 확인 후 취소 및 환불 처리 결과를 안내합니다.", "The seller will confirm the cancellation and refund result."),
    };
  }

  if (reservation.status === "CANCELLED") {
    return {
      label: localizeText("예약 취소됨", "Reservation cancelled"),
      className: "cancelled",
      description: localizeText("전자서명 요청 전에 예약을 취소했습니다.", "This reservation was cancelled before the e-signature request."),
    };
  }

  if (reservation.documentAvailable) {
    return {
      label: localizeText("전자서명 완료", "E-signature completed"),
      className: "completed",
      description: localizeText("완료된 전자서명 문서가 이 예약에 안전하게 연결되어 있습니다.", "The completed e-signature document is securely linked to this reservation."),
    };
  }

  if (reservation.status === "SELLER_REVIEW") {
    return {
      label: localizeText(
        "판매자 계약서 준비 중",
        "Seller contract preparation",
      ),
      className: "pending",
      description: localizeText(
        "판매자가 예약을 확인하면 사이트 알림과 로그인 이메일로 전자서명 계약서를 보내드립니다.",
        "After seller review, the e-signature contract will arrive in site notifications and your account email.",
      ),
    };
  }

  if (reservation.status === "SIGNING") {
    return {
      label: localizeText("전자서명 진행 중", "E-signature in progress"),
      className: "signing",
      description: localizeText("서명을 완료하면 이곳에서 완료 문서를 확인할 수 있습니다.", "You can review the completed document here after signing."),
    };
  }

  if (["ABORTED", "PROCESSING_FAILED"].includes(reservation.status)) {
    return {
      label: localizeText("전자서명 확인 필요", "E-signature review required"),
      className: "failed",
      description: localizeText("전자서명 문서가 저장되지 않았습니다. 고객센터에 문의해 주세요.", "The e-signature document was not saved. Please contact support."),
    };
  }

  return {
    label: localizeText("전자서명 전", "Before e-signature"),
    className: "pending",
    description: localizeText("아직 완료된 전자서명이 없습니다. 전자서명 기능이 준비되면 이곳에 저장됩니다.", "There is no completed e-signature yet. It will appear here once available."),
  };
}

function canBuyerCancelReservation(reservation) {
  return [
    "SELLER_REVIEW",
    "CONTRACT_PENDING",
    "SIGNING",
    "COMPLETED",
    "ABORTED",
    "PROCESSING_FAILED",
  ].includes(reservation.status);
}

function requiresSellerCancellationReview(reservation) {
  return (
    ["SIGNING", "COMPLETED"].includes(reservation.status) ||
    (reservation.status === "CONTRACT_PENDING" &&
      Boolean(reservation.signatureStatus))
  );
}

function formatKoreanDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(localeFormats[activeLocale], {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatReservationCount(count) {
  if (activeLocale === "ko") return `${count}건`;
  if (activeLocale === "ja") return `${count}件`;
  if (activeLocale === "zh") return `${count}项`;
  return `${count} reservation${count === 1 ? "" : "s"}`;
}

function getReservationDisplay(reservation) {
  const experience = experiences.find(
    (item) => item.name === reservation.activity,
  );
  const displayExperience = experience ? getDisplayExperience(experience) : null;
  return {
    activity: displayExperience?.name ?? reservation.activity,
    venue: displayExperience?.partnerName ?? reservation.venue,
  };
}

function updateMyPageView() {
  const isFavoritesView = mypageView === "favorites";
  const text = getMyPageCopy();

  mypageTabButtons.forEach((button) => {
    const isActive = button.dataset.mypageView === mypageView;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  mypageSectionKicker.textContent = isFavoritesView
    ? text.favoritesKicker
    : text.reservationsKicker;
  mypageReservationsTitle.textContent = isFavoritesView
    ? text.favoritesTitle
    : text.reservationsTitle;
}

function renderMyFavorites() {
  updateMyPageView();
  const text = getMyPageCopy();
  const favorites = experiences.filter((experience) => state.favorites.has(experience.id));
  mypageReservationCount.textContent = text.favoriteCount(favorites.length);

  if (favorites.length === 0) {
    mypageReservationList.innerHTML = `
      <div class="mypage-empty">
        <strong>${text.noFavoritesTitle}</strong>
        <p>${text.noFavoritesDescription}</p>
      </div>
    `;
    return;
  }

  mypageReservationList.classList.add("mypage-favorite-list");
  mypageReservationList.innerHTML = favorites
    .map((experience) => {
      const displayExperience = getDisplayExperience(experience);
      return `
        <article class="mypage-favorite-card">
          <img src="${getProductImage(experience)}" alt="${escapeHtml(getProductImageAlt(displayExperience))}" />
          <button class="mypage-favorite-open" type="button" data-open-favorite="${escapeHtml(experience.id)}">
            <span>${escapeHtml(localizeRegion(experience.region))} · ${escapeHtml(localizeCategory(experience.category))}</span>
            <strong>${escapeHtml(displayExperience.name)}</strong>
            <span>${escapeHtml(displayExperience.partnerName)} · ${formatPrice(experience.pricePerPerson)}</span>
          </button>
          <button class="mypage-favorite-remove" type="button" data-remove-favorite="${escapeHtml(experience.id)}" aria-label="${escapeHtml(localizeText(`${displayExperience.name} 찜 해제`, `Remove ${displayExperience.name} from saved experiences`))}">♥</button>
        </article>
      `;
    })
    .join("");

  if (isTranslatedLocale()) requestProductCardTranslations(favorites);
}

function renderMyPageContent() {
  mypageReservationList.classList.remove("mypage-favorite-list");
  if (mypageView === "favorites") {
    renderMyFavorites();
    return;
  }
  renderMyReservations();
}

function renderMyReservations() {
  if (mypageView === "favorites") {
    renderMyFavorites();
    return;
  }

  updateMyPageView();
  const visibleReservations = myReservations;
  mypageReservationCount.textContent = formatReservationCount(
    visibleReservations.length,
  );
  if (visibleReservations.length === 0) {
    mypageReservationList.innerHTML = `
      <div class="mypage-empty">
        <strong>${localizeText("아직 예약 내역이 없습니다.", "No reservations yet.")}</strong>
        <p>${localizeText("마음에 드는 부산 바다 경험을 선택해 첫 예약을 만들어 보세요.", "Choose a Busan sea experience to make your first reservation.")}</p>
      </div>
    `;
    return;
  }

  mypageReservationList.innerHTML = visibleReservations
    .map((reservation) => {
      const status = reservationStatusDetails(reservation.status);
      const displayReservation = getReservationDisplay(reservation);
      const createdDate = formatKoreanDate(reservation.createdAt);
      const isExpanded = expandedReservationId === reservation.id;
      const canCancel = canBuyerCancelReservation(reservation);
      const canAcknowledgeCancellation =
        ["CANCELLED", "SELLER_CANCELLED"].includes(reservation.status) &&
        reservation.cancellationNoticePending;
      const cancelLabel =
        requiresSellerCancellationReview(reservation)
          ? localizeText("예약 취소 요청", "Request cancellation")
          : localizeText("예약 취소", "Cancel reservation");

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
              <time>${createdDate} ${localizeText("예약", "reservation")}</time>
            </span>
            <span class="reservation-card-copy">
              <strong>${escapeHtml(displayReservation.activity)}</strong>
              <span>${escapeHtml(displayReservation.venue)}</span>
            </span>
            <span class="reservation-card-open">
              ${isExpanded
                ? localizeText("예약 메뉴 닫기", "Close reservation menu")
                : localizeText("예약 메뉴 열기", "Open reservation menu")}
              <b aria-hidden="true">${isExpanded ? "⌃" : "⌄"}</b>
            </span>
          </button>
          <div class="reservation-card-panel${canCancel || canAcknowledgeCancellation ? " has-cancel" : ""}" ${isExpanded ? "" : "hidden"}>
            <button type="button" data-view-reservation="${reservation.id}">
              ${localizeText("예약내역 확인하기", "View reservation details")} <span>→</span>
            </button>
            <button type="button" class="is-secondary" data-reservation-product="${reservation.id}">
              ${localizeText("상세페이지로 가기", "Go to product page")} <span>↗</span>
            </button>
            ${
              canCancel
                ? `
                  <button type="button" class="is-cancel" data-cancel-reservation="${escapeHtml(reservation.id)}">
                    ${cancelLabel} <span>×</span>
                  </button>
                `
                : ""
            }
            ${
              canAcknowledgeCancellation
                ? `
                  <button type="button" class="is-confirm" data-acknowledge-cancellation="${escapeHtml(reservation.id)}">
                    ${localizeText("확인 후 목록에서 제거", "Confirm and remove")} <span>→</span>
                  </button>
                `
                : ""
            }
          </div>
        </article>
      `;
    })
    .join("");

  if (isTranslatedLocale()) {
    const reservationProducts = visibleReservations
      .map((reservation) => experiences.find((item) => item.name === reservation.activity))
      .filter(Boolean);
    requestProductCardTranslations(reservationProducts);
  }
}

function getPendingContractReservations() {
  return myReservations.filter(
    (reservation) =>
      (reservation.contractNotificationPending &&
        ["CONTRACT_PENDING", "SIGNING", "PROCESSING_FAILED"].includes(
          reservation.status,
        )) ||
      (reservation.status === "SELLER_CANCELLED" &&
        reservation.sellerCancellationNoticePending),
  );
}

function renderContractNotifications() {
  const reservations = getPendingContractReservations();
  const count = reservations.length;

  notificationBadge.hidden = count === 0;
  notificationBadge.textContent = String(count);
  notificationPanelCount.hidden = count === 0;
  notificationPanelCount.textContent = formatReservationCount(count);

  if (count === 0) {
    contractNotification.hidden = true;
    notificationButton.setAttribute("aria-expanded", "false");
    contractNotificationList.innerHTML = "";
    return;
  }

  contractNotificationList.innerHTML = reservations
    .map(
      (reservation) => {
        const displayReservation = getReservationDisplay(reservation);
        const isSigning = reservation.status === "SIGNING";
        const isSellerCancellation = reservation.status === "SELLER_CANCELLED";
        const notificationTitle = isSellerCancellation
          ? localizeText(
              "판매자가 예약을 취소했어요",
              "The seller cancelled your reservation",
            )
          : reservation.status === "PROCESSING_FAILED"
            ? localizeText(
                "전자서명 다시 확인 필요",
                "E-signature needs attention",
              )
            : isSigning
              ? localizeText("전자서명 이어하기", "Continue e-signature")
              : localizeText("계약서 확인 필요", "Contract review required");
        const notificationAction = isSellerCancellation
          ? localizeText("취소된 예약 확인", "Review cancelled reservation")
          : isSigning
            ? localizeText("전자서명 이어하기", "Continue e-signature")
            : localizeText(
                "계약서 확인 및 전자서명 진행",
                "Review contract and continue e-signature",
              );
        const notificationTarget = isSellerCancellation
          ? `data-open-seller-cancellation="${escapeHtml(reservation.id)}"`
          : `data-open-contract="${escapeHtml(reservation.id)}"`;
        return `
        <button
          class="notification-item${isSellerCancellation ? " is-seller-cancellation" : ""}"
          type="button"
          ${notificationTarget}
          aria-label="${escapeHtml(displayReservation.activity)} ${escapeHtml(notificationAction)}"
        >
          <span class="notification-item-icon" aria-hidden="true">${isSellerCancellation ? "!" : "✦"}</span>
          <span class="notification-item-copy">
            <strong>${notificationTitle}</strong>
            <span>${escapeHtml(displayReservation.activity)} · ${escapeHtml(reservation.date)}</span>
          </span>
          <span class="notification-item-arrow" aria-hidden="true">→</span>
        </button>
      `;
      },
    )
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
  viewedReservationId = reservation.id;
  const status = reservationStatusDetails(reservation.status);
  const signature = reservationSignatureDetails(reservation);
  const displayReservation = getReservationDisplay(reservation);
  const documentAction = reservation.documentAvailable
    ? `
      <a
        class="reservation-document-button"
        href="/api/reservations/${encodeURIComponent(reservation.id)}/document"
        target="_blank"
        rel="noopener"
      >
        ${localizeText("전자서명 확인하기", "View e-signature")} <span>↗</span>
      </a>
    `
    : ["CONTRACT_PENDING", "SIGNING", "PROCESSING_FAILED"].includes(
          reservation.status,
        )
      ? `
        <button
          class="reservation-document-button"
          type="button"
          data-start-reservation-signature="${escapeHtml(reservation.id)}"
        >
          ${
            reservation.status === "SIGNING"
              ? localizeText("전자서명 이어하기", "Continue e-signature")
              : localizeText("계약서 확인 및 전자서명", "Review contract and e-sign")
          } <span>→</span>
        </button>
      `
    : `
      <button class="reservation-document-button" type="button" disabled>
        ${localizeText("저장된 전자서명 없음", "No saved e-signature")}
      </button>
    `;
  const cancelAction =
    canBuyerCancelReservation(reservation)
      ? `
        <button
          class="reservation-cancel-button"
          type="button"
          data-cancel-reservation="${escapeHtml(reservation.id)}"
        >
          ${
            requiresSellerCancellationReview(reservation)
              ? localizeText("예약 취소 요청", "Request cancellation")
              : localizeText("예약 취소", "Cancel reservation")
          } <span>×</span>
        </button>
      `
      : ["CANCELLED", "SELLER_CANCELLED"].includes(reservation.status) &&
          reservation.cancellationNoticePending
        ? `
          <button
            class="reservation-confirm-cancellation-button"
            type="button"
            data-acknowledge-cancellation="${escapeHtml(reservation.id)}"
          >
            ${localizeText("확인 후 목록에서 제거", "Confirm and remove")} <span>→</span>
          </button>
        `
        : "";

  reservationDetailContent.innerHTML = `
    <section class="reservation-detail-summary">
      <span class="reservation-status is-${status.className}">${status.label}</span>
      <p>${localizeText("예약번호", "Reservation number")} ${escapeHtml(reservation.id.slice(0, 10).toUpperCase())}</p>
      <h3>${escapeHtml(displayReservation.activity)}</h3>
      <span>${escapeHtml(displayReservation.venue)}</span>
    </section>
    <dl class="reservation-detail-grid">
      <div><dt>${localizeText("예약 날짜", "Reservation date")}</dt><dd>${escapeHtml(reservation.date)}${reservation.time ? ` · ${escapeHtml(reservation.time)}` : ""}</dd></div>
      <div><dt>${localizeText("예약 인원", "Guests")}</dt><dd>${formatPeople(Number(reservation.people))}</dd></div>
      <div><dt>${localizeText("예약자", "Booker")}</dt><dd>${escapeHtml(reservation.name)}</dd></div>
      <div><dt>${localizeText("예약 신청일", "Booked on")}</dt><dd>${formatKoreanDate(reservation.createdAt)}</dd></div>
    </dl>
    <section class="reservation-signature-card is-${signature.className}">
      <div>
        <p>E-SIGNATURE</p>
        <h3>${signature.label}</h3>
        <span>${signature.description}</span>
      </div>
      <div class="reservation-document-actions">
        ${documentAction}
        ${cancelAction}
      </div>
    </section>
  `;

  mypageDialog.close();
  if (!reservationDetailDialog.open) reservationDetailDialog.showModal();
  document.body.classList.add("dialog-open");
}

async function loadMyReservations({ silent = false } = {}) {
  if (reservationsLoading) return;
  reservationsLoading = true;

  if (!silent && mypageView === "reservations") {
    mypageReservationList.innerHTML =
      `<p class="mypage-loading">${localizeText("예약과 전자서명 상태를 확인하고 있어요.", "Checking reservation and e-signature status…")}</p>`;
  }

  try {
    const previousContractIds = new Set(
      getPendingContractReservations()
        .filter((reservation) => reservation.status !== "SELLER_CANCELLED")
        .map((reservation) => reservation.id),
    );
    const previousSellerCancellationIds = new Set(
      myReservations
        .filter(
          (reservation) =>
            reservation.status === "SELLER_CANCELLED" &&
            reservation.sellerCancellationNoticePending,
        )
        .map((reservation) => reservation.id),
    );
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
    renderMyPageContent();
    renderContractNotifications();

    if (silent) {
      const pendingNotifications = getPendingContractReservations();
      const newContractCount = pendingNotifications.filter(
        (reservation) =>
          reservation.status !== "SELLER_CANCELLED" &&
          !previousContractIds.has(reservation.id),
      ).length;
      const newSellerCancellationCount = pendingNotifications.filter(
        (reservation) =>
          reservation.status === "SELLER_CANCELLED" &&
          !previousSellerCancellationIds.has(reservation.id),
      ).length;
      if (newSellerCancellationCount > 0) {
        showToast(
          localizeText(
            `판매자가 예약 ${newSellerCancellationCount}건을 취소했습니다. 알림에서 확인해 주세요.`,
            `The seller cancelled ${newSellerCancellationCount} reservation${newSellerCancellationCount === 1 ? "" : "s"}. Check your notifications.`,
          ),
        );
      } else if (newContractCount > 0) {
        showToast(
          localizeText(
            `판매자가 보낸 새 계약서 ${newContractCount}건이 도착했습니다.`,
            `${newContractCount} new contract${newContractCount === 1 ? "" : "s"} arrived from the seller.`,
          ),
        );
      }
    }
  } catch (error) {
    if (!silent && mypageView === "reservations") {
      mypageReservationList.innerHTML = `
        <div class="mypage-empty">
          <strong>${localizeText("예약 내역을 불러오지 못했습니다.", "Unable to load reservations.")}</strong>
          <p>${escapeHtml(error.message)}</p>
        </div>
      `;
    }
  } finally {
    reservationsLoading = false;
  }
}

function openReservationCancelDialog(reservation) {
  if (!canBuyerCancelReservation(reservation)) {
    showToast("현재 상태의 예약은 취소할 수 없습니다.");
    return;
  }

  const isCancellationRequest =
    requiresSellerCancellationReview(reservation);
  reservationToCancel = reservation;
  reservationCancelTitle.textContent = isCancellationRequest
    ? "예약 취소를 요청할까요?"
    : "예약을 취소할까요?";
  reservationCancelDescription.textContent = isCancellationRequest
    ? `${reservation.activity} 예약 취소 요청을 판매자에게 전달합니다. 환불 여부와 금액은 판매자 확인 후 안내됩니다.`
    : `${reservation.activity} 예약을 취소하면 예약 상태가 취소로 변경됩니다.`;
  reservationCancelConfirm.disabled = false;
  reservationCancelConfirm.textContent = isCancellationRequest
    ? "취소 요청하기"
    : "예약 취소";
  reservationCancelDialog.showModal();
}

async function cancelReservation() {
  const reservation = reservationToCancel;
  if (!reservation) return;

  reservationCancelConfirm.disabled = true;
  reservationCancelConfirm.textContent = "취소 처리 중...";

  try {
    const response = await fetch(
      `/api/reservations/${encodeURIComponent(reservation.id)}/cancel`,
      { method: "POST" },
    );
    const result = await response.json();
    if (response.status === 401) {
      currentUser = null;
      updateAuthInterface();
      openAuthDialog("login");
    }
    if (!response.ok) {
      throw new Error(result.message || "예약을 취소하지 못했습니다.");
    }

    const cancellationRequested =
      result.reservation.status === "CANCELLATION_REQUESTED";
    myReservations = myReservations.map((item) =>
      item.id === reservation.id ? result.reservation : item,
    );
    if (pendingBooking?.id === reservation.id) pendingBooking = null;
    if (expandedReservationId === reservation.id) expandedReservationId = null;

    const refreshReservationDetail = reservationDetailDialog.open;
    renderMyPageContent();
    renderContractNotifications();
    reservationCancelDialog.close();
    if (refreshReservationDetail) {
      reservationDetailDialog.close();
      openMyPage();
    }
    showToast(
      cancellationRequested
        ? "취소 요청이 접수되었습니다."
        : "예약이 취소되었습니다. 확인을 누르면 목록에서 사라집니다.",
    );
  } catch (error) {
    showToast(error.message || "예약을 취소하지 못했습니다.");
  } finally {
    reservationCancelConfirm.disabled = false;
    reservationCancelConfirm.textContent = "예약 취소";
  }
}

async function acknowledgeCancelledReservation(reservation) {
  try {
    const response = await fetch(
      `/api/reservations/${encodeURIComponent(reservation.id)}/cancellation/read`,
      { method: "POST" },
    );
    const result = await response.json();
    if (response.status === 401) {
      currentUser = null;
      updateAuthInterface();
      openAuthDialog("login");
    }
    if (!response.ok) {
      throw new Error(
        result.message || "취소 예약 확인 처리를 하지 못했습니다.",
      );
    }

    myReservations = myReservations.filter((item) => item.id !== reservation.id);
    if (pendingBooking?.id === reservation.id) pendingBooking = null;
    if (expandedReservationId === reservation.id) expandedReservationId = null;
    renderMyPageContent();
    renderContractNotifications();

    if (reservationDetailDialog.open) {
      reservationDetailDialog.close();
      openMyPage();
    }
    showToast(
      localizeText(
        "확인한 취소 예약을 예약 내역에서 정리했습니다.",
        "The cancelled reservation was removed from your reservations.",
      ),
    );
  } catch (error) {
    showToast(
      error.message ||
        localizeText(
          "취소 예약 확인 처리를 하지 못했습니다.",
          "Unable to confirm the cancelled reservation.",
        ),
    );
  }
}

function resetMypageSettings() {
  mypagePasswordVerifyForm.reset();
  mypagePasswordForm.reset();
  mypageDeleteVerifyForm.reset();
  verifiedMypagePassword = "";
  mypageSettingsStatus.hidden = true;
  mypageSettingsStatus.textContent = "";
  mypageSettingsStatus.classList.remove("is-error");
}

function setMypageSettingsScreen(screen = "menu") {
  mypageSettingsMenu.hidden = screen !== "menu";
  mypagePasswordVerifyForm.hidden = screen !== "password-verify";
  mypagePasswordForm.hidden = screen !== "password-new";
  mypageDeleteVerifyForm.hidden = screen !== "delete-verify";
  mypageDeleteConfirm.hidden = screen !== "delete-confirm";
  mypageSettingsStatus.hidden = true;
}

function setMypageSettingsOpen(isOpen) {
  mypageSettingsOpen = isOpen;
  mypageSettingsPanel.hidden = !isOpen;
  mypageSettingsButton.setAttribute("aria-expanded", String(isOpen));
  mypageMainAccount.hidden = isOpen;
  mypageMainTabs.hidden = isOpen;
  mypageMainReservations.hidden = isOpen;
  mypageTitle.textContent = isOpen ? "설정" : "마이페이지";
  if (isOpen) setMypageSettingsScreen("menu");
  else resetMypageSettings();
}

function showMypageSettingsStatus(message, isError = false) {
  mypageSettingsStatus.textContent = message;
  mypageSettingsStatus.hidden = false;
  mypageSettingsStatus.classList.toggle("is-error", isError);
  mypageSettingsStatus.classList.remove("is-shaking");
  if (isError) {
    void mypageSettingsStatus.offsetWidth;
    mypageSettingsStatus.classList.add("is-shaking");
  }
}

function openMyPage() {
  mypageView = "reservations";
  expandedReservationId = null;
  setMypageSettingsOpen(false);
  mypageUserId.textContent = currentUser.userId;
  mypageEmail.textContent = currentUser.email;
  renderMyPageContent();
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
  const displayExperience = getDisplayExperience(selectedExperience);
  document.querySelector("#dialog-image").src =
    getProductImage(selectedExperience);
  document.querySelector("#dialog-image").alt = displayExperience.name;
  const dialogGallery = document.querySelector("#dialog-gallery");
  const productImages = [
    getProductImage(selectedExperience),
    ...(selectedExperience.detailImages || []),
  ].filter((image, index, list) => image && list.indexOf(image) === index);
  dialogGallery.innerHTML = productImages
    .map(
      (image, index) => `
        <button
           type="button"
           class="${index === 0 ? "is-active" : ""}"
           data-dialog-image="${escapeHtml(image)}"
           aria-label="${escapeHtml(
             localizeText(
               `${index + 1}번째 상품 사진 보기`,
               `View product image ${index + 1}`,
             ),
           )}"
         >
           <img src="${escapeHtml(image)}" alt="" />
         </button>
      `,
     )
     .join("");
  dialogGallery.hidden = productImages.length <= 1;
  document.querySelector("#dialog-title").textContent = displayExperience.name;
  document.querySelector("#dialog-location").textContent =
    `${localizeRegion(displayExperience.region)} · ${displayExperience.partnerName} · ${formatDuration(selectedExperience.durationMinutes)}`;
  document.querySelector("#dialog-price").textContent = formatPrice(
    selectedExperience.pricePerPerson,
  );

  bookingDate.value =
    searchDate.value && searchDate.value >= localToday ? searchDate.value : "";
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

function uniqueTerms(terms) {
  const seen = new Set();
  return terms.filter((term) => {
    const key = `${term.type}:${term.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return Boolean(term.text);
  });
}

function listText(items, fallback) {
  return Array.isArray(items) && items.length ? items.join(", ") : fallback;
}

function weatherDependencyText(value) {
  const labels = {
    low: localizeText("낮음", "low"),
    medium: localizeText("보통", "medium"),
    high: localizeText("높음", "high"),
  };
  return labels[value] || labels.medium;
}

function categoryNoticeText(experience) {
  const category = experience.category;
  const name = experience.name;

  if (["요트", "크루즈"].includes(category)) {
    return localizeText(
      `${name} 승선 중에는 선장과 승무원이 허용한 구역에서만 이동할 수 있으며, 출항 후 임의 하선이나 항로 변경 요청은 접수되지 않습니다.`,
      `During ${name}, guests may move only within areas approved by the captain and crew. After departure, personal route changes or early disembarkation requests are not accepted.`,
    );
  }
  if (["서핑", "SUP", "카약", "바디보드", "웨이크보드"].includes(category)) {
    return localizeText(
      `${name}은 파도, 조류, 바람 방향에 따라 실제 물 위 체험 시간이 줄거나 교육 비중이 늘어날 수 있습니다.`,
      `For ${name}, actual time on the water may be shortened or replaced with more instruction depending on waves, current, and wind direction.`,
    );
  }
  if (["다이빙", "프리다이빙", "스노클링"].includes(category)) {
    return localizeText(
      `${name} 참여 전 호흡기, 심혈관, 귀 질환, 임신, 최근 수술 이력을 확인하며 위험 항목이 있으면 현장에서 참여가 제한될 수 있습니다.`,
      `Before ${name}, respiratory, cardiovascular, ear-related, pregnancy, and recent surgery risks are checked. Participation may be restricted on site if any risk applies.`,
    );
  }
  if (category === "낚시") {
    return localizeText(
      `${name}은 조황과 특정 어종 포획을 보장하지 않으며, 물고기를 잡지 못해도 정상 진행된 체험은 환불 사유가 아닙니다.`,
      `${name} does not guarantee catch results or specific fish species. No catch is not a refund reason when the activity is normally provided.`,
    );
  }
  if (["바나나보트", "제트스키"].includes(category)) {
    return localizeText(
      `${name}은 급가속, 회전, 물 튐이 포함되는 고속 체험이며 목, 허리, 어깨 부상 이력이 있으면 참여 전 반드시 알려야 합니다.`,
      `${name} is a high-speed activity with acceleration, turns, and water impact. Guests with neck, back, or shoulder injury history must disclose it before joining.`,
    );
  }

  return localizeText(
    `${name}은 현장 안전요원의 안내에 따라 진행되며, 개인 판단으로 코스나 장비 사용 방식을 바꿀 수 없습니다.`,
    `${name} follows on-site safety staff instructions. Guests may not change the route or equipment use on their own.`,
  );
}

function buildVisibleContractTerms(experience, detail, contract) {
  const refundPolicy = detail.refundRules.length
    ? detail.refundRules.join(" / ")
    : experience.refundPolicy;
  const primaryBookingCondition = detail.bookingConditions[0];
  const primaryAdditionalClause = contract.additionalClauses[0];
  const primarySafetyNote = experience.safetyNotes[0];

  return uniqueTerms([
    {
      type: localizeText("이용 안내", "Activity details"),
      text: localizeText(
        `${experience.name}은 ${experience.location}에서 진행되는 ${formatDuration(experience.durationMinutes)} 상품이며, 접수와 장비 확인, 안전교육, 이동, 정리 시간이 전체 이용 시간에 포함됩니다.`,
        `${experience.name} is a ${formatDuration(experience.durationMinutes)} activity at ${experience.location}. Check-in, equipment checks, safety briefing, movement, and wrap-up are included in the total duration.`,
      ),
    },
    {
      type: localizeText("취소 및 환불", "Cancellation and refund"),
      text: localizeText(
        `${refundPolicy}. 환불 가능 여부는 예약 취소가 접수된 시각을 기준으로 판단하며, 환불은 결제 수단으로 처리됩니다.`,
        `${refundPolicy}. Refund eligibility is based on when the cancellation request is received, and refunds are returned to the original payment method.`,
      ),
    },
    {
      type: localizeText("지각 및 노쇼", "Late arrival and no-show"),
      text: localizeText(
        `예약 시간 20분 전까지 ${experience.location}에 도착해야 하며, 안전교육을 놓치거나 출발 후 도착한 경우 노쇼로 처리되어 환불되지 않을 수 있습니다.`,
        `Guests must arrive at ${experience.location} 20 minutes before the booked time. Missing the safety briefing or arriving after departure may be treated as a no-show without refund.`,
      ),
    },
    {
      type: localizeText("일정 변경", "Schedule changes"),
      text: localizeText(
        `운영 요일은 ${listText(experience.availableDays, "예약 가능일 확인 필요")}, 예약 가능 시간은 ${listText(experience.timeSlots, "업체 확인")}입니다. 기상 민감도는 ${weatherDependencyText(experience.weatherDependency)}이며, 업체가 안전상 필요하다고 판단하면 시간대나 코스가 변경될 수 있습니다.`,
        `Operating days are ${listText(experience.availableDays, "available date confirmation required")} and available times are ${listText(experience.timeSlots, "operator confirmation required")}. Weather sensitivity is ${weatherDependencyText(experience.weatherDependency)}, and the operator may change the time or route for safety.`,
      ),
    },
    {
      type: localizeText("참여 기준", "Participation requirements"),
      text: localizeText(
        `최대 정원은 ${experience.maxParticipants}명, 최소 참여 연령은 만 ${experience.minAge}세입니다. ${primaryBookingCondition || "보호자 동의나 동반이 필요한 경우 현장에서 확인합니다."}`,
        `Maximum capacity is ${experience.maxParticipants} guests and minimum age is ${experience.minAge}. ${primaryBookingCondition || "Guardian consent or accompaniment may be checked on site when required."}`,
      ),
    },
    {
      type: localizeText("준비물", "What to bring"),
      text: localizeText(
        experience.swimmingRequired
          ? "기본 수영 능력이 필요하며, 수영복 또는 젖어도 되는 옷, 여벌 옷, 수건, 신분증을 준비해야 합니다."
          : "수영 능력이 필수는 아니지만 젖어도 되는 옷, 여벌 옷, 수건, 신분증을 준비하는 것을 권장합니다.",
        experience.swimmingRequired
          ? "Basic swimming ability is required. Bring swimwear or clothes that can get wet, spare clothes, a towel, and ID."
          : "Swimming ability is not mandatory, but guests are advised to bring clothes that can get wet, spare clothes, a towel, and ID.",
      ),
    },
    {
      type: localizeText("안전 수칙", "Safety rules"),
      text: localizeText(
        `${primarySafetyNote || "현장 안전요원과 강사의 지시에 따라야 합니다."} 안전장비 착용을 거부하거나 반복적으로 지시를 어기면 체험이 중단될 수 있습니다.`,
        `${primarySafetyNote || "Guests must follow the on-site safety staff and instructor directions."} Refusing safety gear or repeatedly ignoring directions may end the activity.`,
      ),
    },
    {
      type: localizeText("현장 제한", "On-site restrictions"),
      text: categoryNoticeText(experience),
    },
    {
      type: localizeText("장비 및 파손", "Equipment and damage"),
      text: localizeText(
        "업체가 제공한 장비는 안내된 방식으로만 사용해야 하며, 고의 또는 중대한 부주의로 분실·파손이 발생하면 실제 수리비 또는 교체비가 청구될 수 있습니다.",
        "Provided equipment must be used only as instructed. Loss or damage caused by intentional misuse or gross negligence may be charged at actual repair or replacement cost.",
      ),
    },
    {
      type: localizeText("포함/불포함", "Included and excluded"),
      text: localizeText(
        `포함 사항은 ${listText(experience.included, "상품 상세의 포함 사항")}입니다. ${primaryAdditionalClause || "명시되지 않은 개인 준비물, 교통비, 추가 촬영, 식음료, 옵션 비용은 포함되지 않을 수 있습니다."}`,
        `Included items are ${listText(experience.included, "the inclusions shown in the product detail")}. ${primaryAdditionalClause || "Personal items, transport, extra photos, food and drinks, or optional costs not listed may not be included."}`,
      ),
    },
  ]).slice(0, 10);
}

function renderContractSummary(result) {
  const summary = result.summary;
  const summaryPanel = document.querySelector("#detail-ai-summary");
  const riskElement = document.querySelector("#detail-ai-risk");

  document.querySelector("#detail-ai-mode").textContent =
    result.mode === "solar"
      ? localizeText("UPSTAGE SOLAR 분석 완료", "UPSTAGE SOLAR analysis")
      : localizeText("기본 분석 결과", "Basic analysis");
  riskElement.textContent = localizeText(
    `주의도 ${summary.riskLevel}`,
    `Risk: ${localizeRiskLevel(summary.riskLevel)}`,
  );
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

function createContractSummaryFallback(experienceId) {
  const experience = experiences.find((item) => item.id === experienceId);
  const sourceDetail = productDetails[experienceId];
  const sourceContract = productContracts[experienceId];
  const translation = isTranslatedLocale()
    ? getProductTranslationCache().get(experienceId)
    : null;
  const detail = translation?.detail
    ? { ...sourceDetail, ...translation.detail }
    : sourceDetail;
  const contract = translation?.contract
    ? { ...sourceContract, ...translation.contract }
    : sourceContract;
  const translatedFallback = isTranslatedLocale() && !translation?.detail;

  return {
    mode: "local",
    summary: {
      headline: localizeText(
        `${experience?.name ?? "이 상품"} 예약 전 환불 시점과 이용 제한 조건을 확인하세요.`,
        `${translation?.product?.name ?? "This experience"}: review cancellation deadlines and booking restrictions before you reserve.`,
      ),
      riskLevel: sourceContract?.riskLevel ?? "보통",
      refundWarnings: translatedFallback
        ? [localizeText(
            "취소 기한과 환불 제한은 전체 약관에서 확인하세요.",
            "Review the full terms for cancellation deadlines and refund restrictions.",
          )]
        : detail?.refundRules?.slice(0, 3) ?? [],
      unfairTerms: translatedFallback
        ? [localizeText(
            "추가 이용 제한이 적용될 수 있으니 예약 전에 전체 약관을 확인하세요.",
            "Additional booking restrictions may apply. Review the full terms before reserving.",
          )]
        : [
            ...(detail?.bookingConditions ?? []),
            ...(contract?.additionalClauses ?? []),
          ].slice(0, 3),
    },
  };
}

function setDetailTranslationLoading(isLoading) {
  const loadingPanel = document.querySelector("#detail-translation-loading");
  const loadingSpinner = document.querySelector("#detail-translation-spinner");
  const loadingMessage = document.querySelector(
    "#detail-translation-loading-message",
  );

  if (!loadingPanel || !loadingSpinner || !loadingMessage) return;

  loadingPanel.hidden = !isLoading;
  loadingSpinner.hidden = !isLoading;
  loadingSpinner.toggleAttribute("hidden", !isLoading);
  loadingMessage.textContent = "Preparing the experience details in your selected language.";
  productDetailDialog.classList.toggle("is-translating", isLoading);
  productDetailDialog.setAttribute("aria-busy", String(isLoading));
}

function showDetailTranslationFailure() {
  const loadingPanel = document.querySelector("#detail-translation-loading");
  const loadingSpinner = document.querySelector("#detail-translation-spinner");
  const loadingMessage = document.querySelector(
    "#detail-translation-loading-message",
  );

  if (!loadingPanel || !loadingSpinner || !loadingMessage) return;

  loadingPanel.hidden = false;
  loadingSpinner.hidden = true;
  loadingMessage.textContent = localizeText(
    "상세 정보를 번역하지 못했습니다. 닫은 뒤 다시 시도해 주세요.",
    "The translated details could not be prepared. Please close and try again.",
  );
  productDetailDialog.classList.add("is-translating");
  productDetailDialog.setAttribute("aria-busy", "false");
}

function openProductDetail(experienceId, shouldOpenDialog = true) {
  const sourceExperience = experiences.find(
    (experience) => experience.id === experienceId,
  );
  const sourceDetail = productDetails[experienceId];
  const sourceContract = productContracts[experienceId];
  const media = productMedia[experienceId];

  if (!sourceExperience || !sourceDetail || !sourceContract || !media) {
    showToast(localizeText("상품 상세 정보를 불러오지 못했습니다.", "Unable to load product details."));
    return;
  }

  const translation = isTranslatedLocale()
    ? getProductTranslationCache().get(experienceId)
    : null;
  const selectedExperience = translation
    ? { ...sourceExperience, ...translation.product }
    : sourceExperience;
  const detail = translation?.detail
    ? { ...sourceDetail, ...translation.detail }
    : sourceDetail;
  const contract = translation?.contract
    ? { ...sourceContract, ...translation.contract }
    : sourceContract;

  state.selectedExperience = sourceExperience;
  const isPreparingTranslation =
    isTranslatedLocale() && shouldOpenDialog && !translation?.detail;
  setDetailTranslationLoading(isPreparingTranslation);
  document.querySelector("#detail-image").src = getProductImage(sourceExperience);
  document.querySelector("#detail-image").alt = getProductImageAlt(selectedExperience);
  document.querySelector("#detail-category").textContent =
    `${localizeRegion(selectedExperience.region)} · ${localizeCategory(selectedExperience.category)}`;
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
  document.querySelector("#detail-duration").textContent = formatDuration(
    selectedExperience.durationMinutes,
  );
  document.querySelector("#detail-age").textContent =
    localizeText(
      `만 ${selectedExperience.minAge}세 이상`,
      `Ages ${selectedExperience.minAge}+`,
    );
  document.querySelector("#detail-capacity").textContent =
    formatPeople(selectedExperience.maxParticipants);
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
        <img src="${imageUrl}" alt="${escapeHtml(localizeText(`${selectedExperience.name} 관련 사진 ${index + 1}`, `${selectedExperience.name} photo ${index + 1}`))}" loading="lazy" />
      </figure>
    `,
  );

  const photoSource = document.querySelector("#detail-photo-source");
  photoSource.href = media.sourceUrl;
  photoSource.textContent = media.sourceUrl.includes("unsplash.com")
    ? localizeText("대표 사진 출처 · Unsplash ↗", "Photo source · Unsplash ↗")
    : localizeText("대표 사진 출처 확인 ↗", "View photo source ↗");
  renderList(
    "#detail-included",
    selectedExperience.included,
    (item) => `<span>${escapeHtml(item)}</span>`,
  );
  renderList(
    "#detail-contract-terms",
    buildVisibleContractTerms(selectedExperience, detail, contract),
    (term) =>
      `<li>
        <strong class="detail-term-title">&lt;${escapeHtml(term.type)}&gt;</strong>
        <span class="detail-term-description">${escapeHtml(term.text)}</span>
      </li>`,
  );

  const cachedSummary = state.contractSummaryCache.get(
    getContractSummaryCacheKey(experienceId),
  );
  const summaryPanel = document.querySelector("#detail-ai-summary");
  const summaryButton = document.querySelector("#detail-ai-summary-button");
  summaryPanel.hidden = true;
  summaryButton.disabled = false;
  summaryButton.querySelector("span").textContent = cachedSummary
    ? localizeText("AI 요약 다시 보기", "View AI summary again")
    : localizeText("AI로 이 페이지 요약하기", "Summarize this page with AI");
  if (cachedSummary) renderContractSummary(cachedSummary);

  if (shouldOpenDialog) {
    productDetailDialog.scrollTop = 0;
    if (!productDetailDialog.open) productDetailDialog.showModal();
    document.body.classList.add("dialog-open");
    requestProductTranslation(experienceId);
  }
}

function renderProductDetail(experienceId) {
  openProductDetail(experienceId, false);
}

async function requestProductTranslation(experienceId) {
  if (!isTranslatedLocale()) {
    return;
  }
  const locale = activeLocale;
  const cache = getProductTranslationCache(locale);
  if (cache.get(experienceId)?.detail) return;

  const requestKey = `${locale}:${experienceId}`;
  if (productTranslationRequests.has(requestKey)) {
    await productTranslationRequests.get(requestKey);
    return;
  }

  let translationLoaded = false;
  const translationRequest = fetch("/api/product-translation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: experienceId, locale }),
  })
    .then(async (response) => {
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Product translation is unavailable.");
      }
      cache.set(experienceId, result.translation);
      translationLoaded = true;
    })
    .catch((error) => {
      showToast(
        localizeText(
          "선택한 언어의 번역을 준비하지 못했습니다.",
          "The selected language translation could not be prepared.",
        ),
      );
      console.error("상품 번역 오류:", error.message);
    })
    .finally(() => {
      productTranslationRequests.delete(requestKey);
    });

  productTranslationRequests.set(requestKey, translationRequest);
  await translationRequest;

  if (
    activeLocale === locale &&
    productDetailDialog.open &&
    state.selectedExperience?.id === experienceId
  ) {
    if (translationLoaded) renderProductDetail(experienceId);
    else showDetailTranslationFailure();
  }
}

async function requestProductCardTranslations(productList) {
  if (!isTranslatedLocale() || productList.length === 0) {
    setProductTranslationStatus("idle");
    return;
  }

  const locale = activeLocale;
  const cache = getProductTranslationCache(locale);
  const missingProducts = productList.filter(
    (product) => !cache.get(product.id)?.product?.name,
  );
  if (missingProducts.length === 0) {
    setProductTranslationStatus("idle");
    return;
  }

  const requestKey = `${locale}:${missingProducts.map((product) => product.id).join(",")}`;
  if (productCardTranslationRequests.has(requestKey)) {
    await productCardTranslationRequests.get(requestKey);
    return;
  }

  setProductTranslationStatus("loading");

  const translationRequest = fetch("/api/product-card-translations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      locale,
      productIds: missingProducts.map((product) => product.id),
    }),
  })
    .then(async (response) => {
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Product card translation is unavailable.");
      }

      result.translations.forEach((translation) => {
        const cachedTranslation = cache.get(translation.id);
        cache.set(translation.id, {
          ...cachedTranslation,
          product: {
            ...cachedTranslation?.product,
            name: translation.name,
            partnerName: translation.partnerName,
          },
        });
      });
      if (activeLocale === locale) {
        renderExperiences();
        if (mypageDialog.open && mypageView === "favorites") renderMyPageContent();
        setProductTranslationStatus("idle");
      }
    })
    .catch((error) => {
      console.error("상품 카드 번역 오류:", error.message);
      if (activeLocale === locale) setProductTranslationStatus("error");
    })
    .finally(() => {
      productCardTranslationRequests.delete(requestKey);
    });

  productCardTranslationRequests.set(requestKey, translationRequest);
  await translationRequest;
}

function addSellerProductDetailData() {
  experiences
    .filter((product) => product.sellerCreated)
    .forEach((product) => {
      productDetails[product.id] = {
        promotion: product.description,
        highlights: product.included?.length
          ? product.included
          : ["판매자가 직접 등록한 WAVEON 파트너 상품"],
        refundRules: product.refundPolicy ? [product.refundPolicy] : [],
        bookingConditions: product.participantRequirements || [],
      };
      productContracts[product.id] = {
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
      };
      productMedia[product.id] = {
        cover: product.thumbnailImage || "",
        coverAlt: `${product.name} 판매자 등록 사진`,
        sourceUrl: "#",
        gallery: product.detailImages?.length
          ? product.detailImages
          : [product.thumbnailImage].filter(Boolean),
      };
    });
}

async function loadProducts() {
  try {
    const loadProductList = async () => {
      const apiResponse = await fetch("/api/products");
      if (apiResponse.ok) return apiResponse;

      // 이전 서버 버전은 판매자 등록 API가 없을 수 있습니다.
      // 이 경우 기본 상품 JSON을 사용해 목록이 비어 보이지 않도록 합니다.
      const localResponse = await fetch("/data/products.json");
      if (localResponse.ok) return localResponse;
      throw new Error("상품 목록을 불러오지 못했습니다.");
    };

    const [
      productsResponse,
      detailsResponse,
      contractsResponse,
      mediaResponse,
    ] = await Promise.all([
      loadProductList(),
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
    addSellerProductDetailData();
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

regionFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    toggleRegionFilter(button.dataset.regionFilter);
  });
});

document.querySelectorAll("[data-region]").forEach((button) => {
  button.addEventListener("click", () => {
    clearRecommendations();
    state.region = button.dataset.region;
    state.regions = new Set([state.region]);
    regionSelect.value = state.region;
    updateRegionFilterButtons();
    renderExperiences();
    document.querySelector("#experiences").scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  clearRecommendations();
  state.region = regionSelect.value;
  state.regions = state.region ? new Set([state.region]) : new Set();
  state.keyword = keywordInput.value;
  updateRegionFilterButtons();
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
    if (mypageDialog.open && mypageView === "favorites") renderMyPageContent();
    return;
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
  stopDetailTermsReading();
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
    summaryButton.querySelector("span").textContent = localizeText(
      "긴 약관을 읽는 중...",
      "Reviewing the full terms...",
    );
    summaryPanel.hidden = true;

    try {
      const response = await fetch("/api/contract-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedExperience.id,
          locale: activeLocale,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "약관을 요약하지 못했습니다.");
      }

      state.contractSummaryCache.set(
        getContractSummaryCacheKey(selectedExperience.id),
        result,
      );
      renderContractSummary(result);
      summaryButton.querySelector("span").textContent = localizeText(
        "AI 요약 다시 보기",
        "View AI summary again",
      );
    } catch (error) {
      const fallbackSummary = createContractSummaryFallback(
        selectedExperience.id,
      );
      state.contractSummaryCache.set(
        getContractSummaryCacheKey(selectedExperience.id),
        fallbackSummary,
      );
      renderContractSummary(fallbackSummary);
      summaryButton.querySelector("span").textContent = localizeText(
        "AI 요약 다시 보기",
        "View AI summary again",
      );
      showToast(
        localizeText(
          "Solar 응답이 지연되어 약관 기준 요약을 표시합니다.",
          "Solar was delayed, so a terms-based summary is shown.",
        ),
      );
      console.error("AI 약관 요약 오류:", error.message);
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
    loadMyReservations();
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

mypageSettingsButton.addEventListener("click", () => {
  setMypageSettingsOpen(true);
});

mypageSettingsClose.addEventListener("click", () => setMypageSettingsOpen(false));

mypageOpenPassword.addEventListener("click", () => setMypageSettingsScreen("password-verify"));
mypageOpenDelete.addEventListener("click", () => setMypageSettingsScreen("delete-verify"));
mypageSettingsBackButtons.forEach((button) => {
  button.addEventListener("click", () => {
    verifiedMypagePassword = "";
    setMypageSettingsScreen("menu");
  });
});

async function verifyCurrentMypagePassword(password) {
  const response = await fetch("/api/auth/password/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword: password }),
  });
  const result = await response.json().catch(() => ({}));
  if (response.status === 404) {
    throw new Error("서버 업데이트가 아직 적용되지 않았어요. 서버를 재시작한 뒤 다시 시도해 주세요.");
  }
  if (!response.ok) throw new Error(result.message || "현재 비밀번호가 일치하지 않습니다.");
}

mypagePasswordVerifyForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  mypagePasswordVerifySubmit.disabled = true;
  try {
    await verifyCurrentMypagePassword(mypagePasswordCurrent.value);
    verifiedMypagePassword = mypagePasswordCurrent.value;
    mypagePasswordVerifyForm.reset();
    setMypageSettingsScreen("password-new");
  } catch (error) {
    showMypageSettingsStatus(error.message, true);
  } finally {
    mypagePasswordVerifySubmit.disabled = false;
  }
});

mypagePasswordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (mypagePasswordNew.value !== mypagePasswordConfirm.value) {
    showMypageSettingsStatus("새 비밀번호 확인이 일치하지 않습니다.", true);
    return;
  }

  mypagePasswordSubmit.disabled = true;
  try {
    const response = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: verifiedMypagePassword,
        newPassword: mypagePasswordNew.value,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "비밀번호를 변경하지 못했습니다.");
    currentUser = result.user || currentUser;
    updateAuthInterface();
    resetMypageSettings();
    setMypageSettingsScreen("menu");
    showToast("비밀번호가 변경되었습니다.");
  } catch (error) {
    showMypageSettingsStatus(error.message, true);
  } finally {
    mypagePasswordSubmit.disabled = false;
  }
});

mypageDeleteVerifyForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  mypageDeleteVerifySubmit.disabled = true;
  try {
    await verifyCurrentMypagePassword(mypageDeletePassword.value);
    verifiedMypagePassword = mypageDeletePassword.value;
    mypageDeleteVerifyForm.reset();
    setMypageSettingsScreen("delete-confirm");
  } catch (error) {
    showMypageSettingsStatus(error.message, true);
  } finally {
    mypageDeleteVerifySubmit.disabled = false;
  }
});

mypageDeleteSubmit.addEventListener("click", async () => {
  mypageDeleteSubmit.disabled = true;
  try {
    const response = await fetch("/api/auth/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: verifiedMypagePassword }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "회원 탈퇴를 처리하지 못했습니다.");

    currentUser = null;
    myReservations = [];
    pendingBooking = null;
    notificationBadge.hidden = true;
    contractNotification.hidden = true;
    setMypageSettingsOpen(false);
    mypageDialog.close();
    updateAuthInterface();
    showToast("회원 탈퇴가 완료되었습니다.");
  } catch (error) {
    showMypageSettingsStatus(error.message, true);
  } finally {
    mypageDeleteSubmit.disabled = false;
  }
});

mypageTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    mypageView = button.dataset.mypageView;
    expandedReservationId = null;
    renderMyPageContent();
  });
});

mypageDialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
  setMypageSettingsOpen(false);
});

mypageDialog.addEventListener("click", (event) => {
  if (event.target === mypageDialog) mypageDialog.close();
});

mypageReservationList.addEventListener("click", (event) => {
  const removeFavoriteButton = event.target.closest("[data-remove-favorite]");
  if (removeFavoriteButton) {
    state.favorites.delete(removeFavoriteButton.dataset.removeFavorite);
    renderExperiences();
    renderMyPageContent();
    showToast(localizeText("찜 목록에서 제외했어요.", "Removed from saved experiences."));
    return;
  }

  const openFavoriteButton = event.target.closest("[data-open-favorite]");
  if (openFavoriteButton) {
    mypageDialog.close();
    openProductDetail(openFavoriteButton.dataset.openFavorite);
    return;
  }

  const toggleButton = event.target.closest("[data-toggle-reservation]");
  if (toggleButton) {
    expandedReservationId =
      expandedReservationId === toggleButton.dataset.toggleReservation
        ? null
        : toggleButton.dataset.toggleReservation;
    renderMyReservations();
    return;
  }

  const acknowledgeButton = event.target.closest(
    "[data-acknowledge-cancellation]",
  );
  if (acknowledgeButton) {
    const reservation = myReservations.find(
      (item) => item.id === acknowledgeButton.dataset.acknowledgeCancellation,
    );
    if (reservation) acknowledgeCancelledReservation(reservation);
    return;
  }

  const cancelButton = event.target.closest("[data-cancel-reservation]");
  if (cancelButton) {
    const reservation = myReservations.find(
      (item) => item.id === cancelButton.dataset.cancelReservation,
    );
    if (reservation) openReservationCancelDialog(reservation);
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

reservationDetailContent.addEventListener("click", (event) => {
  const acknowledgeButton = event.target.closest(
    "[data-acknowledge-cancellation]",
  );
  if (acknowledgeButton) {
    const reservation = myReservations.find(
      (item) => item.id === acknowledgeButton.dataset.acknowledgeCancellation,
    );
    if (reservation) acknowledgeCancelledReservation(reservation);
    return;
  }

  const cancelButton = event.target.closest("[data-cancel-reservation]");
  if (cancelButton) {
    const reservation = myReservations.find(
      (item) => item.id === cancelButton.dataset.cancelReservation,
    );
    if (reservation) openReservationCancelDialog(reservation);
    return;
  }

  const signatureButton = event.target.closest("[data-start-reservation-signature]");
  if (!signatureButton) return;

  const reservation = myReservations.find(
    (item) => item.id === signatureButton.dataset.startReservationSignature,
  );
  if (reservation) openContractReview(reservation);
});

reservationDetailDialog.addEventListener("close", () => {
  viewedReservationId = null;
  document.body.classList.remove("dialog-open");
});

reservationDetailDialog.addEventListener("click", (event) => {
  if (event.target === reservationDetailDialog) reservationDetailDialog.close();
});

reservationCancelDismiss.addEventListener("click", () => {
  reservationCancelDialog.close();
});

reservationCancelConfirm.addEventListener("click", cancelReservation);

reservationCancelDialog.addEventListener("close", () => {
  reservationToCancel = null;
});

reservationCancelDialog.addEventListener("click", (event) => {
  if (event.target === reservationCancelDialog) reservationCancelDialog.close();
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
      state.regions.clear();
      state.keyword = "";
      regionSelect.value = "";
      keywordInput.value = "";
      updateRegionFilterButtons();

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
  const galleryButton = event.target.closest("[data-dialog-image]");
  if (galleryButton) {
    document.querySelector("#dialog-image").src = galleryButton.dataset.dialogImage;
    document
      .querySelectorAll("#dialog-gallery [data-dialog-image]")
      .forEach((button) =>
        button.classList.toggle("is-active", button === galleryButton),
      );
    return;
  }
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

  const reservationDate = bookingDate.value;
  if (!reservationDate) {
    bookingDate.setCustomValidity(
      localizeText(
        "달력에서 이용 날짜를 선택해 주세요.",
        "Choose a date from the calendar.",
      ),
    );
    bookingDate.reportValidity();
    return;
  }
  bookingDate.setCustomValidity("");

  const people = document.querySelector("#booking-people").value;
  const experienceTitle = state.selectedExperience?.name ?? "선택한 경험";
  const submitButton = event.currentTarget.querySelector(".dialog-submit");
  const bookingDraft = {
    name: bookingName.value.trim(),
    productId: state.selectedExperience?.id ?? "",
    people,
    date: reservationDate,
    time: bookingTime.value,
    activity: experienceTitle,
    venue: state.selectedExperience?.partnerName ?? "WAVEON BUSAN 제휴 업체",
  };

  submitButton.disabled = true;
  submitButton.textContent = localizeText("예약 저장 중…", "Saving reservation…");

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

    bookingDialog.close();
    contractNotification.hidden = true;
    myReservations = [
      result.reservation,
      ...myReservations.filter(
        (reservation) => reservation.id !== result.reservation.id,
      ),
    ];
    if (state.selectedExperience?.sellerCreated) {
      pendingBooking = null;
      notificationBadge.hidden = true;
    } else {
      pendingBooking = result.reservation;
      renderContractNotifications();
      notificationButton.setAttribute("aria-expanded", "false");
    }
    showToast(
      state.selectedExperience?.sellerCreated
        ? localizeText(
            `${experienceTitle} 예약을 판매자에게 전달했어요. 계약서는 로그인 이메일로 도착합니다.`,
            `${experienceTitle} was sent to the seller. The contract will arrive at your account email.`,
          )
        : localizeText(
            `${experienceTitle} 예약이 저장됐어요. 계약서를 확인해 주세요.`,
            `${experienceTitle} was reserved. Please review the contract.`,
          ),
    );
  } catch (error) {
    showToast(error.message);
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = `${localizeText("예약 요청하기", "Request reservation")} <span>→</span>`;
  }
});

function openContractReview(reservation = pendingBooking) {
  if (!reservation) {
    showToast("확인할 계약서 알림이 없습니다.");
    return;
  }

  pendingBooking = reservation;
  contractNotification.hidden = true;
  notificationButton.setAttribute("aria-expanded", "false");
  if (reservationDetailDialog.open) reservationDetailDialog.close();
  contractAgreement.checked = false;
  renderContractBookingSummary(pendingBooking);
  contractDialog.showModal();
}

function renderContractBookingSummary(reservation) {
  const displayReservation = getReservationDisplay(reservation);
  contractBookingSummary.textContent =
    `${displayReservation.activity} · ${reservation.date}${reservation.time ? ` ${reservation.time}` : ""} · ${formatPeople(Number(reservation.people))} / ${displayReservation.venue}`;
}

function renderContractAiSummary(result) {
  const summary = result.summary;
  contractAiRisk.textContent = localizeText(
    `주의도 ${summary.riskLevel}`,
    `Risk: ${localizeRiskLevel(summary.riskLevel)}`,
  );
  contractAiRisk.dataset.risk = summary.riskLevel;
  contractAiMode.textContent = result.mode === "modusign-document"
    ? localizeText("실제 계약서 AI 분석", "Actual contract AI analysis")
    : result.mode === "modusign-document-fallback"
      ? localizeText("실제 계약서 기준 요약", "Actual contract summary")
      : result.mode === "solar"
        ? localizeText("AI 분석 완료", "AI analysis complete")
        : localizeText("약관 기준 요약", "Terms-based summary");
  contractAiHeadline.textContent = summary.headline;
  renderList(
    "#contract-ai-refund",
    summary.refundWarnings,
    (item) => `<li>${escapeHtml(item)}</li>`,
  );
  renderList(
    "#contract-ai-watchout",
    summary.unfairTerms,
    (item) => `<li>${escapeHtml(item)}</li>`,
  );
  contractAiLoading.hidden = true;
  contractAiSummary.hidden = false;
}

async function loadContractAiSummary(reservation) {
  if (!reservation?.id) return;

  contractAiSummary.hidden = true;
  contractAiLoading.hidden = false;
  contractAiLoading.textContent = localizeText(
    "계약서 조항을 확인하고 있어요.",
    "Reviewing contract terms…",
  );

  const cacheKey = `signature:${activeLocale}:${reservation.id}`;
  const cachedSummary = state.contractSummaryCache.get(cacheKey);
  if (cachedSummary) {
    renderContractAiSummary(cachedSummary);
    return;
  }

  try {
    const response = await fetch("/api/signature/contract-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservationId: reservation.id, locale: activeLocale }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "약관을 요약하지 못했습니다.");
    state.contractSummaryCache.set(cacheKey, result);
    renderContractAiSummary(result);
  } catch (error) {
    const fallbackSummary = createContractSummaryFallback(reservation.productId);
    state.contractSummaryCache.set(cacheKey, fallbackSummary);
    renderContractAiSummary(fallbackSummary);
    console.error("전자서명 전 AI 약관 요약 오류:", error.message);
  }
}

function setNotificationPanelOpen(isOpen) {
  const canOpen = isOpen && getPendingContractReservations().length > 0;
  contractNotification.hidden = !canOpen;
  notificationButton.setAttribute("aria-expanded", String(canOpen));
}

function clearNotificationCloseTimer() {
  if (notificationCloseTimer) window.clearTimeout(notificationCloseTimer);
  notificationCloseTimer = null;
}

function scheduleNotificationPanelClose() {
  clearNotificationCloseTimer();
  notificationCloseTimer = window.setTimeout(() => {
    setNotificationPanelOpen(false);
  }, 260);
}

notificationTrigger.addEventListener("pointerenter", () => {
  clearNotificationCloseTimer();
  setNotificationPanelOpen(true);
});
notificationTrigger.addEventListener("pointerleave", () => {
  scheduleNotificationPanelClose();
});
notificationTrigger.addEventListener("focusin", () => {
  clearNotificationCloseTimer();
  setNotificationPanelOpen(true);
});
notificationTrigger.addEventListener("focusout", (event) => {
  if (!notificationTrigger.contains(event.relatedTarget)) {
    scheduleNotificationPanelClose();
  }
});
async function markBuyerNotificationRead(reservation, notificationType) {
  const endpoint =
    notificationType === "cancellation"
      ? `/api/reservations/${encodeURIComponent(reservation.id)}/cancellation/read`
      : `/api/reservations/${encodeURIComponent(reservation.id)}/contract/read`;
  const response = await fetch(endpoint, { method: "POST" });
  const result = await response.json();

  if (response.status === 401) {
    currentUser = null;
    updateAuthInterface();
    openAuthDialog("login");
  }
  if (!response.ok) {
    throw new Error(result.message || "알림 확인 상태를 저장하지 못했습니다.");
  }

  myReservations = myReservations.map((item) =>
    item.id === reservation.id ? result.reservation : item,
  );
  renderContractNotifications();
  return result.reservation;
}

contractNotificationList.addEventListener("click", async (event) => {
  const sellerCancellation = event.target.closest(
    "[data-open-seller-cancellation]",
  );
  if (sellerCancellation) {
    const reservation = myReservations.find(
      (item) => item.id === sellerCancellation.dataset.openSellerCancellation,
    );
    if (reservation) {
      let confirmedReservation = reservation;
      try {
        confirmedReservation = await markBuyerNotificationRead(
          reservation,
          "cancellation",
        );
      } catch (error) {
        showToast(error.message);
      }
      openReservationDetail(confirmedReservation);
    }
    return;
  }

  const notification = event.target.closest("[data-open-contract]");
  if (!notification) return;

  const reservation = myReservations.find(
    (item) => item.id === notification.dataset.openContract,
  );
  if (!reservation) return;
  let confirmedReservation = reservation;
  try {
    confirmedReservation = await markBuyerNotificationRead(
      reservation,
      "contract",
    );
  } catch (error) {
    showToast(error.message);
  }
  if (confirmedReservation.status === "SIGNING") {
    void resumeSignature(confirmedReservation);
    return;
  }
  openContractReview(confirmedReservation);
});
document.querySelector("#contract-close").addEventListener("click", () => contractDialog.close());

function openEmbeddedSignature(result, reservation) {
  activeReservationId = result.reservationId;
  pendingBooking = reservation;
  updateReservationAfterSignature(result.reservationId, "SIGNING");
  if (contractDialog.open) contractDialog.close();
  signatureFrameLoaded = false;
  signatureStatus.textContent = localizeText(
    "계약서에 서명해 주세요.",
    "Please sign the contract.",
  );
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
  void loadContractAiSummary(reservation);
  if (signatureStatusTimer) window.clearInterval(signatureStatusTimer);
  signatureStatusTimer = window.setInterval(checkSignatureStatus, 30000);
}

contractAiReloadButton.addEventListener("click", () => {
  const reservation =
    pendingBooking ??
    myReservations.find((item) => item.id === activeReservationId);
  if (!reservation) {
    showToast("전자서명 예약 정보를 찾지 못했습니다.");
    return;
  }
  void loadContractAiSummary(reservation);
});

async function resumeSignature(reservation) {
  if (isResumingSignature) return;
  isResumingSignature = true;
  try {
    const response = await fetch("/api/signature/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservationId: reservation.id }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "기존 전자서명 화면을 다시 열지 못했습니다.");
    }
    if (result.completed) {
      updateReservationAfterSignature(result.reservationId, "COMPLETED");
      showToast("이미 전자서명이 완료된 예약입니다. 마이페이지에서 문서를 확인해 주세요.");
      return;
    }
    if (!result.embeddedUrl) {
      throw new Error("기존 전자서명 화면 주소를 받지 못했습니다.");
    }
    openEmbeddedSignature(result, reservation);
  } catch (error) {
    showToast(error.message || "전자서명 화면을 다시 열지 못했습니다.");
  } finally {
    isResumingSignature = false;
  }
}

startSignatureButton.addEventListener("click", async () => {
  if (!contractAgreement.checked) {
    showToast(localizeText("계약서 주요 약관을 확인하고 동의해 주세요.", "Please review and agree to the key contract terms."));
    return;
  }

  startSignatureButton.disabled = true;
  startSignatureButton.textContent = localizeText("계약서 준비 중…", "Preparing contract…");
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
      updateReservationAfterSignature(result.reservationId, "COMPLETED");
      contractDialog.close();
      showToast("이미 전자서명이 완료된 예약입니다. 마이페이지에서 문서를 확인해 주세요.");
      return;
    }
    if (!result.embeddedUrl) {
      throw new Error("전자서명 화면 주소를 받지 못했습니다.");
    }

    openEmbeddedSignature(result, pendingBooking);
  } catch (error) {
    showToast(error.message);
  } finally {
    startSignatureButton.disabled = false;
    startSignatureButton.innerHTML = `${localizeText("전자서명 진행", "Proceed to e-signature")} <span>→</span>`;
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
    if (result.reservationStatus === "SELLER_CANCELLED") {
      const reservation = myReservations.find(
        (item) => item.id === activeReservationId,
      );
      if (reservation) {
        reservation.status = "SELLER_CANCELLED";
        reservation.signatureStatus = "";
        reservation.documentAvailable = false;
        reservation.cancellationNoticePending = true;
        reservation.sellerCancellationNoticePending = true;
      }
      closeSignatureDialog();
      renderContractNotifications();
      renderMyPageContent();
      showToast(
        localizeText(
          "판매자가 예약을 취소해 전자서명이 중단되었습니다.",
          "The seller cancelled this reservation, so e-signature was stopped.",
        ),
      );
      return;
    }
    if (result.status === "COMPLETED") {
      updateReservationAfterSignature(activeReservationId, "COMPLETED");
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

function updateReservationAfterSignature(reservationId, status) {
  const reservation = myReservations.find((item) => item.id === reservationId);
  if (reservation) {
    reservation.status = status;
    reservation.signatureStatus = status;
    reservation.documentAvailable = status === "COMPLETED";
  }
  if (pendingBooking?.id === reservationId) {
    pendingBooking.status = status;
    pendingBooking.signatureStatus = status;
    pendingBooking.documentAvailable = status === "COMPLETED";
  }
  renderContractNotifications();
  renderMyPageContent();
}

function resetSignatureDialogSession() {
  if (signatureStatusTimer) window.clearInterval(signatureStatusTimer);
  signatureStatusTimer = null;
  activeReservationId = null;
  signatureFrameLoaded = false;
  signatureFrameWrap.innerHTML = "";
}

function closeSignatureDialog() {
  if (signatureDialog.open) {
    signatureDialog.close();
    return;
  }
  resetSignatureDialogSession();
}

signatureDialog.addEventListener("close", resetSignatureDialogSession);

document.querySelector("#signature-close").addEventListener("click", closeSignatureDialog);

detailFontDecreaseButton.addEventListener("click", () => {
  detailFontScaleIndex = Math.max(0, detailFontScaleIndex - 1);
  updateDetailFontScale();
});

detailFontIncreaseButton.addEventListener("click", () => {
  detailFontScaleIndex = Math.min(
    detailFontScaleOptions.length - 1,
    detailFontScaleIndex + 1,
  );
  updateDetailFontScale();
});

detailSpeechToggleButton.addEventListener("click", toggleDetailTermsReading);

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextLocale = button.dataset.locale;
    if (!supportedLocales.has(nextLocale) || nextLocale === activeLocale) return;

    stopDetailTermsReading();
    activeLocale = nextLocale;
    try {
      window.localStorage.setItem("waveon-locale", activeLocale);
    } catch {
      // 브라우저 저장소를 사용할 수 없어도 현재 페이지의 언어는 전환합니다.
    }
    applyLocale();
  });
});

window.addEventListener("pagehide", () => {
  stopDetailTermsReading();
});

window.setInterval(() => {
  if (currentUser && document.visibilityState === "visible") {
    loadMyReservations({ silent: true });
  }
}, 8000);

bookingDate.addEventListener("input", () => {
  bookingDate.setCustomValidity("");
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
  updateDetailFontScale();
  applyLocale();
  await Promise.all([loadCurrentUser(), loadProducts()]);
  applyLocale();
}

initialize();
