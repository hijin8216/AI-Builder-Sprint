(() => {
  const supportedLocales = new Set(["ko", "en", "ja", "zh"]);
  const copy = {
    ko: {
      sellerTitle: "WAVEON PARTNER | 판매자 센터",
      editorTitle: "새 판매 상품 작성 | WAVEON PARTNER",
      languageLabel: "언어 선택",
      sellerBrandLabel: "WAVEON 판매자 센터 홈",
      sellerNavLabel: "판매자 메뉴",
      editorNavLabel: "상품 작성 메뉴",
      navProducts: "상품 관리",
      navContracts: "전자계약",
      buyerPage: "구매자 페이지",
      sellerHome: "판매자 센터로 돌아가기",
      heroTitle: "부산의 바다 경험을<br><em>직접 운영하세요.</em>",
      heroDescription: "상품을 등록하고 예약 고객에게 전자계약서를 발송하는 판매자 전용 공간입니다.",
      heroFlowLabel: "판매자 업무 순서",
      flowCreate: "상품 작성",
      flowCreateDetail: "판매할 경험 등록",
      flowCustomer: "고객 확인",
      flowCustomerDetail: "예약 정보 입력",
      flowContract: "계약 발송",
      flowContractDetail: "전자계약 이메일 전송",
      signInTitle: "판매자 센터 로그인",
      signInDescription: "승인된 판매자 계정으로 로그인하거나, 사업자 정보를 입력해 새 판매자 계정을 등록할 수 있습니다.",
      loginTab: "판매자 로그인",
      registerTab: "판매자 등록",
      accountId: "아이디",
      email: "이메일",
      password: "비밀번호",
      passwordConfirm: "비밀번호 확인",
      businessName: "업체명",
      representativeName: "대표자명",
      businessNumber: "사업자등록번호",
      contact: "연락처",
      loginSubmit: "판매자 센터 시작 →",
      sellerTerms: "입력한 사업자 정보가 정확하며 판매자 운영 정책에 동의합니다.",
      registerSubmit: "판매자 등록 완료 →",
      registerHelp: "기존 구매자 계정을 전환하려면 같은 이메일·아이디·비밀번호를 입력해 주세요.",
      editorHeading: "새 판매 상품 작성",
      editorDescription: "상품 정보를 단계별로 작성합니다. 마지막 단계에서 약관과 안전 안내를 자세히 입력할 수 있습니다.",
      editorAccount: "계정 확인 중",
    },
    en: {
      sellerTitle: "WAVEON PARTNER | Seller portal",
      editorTitle: "Create product | WAVEON PARTNER",
      languageLabel: "Select language",
      sellerBrandLabel: "WAVEON Seller portal home",
      sellerNavLabel: "Seller menu",
      editorNavLabel: "Product creation menu",
      navProducts: "Products",
      navContracts: "E-contracts",
      buyerPage: "Buyer page",
      sellerHome: "Back to seller portal",
      heroTitle: "Run Busan sea experiences<br><em>your way.</em>",
      heroDescription: "A dedicated workspace to publish experiences and send e-contracts to booked guests.",
      heroFlowLabel: "Seller workflow",
      flowCreate: "Create products",
      flowCreateDetail: "Publish an experience",
      flowCustomer: "Review guests",
      flowCustomerDetail: "Check reservation details",
      flowContract: "Send contracts",
      flowContractDetail: "Send e-contract emails",
      signInTitle: "Seller portal sign in",
      signInDescription: "Sign in with an approved seller account, or register a new seller account with your business details.",
      loginTab: "Seller sign in",
      registerTab: "Register seller",
      accountId: "User ID",
      email: "Email",
      password: "Password",
      passwordConfirm: "Confirm password",
      businessName: "Business name",
      representativeName: "Representative name",
      businessNumber: "Business registration number",
      contact: "Contact number",
      loginSubmit: "Open seller portal →",
      sellerTerms: "I confirm that the business details are accurate and agree to the seller operating policy.",
      registerSubmit: "Complete seller registration →",
      registerHelp: "To switch an existing buyer account, enter the same email, user ID, and password.",
      editorHeading: "Create a new product",
      editorDescription: "Complete the product information step by step. Terms and safety guidance can be added in the final step.",
      editorAccount: "Checking account",
    },
    ja: {
      sellerTitle: "WAVEON PARTNER | 出店者センター",
      editorTitle: "新規商品を作成 | WAVEON PARTNER",
      languageLabel: "言語を選択",
      sellerBrandLabel: "WAVEON 出店者センターホーム",
      sellerNavLabel: "出店者メニュー",
      editorNavLabel: "商品作成メニュー",
      navProducts: "商品管理",
      navContracts: "電子契約",
      buyerPage: "購入者ページ",
      sellerHome: "出店者センターに戻る",
      heroTitle: "釜山の海の体験を<br><em>あなたの手で運営しましょう。</em>",
      heroDescription: "体験商品を登録し、予約したお客様へ電子契約書を送信する出店者専用スペースです。",
      heroFlowLabel: "出店者の業務フロー",
      flowCreate: "商品を作成",
      flowCreateDetail: "販売する体験を登録",
      flowCustomer: "お客様を確認",
      flowCustomerDetail: "予約情報を確認",
      flowContract: "契約書を送信",
      flowContractDetail: "電子契約メールを送信",
      signInTitle: "出店者センターにログイン",
      signInDescription: "承認済みの出店者アカウントでログインするか、事業者情報を入力して新しい出店者アカウントを登録できます。",
      loginTab: "出店者ログイン",
      registerTab: "出店者登録",
      accountId: "ユーザーID",
      email: "メールアドレス",
      password: "パスワード",
      passwordConfirm: "パスワードを確認",
      businessName: "事業者名",
      representativeName: "代表者名",
      businessNumber: "事業者登録番号",
      contact: "連絡先",
      loginSubmit: "出店者センターを開く →",
      sellerTerms: "入力した事業者情報が正確であり、出店者運営ポリシーに同意します。",
      registerSubmit: "出店者登録を完了 →",
      registerHelp: "既存の購入者アカウントを切り替えるには、同じメールアドレス、ユーザーID、パスワードを入力してください。",
      editorHeading: "新しい商品を作成",
      editorDescription: "商品情報をステップごとに入力します。最後のステップで約款と安全案内を詳しく設定できます。",
      editorAccount: "アカウントを確認中",
    },
    zh: {
      sellerTitle: "WAVEON PARTNER | 商家中心",
      editorTitle: "创建新商品 | WAVEON PARTNER",
      languageLabel: "选择语言",
      sellerBrandLabel: "WAVEON 商家中心首页",
      sellerNavLabel: "商家菜单",
      editorNavLabel: "商品创建菜单",
      navProducts: "商品管理",
      navContracts: "电子合同",
      buyerPage: "买家页面",
      sellerHome: "返回商家中心",
      heroTitle: "亲自运营釜山的<br><em>海洋体验。</em>",
      heroDescription: "商家专属空间，可发布体验商品并向已预约的顾客发送电子合同。",
      heroFlowLabel: "商家工作流程",
      flowCreate: "创建商品",
      flowCreateDetail: "发布体验项目",
      flowCustomer: "确认顾客",
      flowCustomerDetail: "查看预约信息",
      flowContract: "发送合同",
      flowContractDetail: "发送电子合同邮件",
      signInTitle: "登录商家中心",
      signInDescription: "使用已获批准的商家账号登录，或填写企业信息注册新的商家账号。",
      loginTab: "商家登录",
      registerTab: "注册商家",
      accountId: "用户 ID",
      email: "电子邮箱",
      password: "密码",
      passwordConfirm: "确认密码",
      businessName: "商家名称",
      representativeName: "负责人姓名",
      businessNumber: "营业执照号码",
      contact: "联系方式",
      loginSubmit: "进入商家中心 →",
      sellerTerms: "我确认填写的商家信息准确，并同意商家运营政策。",
      registerSubmit: "完成商家注册 →",
      registerHelp: "如需切换已有买家账号，请填写相同的邮箱、用户 ID 和密码。",
      editorHeading: "创建新商品",
      editorDescription: "请分步骤填写商品信息。最后一步可详细添加条款与安全说明。",
      editorAccount: "正在确认账号",
    },
  };
  const errorCopy = {
    SELLER_ACCOUNT_REQUIRED: {
      ko: "판매자로 등록된 계정만 판매자 센터를 이용할 수 있습니다.",
      en: "Only accounts registered as sellers can use the seller portal.",
      ja: "出店者として登録されたアカウントのみ出店者センターを利用できます。",
      zh: "仅已注册为商家的账号可以使用商家中心。",
    },
  };

  function getSavedLocale() {
    try {
      const locale = window.localStorage.getItem("waveon-locale");
      return supportedLocales.has(locale) ? locale : "ko";
    } catch {
      return "ko";
    }
  }

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  }

  function applyLocale(locale) {
    const localeCopy = copy[locale] ?? copy.ko;
    const isProductEditor = Boolean(document.querySelector(".product-editor-page"));

    document.documentElement.lang = locale === "zh" ? "zh-CN" : locale;
    document.title = isProductEditor ? localeCopy.editorTitle : localeCopy.sellerTitle;

    document.querySelectorAll(".seller-language-switcher").forEach((switcher) => {
      switcher.setAttribute("aria-label", localeCopy.languageLabel);
    });
    document.querySelectorAll("[data-seller-locale]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.sellerLocale === locale));
    });
    document.querySelectorAll(".form-error[data-error-code]").forEach((element) => {
      const message = errorCopy[element.dataset.errorCode]?.[locale];
      if (message) element.textContent = message;
    });

    const brand = document.querySelector(".seller-brand");
    if (brand) brand.setAttribute("aria-label", localeCopy.sellerBrandLabel);

    const nav = document.querySelector(".seller-header nav");
    if (nav) nav.setAttribute("aria-label", isProductEditor ? localeCopy.editorNavLabel : localeCopy.sellerNavLabel);

    setText(".seller-header nav a[href='#products']", localeCopy.navProducts);
    setText(".seller-header nav a[href='#contracts']", localeCopy.navContracts);
    setText(".seller-header .buyer-link[href='/']", localeCopy.buyerPage);
    setText(".seller-header .buyer-link[href='/seller']", localeCopy.sellerHome);

    const heroTitle = document.querySelector(".seller-hero-copy h1");
    if (heroTitle) heroTitle.innerHTML = localeCopy.heroTitle;
    setText(".seller-hero-copy > p:not(.eyebrow)", localeCopy.heroDescription);
    const heroFlow = document.querySelector(".hero-flow");
    if (heroFlow) heroFlow.setAttribute("aria-label", localeCopy.heroFlowLabel);
    setText(".hero-flow div:nth-child(1) strong", localeCopy.flowCreate);
    setText(".hero-flow div:nth-child(1) small", localeCopy.flowCreateDetail);
    setText(".hero-flow div:nth-child(2) strong", localeCopy.flowCustomer);
    setText(".hero-flow div:nth-child(2) small", localeCopy.flowCustomerDetail);
    setText(".hero-flow div:nth-child(3) strong", localeCopy.flowContract);
    setText(".hero-flow div:nth-child(3) small", localeCopy.flowContractDetail);
    setText(".seller-auth-copy h2", localeCopy.signInTitle);
    setText(".seller-auth-copy > p:not(.eyebrow)", localeCopy.signInDescription);
    setText("[data-seller-auth-mode='login']", localeCopy.loginTab);
    setText("[data-seller-auth-mode='register']", localeCopy.registerTab);
    setText("#seller-login-form label:nth-child(1) > span", localeCopy.accountId);
    setText("#seller-login-form label:nth-child(2) > span", localeCopy.password);
    setText("#seller-login-form button[type='submit']", localeCopy.loginSubmit);
    setText("#seller-register-form label:nth-child(1) > span", localeCopy.email);
    setText("#seller-register-form label:nth-child(2) > span", localeCopy.accountId);
    setText("#seller-register-form label:nth-child(3) > span", localeCopy.password);
    setText("#seller-register-form label:nth-child(4) > span", localeCopy.passwordConfirm);
    setText("#seller-register-form label:nth-child(5) > span", localeCopy.businessName);
    setText("#seller-register-form label:nth-child(6) > span", localeCopy.representativeName);
    setText("#seller-register-form label:nth-child(7) > span", localeCopy.businessNumber);
    setText("#seller-register-form label:nth-child(8) > span", localeCopy.contact);
    setText(".seller-terms > span", localeCopy.sellerTerms);
    setText("#seller-register-form button[type='submit']", localeCopy.registerSubmit);
    setText(".seller-register-help", localeCopy.registerHelp);
    setText("#editor-title", localeCopy.editorHeading);
    setText("#editor-description", localeCopy.editorDescription);
    setText("#editor-account", localeCopy.editorAccount);
  }

  let activeLocale = getSavedLocale();
  window.SellerLocale = {
    getErrorMessage(code, fallback) {
      return errorCopy[code]?.[activeLocale] ?? fallback;
    },
  };
  applyLocale(activeLocale);

  document.querySelectorAll("[data-seller-locale]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextLocale = button.dataset.sellerLocale;
      if (!supportedLocales.has(nextLocale) || nextLocale === activeLocale) return;

      activeLocale = nextLocale;
      try {
        window.localStorage.setItem("waveon-locale", activeLocale);
      } catch {
        // Storage can be unavailable in private browsing; the current page still switches language.
      }
      applyLocale(activeLocale);
    });
  });
})();
