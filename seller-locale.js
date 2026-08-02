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
      sellerDemoAccount: "판매자 데모 계정",
      eContractConfigured: "전자계약 연동 완료",
      eContractSetupRequired: "전자계약 연동 설정 필요",
      settings: "설정",
      settingsClose: "설정 닫기",
      language: "언어",
      logout: "로그아웃",
      registeredProducts: "등록 상품",
      contractsSent: "계약 발송",
      completedSignatures: "서명 완료",
      productUnit: "개",
      contractUnit: "건",
      productCount: (count) => `${count}개`,
      contractCount: (count) => `${count}건`,
      productManagement: "판매 상품 관리",
      createProduct: "새 상품 작성 →",
      myProducts: "내 판매 상품",
      productsEmptyTitle: "아직 등록한 상품이 없습니다.",
      productsEmptyDescription: "위 양식을 작성하면 구매자에게 보여 줄 상품 초안이 저장됩니다.",
      contractsDesk: "새 예약과 계약서 발송",
      contractsDeskDescription: "구매자가 예약하면 정보가 자동으로 도착합니다.",
      incomingReservations: "내 예약",
      incomingReservationsGuide: "구매자가 예약한 이름, 이메일, 날짜와 인원을 자동으로 불러옵니다.",
      reservationsEmptyTitle: "아직 예약된 상품이 없습니다.",
      reservationsEmptyDescription: "등록한 상품을 구매자가 예약하면 여기에 자동으로 표시됩니다.",
      contractHistory: "계약 발송 현황",
      refreshList: "목록 새로고침",
      contractsEmptyTitle: "아직 발송한 계약서가 없습니다.",
      contractsEmptyDescription: "들어온 예약에서 계약서 발송을 누르면 여기에 기록됩니다.",
      productEdit: "상품 수정",
      productDelete: "상품 삭제",
      productDeleting: "삭제 중",
      productDeleted: "판매 상품을 삭제했습니다.",
      productDeleteConfirm: (title) => `${title} 상품을 삭제할까요?\n삭제하면 구매자 화면의 상품 목록에서도 보이지 않습니다.`,
      productPhoto: "대표 사진",
      priceWithCurrency: (value) => `${value}원`,
      minutes: (value) => `${value}분`,
      difficulty: (value) => `${value}단계 난이도`,
      maxParticipants: (value) => `최대 ${value}명`,
      newReservation: "새 예약",
      sendContract: "계약서 발송",
      usageDate: "이용일",
      reservationDate: "예약일",
      people: (value) => `${value}명`,
      minorReservation: "미성년자 예약",
      resend: "다시 발송",
      checkStatus: "상태 확인",
      statusCompleted: "서명 완료",
      statusSendFailed: "발송 실패",
      statusSending: "발송 중",
      statusDraft: "작성 중",
      statusScheduled: "발송 예정",
      statusProcessing: "처리 중",
      statusWaiting: "서명 대기",
      statusSent: "서명 요청 발송",
      statusUnknown: "상태 확인 필요",
      overviewRefreshed: "판매자 정보를 새로 불러왔습니다.",
      reservationNotification: "예약 알림",
      reservationNotificationLabel: (count) => `확인할 예약 알림 ${count}건`,
      reservationAttention: "확인할 예약이 있습니다.",
      reservationAttentionDescription: "새 예약과 취소 요청을 들어온 예약에서 확인하세요.",
      reservationAttentionAction: "예약 확인하기 →",
      newReservationCount: (count) => `새 예약 ${count}건`,
      cancellationRequestCount: (count) => `취소 요청 ${count}건`,
      cancellationNoticeCount: (count) => `취소 알림 ${count}건`,
      buyerCancellationRequested: "구매자가 예약 취소를 요청했습니다. 예약 정보를 확인해 주세요.",
      buyerCancelledReservation: "구매자가 예약을 취소했습니다.",
      sellerCancelledReservation: "판매자가 취소한 예약이며 구매자에게 알림을 보냈습니다.",
      cancelRequest: "취소 요청",
      sellerCancelled: "판매자 취소",
      approveCancellation: "취소 요청 승인",
      cancelReservation: "예약 취소",
      confirmAndRemove: "확인 후 목록에서 제거",
      cancellationConfirmed: "확인한 취소 예약을 목록에서 정리했습니다.",
      cancellationCompleted: "예약을 취소하고 구매자에게 알림을 보냈습니다.",
      cancellationConfirm: (name, activity) => `${name}님의 ${activity} 예약을 취소할까요?\n진행 중인 전자서명은 이 서비스에서 중단되고 구매자에게 취소 알림이 표시됩니다.`,
      cancelling: "취소 처리 중…",
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
      sellerDemoAccount: "Seller demo account",
      eContractConfigured: "E-contract integration ready",
      eContractSetupRequired: "E-contract setup required",
      settings: "Settings",
      settingsClose: "Close settings",
      language: "Language",
      logout: "Log out",
      registeredProducts: "Published products",
      contractsSent: "Contracts sent",
      completedSignatures: "Completed signatures",
      productUnit: "items",
      contractUnit: "contracts",
      productCount: (count) => `${count} product${count === 1 ? "" : "s"}`,
      contractCount: (count) => `${count} contract${count === 1 ? "" : "s"}`,
      productManagement: "Product management",
      createProduct: "Create product →",
      myProducts: "My products",
      productsEmptyTitle: "No products have been published yet.",
      productsEmptyDescription: "Create a product to save a draft that buyers can see.",
      contractsDesk: "New reservations and contracts",
      contractsDeskDescription: "Reservation details arrive here automatically after a buyer books.",
      incomingReservations: "My reservations",
      incomingReservationsGuide: "The buyer's name, email, date, and guest count are added automatically.",
      reservationsEmptyTitle: "There are no reserved products yet.",
      reservationsEmptyDescription: "Reservations for published products will appear here automatically.",
      contractHistory: "Contract delivery status",
      refreshList: "Refresh list",
      contractsEmptyTitle: "No contracts have been sent yet.",
      contractsEmptyDescription: "A record will appear here after you send a contract for an incoming reservation.",
      productEdit: "Edit product",
      productDelete: "Delete product",
      productDeleting: "Deleting",
      productDeleted: "The product was deleted.",
      productDeleteConfirm: (title) => `Delete ${title}?\nAfter deletion, buyers will no longer see this product in the product list.`,
      productPhoto: "Main image",
      priceWithCurrency: (value) => `KRW ${value}`,
      minutes: (value) => `${value} min`,
      difficulty: (value) => `Level ${value}`,
      maxParticipants: (value) => `Up to ${value} guests`,
      newReservation: "New reservation",
      sendContract: "Send contract",
      usageDate: "Date of use",
      reservationDate: "Reservation date",
      people: (value) => `${value} guests`,
      minorReservation: "Minor booking guest",
      resend: "Resend",
      checkStatus: "Check status",
      statusCompleted: "Signed",
      statusSendFailed: "Send failed",
      statusSending: "Sending",
      statusDraft: "Draft",
      statusScheduled: "Scheduled",
      statusProcessing: "Processing",
      statusWaiting: "Awaiting signature",
      statusSent: "Signature request sent",
      statusUnknown: "Status needs checking",
      overviewRefreshed: "Seller information has been refreshed.",
      reservationNotification: "Reservation alerts",
      reservationNotificationLabel: (count) => `${count} reservation alert${count === 1 ? "" : "s"} to review`,
      reservationAttention: "Reservations need your attention.",
      reservationAttentionDescription: "Review new reservations and cancellation requests in the incoming reservations list.",
      reservationAttentionAction: "Review reservations →",
      newReservationCount: (count) => `${count} new reservation${count === 1 ? "" : "s"}`,
      cancellationRequestCount: (count) => `${count} cancellation request${count === 1 ? "" : "s"}`,
      cancellationNoticeCount: (count) => `${count} cancellation notice${count === 1 ? "" : "s"}`,
      buyerCancellationRequested: "The buyer requested to cancel this reservation. Review the reservation details.",
      buyerCancelledReservation: "The buyer cancelled this reservation.",
      sellerCancelledReservation: "You cancelled this reservation and the buyer was notified.",
      cancelRequest: "Cancellation request",
      sellerCancelled: "Cancelled by seller",
      approveCancellation: "Approve cancellation",
      cancelReservation: "Cancel reservation",
      confirmAndRemove: "Confirm and remove",
      cancellationConfirmed: "The cancelled reservation was removed from the list.",
      cancellationCompleted: "The reservation was cancelled and the buyer was notified.",
      cancellationConfirm: (name, activity) => `Cancel ${name}'s ${activity} reservation?\nThe in-progress e-signature will be stopped in this service and the buyer will see a cancellation notice.`,
      cancelling: "Cancelling…",
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
      sellerDemoAccount: "出店者デモアカウント",
      eContractConfigured: "電子契約の連携が完了しました",
      eContractSetupRequired: "電子契約の連携設定が必要です",
      settings: "設定",
      settingsClose: "設定を閉じる",
      language: "言語",
      logout: "ログアウト",
      registeredProducts: "登録商品",
      contractsSent: "契約書送信",
      completedSignatures: "署名完了",
      productUnit: "件",
      contractUnit: "件",
      productCount: (count) => `${count}件`,
      contractCount: (count) => `${count}件`,
      productManagement: "販売商品管理",
      createProduct: "新しい商品を作成 →",
      myProducts: "販売商品",
      productsEmptyTitle: "まだ登録した商品はありません。",
      productsEmptyDescription: "商品を作成すると、購入者に表示する下書きが保存されます。",
      contractsDesk: "新しい予約と契約書の送信",
      contractsDeskDescription: "購入者が予約すると、情報が自動で届きます。",
      incomingReservations: "予約一覧",
      incomingReservationsGuide: "購入者の氏名、メールアドレス、日付、人数を自動で読み込みます。",
      reservationsEmptyTitle: "予約された商品はまだありません。",
      reservationsEmptyDescription: "登録した商品を購入者が予約すると、ここに自動で表示されます。",
      contractHistory: "契約書の送信状況",
      refreshList: "一覧を更新",
      contractsEmptyTitle: "まだ送信した契約書はありません。",
      contractsEmptyDescription: "受信した予約から契約書を送信すると、ここに記録されます。",
      productEdit: "商品を編集",
      productDelete: "商品を削除",
      productDeleting: "削除中",
      productDeleted: "販売商品を削除しました。",
      productDeleteConfirm: (title) => `${title}を削除しますか？\n削除すると、購入者画面の商品一覧にも表示されなくなります。`,
      productPhoto: "メイン画像",
      priceWithCurrency: (value) => `KRW ${value}`,
      minutes: (value) => `${value}分`,
      difficulty: (value) => `難易度 ${value}`,
      maxParticipants: (value) => `最大${value}名`,
      newReservation: "新しい予約",
      sendContract: "契約書を送信",
      usageDate: "利用日",
      reservationDate: "予約日",
      people: (value) => `${value}名`,
      minorReservation: "未成年者の予約",
      resend: "再送",
      checkStatus: "ステータスを確認",
      statusCompleted: "署名完了",
      statusSendFailed: "送信失敗",
      statusSending: "送信中",
      statusDraft: "作成中",
      statusScheduled: "送信予定",
      statusProcessing: "処理中",
      statusWaiting: "署名待ち",
      statusSent: "署名依頼を送信",
      statusUnknown: "ステータスの確認が必要",
      overviewRefreshed: "出店者情報を更新しました。",
      reservationNotification: "予約通知",
      reservationNotificationLabel: (count) => `確認する予約通知 ${count}件`,
      reservationAttention: "確認が必要な予約があります。",
      reservationAttentionDescription: "受信した予約から新規予約とキャンセル依頼を確認してください。",
      reservationAttentionAction: "予約を確認 →",
      newReservationCount: (count) => `新しい予約 ${count}件`,
      cancellationRequestCount: (count) => `キャンセル依頼 ${count}件`,
      cancellationNoticeCount: (count) => `キャンセル通知 ${count}件`,
      buyerCancellationRequested: "購入者が予約のキャンセルを依頼しました。予約情報を確認してください。",
      buyerCancelledReservation: "購入者が予約をキャンセルしました。",
      sellerCancelledReservation: "この予約をキャンセルし、購入者に通知しました。",
      cancelRequest: "キャンセル依頼",
      sellerCancelled: "出店者がキャンセル",
      approveCancellation: "キャンセルを承認",
      cancelReservation: "予約をキャンセル",
      confirmAndRemove: "確認して一覧から削除",
      cancellationConfirmed: "確認済みのキャンセル予約を一覧から整理しました。",
      cancellationCompleted: "予約をキャンセルし、購入者に通知しました。",
      cancellationConfirm: (name, activity) => `${name}様の${activity}予約をキャンセルしますか？\n進行中の電子署名はこのサービス内で停止し、購入者にキャンセル通知を表示します。`,
      cancelling: "キャンセル処理中…",
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
      sellerDemoAccount: "商家演示账号",
      eContractConfigured: "电子合同集成已完成",
      eContractSetupRequired: "需要配置电子合同集成",
      settings: "设置",
      settingsClose: "关闭设置",
      language: "语言",
      logout: "退出登录",
      registeredProducts: "已发布商品",
      contractsSent: "已发送合同",
      completedSignatures: "已完成签署",
      productUnit: "个",
      contractUnit: "份",
      productCount: (count) => `${count}个商品`,
      contractCount: (count) => `${count}份合同`,
      productManagement: "商品管理",
      createProduct: "创建新商品 →",
      myProducts: "我的商品",
      productsEmptyTitle: "尚未发布商品。",
      productsEmptyDescription: "创建商品后，将保存可向买家展示的商品草稿。",
      contractsDesk: "新预约与合同发送",
      contractsDeskDescription: "买家预约后，信息会自动发送到这里。",
      incomingReservations: "我的预约",
      incomingReservationsGuide: "买家的姓名、邮箱、日期和人数会自动导入。",
      reservationsEmptyTitle: "暂时没有已预约的商品。",
      reservationsEmptyDescription: "买家预约已发布商品后，会自动显示在这里。",
      contractHistory: "合同发送状态",
      refreshList: "刷新列表",
      contractsEmptyTitle: "暂未发送合同。",
      contractsEmptyDescription: "从收到的预约中发送合同后，记录会显示在这里。",
      productEdit: "编辑商品",
      productDelete: "删除商品",
      productDeleting: "删除中",
      productDeleted: "已删除销售商品。",
      productDeleteConfirm: (title) => `要删除 ${title} 吗？\n删除后，买家页面的商品列表中也不会再显示。`,
      productPhoto: "主图",
      priceWithCurrency: (value) => `KRW ${value}`,
      minutes: (value) => `${value} 分钟`,
      difficulty: (value) => `难度 ${value}`,
      maxParticipants: (value) => `最多 ${value} 人`,
      newReservation: "新预约",
      sendContract: "发送合同",
      usageDate: "使用日期",
      reservationDate: "预约日期",
      people: (value) => `${value} 人`,
      minorReservation: "未成年人预约",
      resend: "重新发送",
      checkStatus: "查看状态",
      statusCompleted: "签署完成",
      statusSendFailed: "发送失败",
      statusSending: "正在发送",
      statusDraft: "草稿",
      statusScheduled: "计划发送",
      statusProcessing: "处理中",
      statusWaiting: "等待签署",
      statusSent: "已发送签署请求",
      statusUnknown: "需要确认状态",
      overviewRefreshed: "商家信息已刷新。",
      reservationNotification: "预约提醒",
      reservationNotificationLabel: (count) => `有 ${count} 条预约提醒待处理`,
      reservationAttention: "有预约需要处理。",
      reservationAttentionDescription: "请在收到的预约中查看新预约和取消请求。",
      reservationAttentionAction: "查看预约 →",
      newReservationCount: (count) => `${count} 个新预约`,
      cancellationRequestCount: (count) => `${count} 个取消请求`,
      cancellationNoticeCount: (count) => `${count} 条取消提醒`,
      buyerCancellationRequested: "买家申请取消该预约。请查看预约信息。",
      buyerCancelledReservation: "买家已取消该预约。",
      sellerCancelledReservation: "您已取消该预约，并已通知买家。",
      cancelRequest: "取消请求",
      sellerCancelled: "商家已取消",
      approveCancellation: "同意取消",
      cancelReservation: "取消预约",
      confirmAndRemove: "确认并移除",
      cancellationConfirmed: "已从列表中整理确认过的取消预约。",
      cancellationCompleted: "预约已取消，已通知买家。",
      cancellationConfirm: (name, activity) => `要取消 ${name} 的${activity}预约吗？\n进行中的电子签名将在本服务中停止，并向买家显示取消通知。`,
      cancelling: "正在取消…",
      editorHeading: "创建新商品",
      editorDescription: "请分步骤填写商品信息。最后一步可详细添加条款与安全说明。",
      editorAccount: "正在确认账号",
    },
  };
  const productEditorCopy = {
    ko: {
      newHeading: "새 판매 상품 작성",
      editHeading: "판매 상품 수정",
      newDescription: "항목을 네 단계로 나눠 작성합니다. 마지막 단계에서 약관과 안전 안내를 자세히 입력할 수 있습니다.",
      editDescription: "기존 상품 정보를 단계별로 확인하고 필요한 부분만 수정해 저장하세요.",
      steps: ["기본 정보", "사진·체험", "운영 정보", "약관·안전"],
      legends: ["기본 상품 정보", "사진과 체험 특성", "운영 정보", "약관과 안전 정보"],
      fields: { title: "상품명", partnerName: "업체명", category: "카테고리", region: "지역", location: "상세 위치", pricePerPerson: "1인 가격", durationMinutes: "이용 시간(분)", minAge: "최소 이용 나이", maxParticipants: "최대 인원", description: "상품 소개", difficulty: "난이도", thrillLevel: "스릴 정도", physicalIntensity: "활동 강도", swimmingRequired: "수영 필요 여부", moods: "분위기·검색 태그", timeSlots: "운영 시간대", weatherDependency: "날씨 영향", included: "포함 사항", refundPolicy: "환불·취소 정책", termsAndConditions: "상품 이용 약관", participantRequirements: "참가 조건·제한 사항", safetyNotes: "안전 주의사항" },
      category: { "": "선택", "요트": "요트", "크루즈": "크루즈", "서핑": "서핑", "바디보드": "바디보드", "다이빙": "다이빙", "스노클링": "스노클링", "프리다이빙": "프리다이빙", SUP: "SUP", "카약": "카약", "낚시": "낚시", "제트스키": "제트스키", "바나나보트": "바나나보트", "웨이크보드": "웨이크보드", "기타": "기타" },
      region: { "": "선택", "해운대": "해운대", "광안리": "광안리", "송정": "송정", "기장": "기장", "다대포": "다대포", "영도": "영도", "송도": "송도", "남구": "남구" },
      difficulty: ["1 · 매우 쉬움", "2 · 쉬움", "3 · 보통", "4 · 어려움", "5 · 전문가"],
      thrill: ["1 · 잔잔함", "2 · 가벼움", "3 · 보통", "4 · 짜릿함", "5 · 매우 짜릿함"],
      intensity: ["1 · 휴식형", "2 · 가벼운 활동", "3 · 보통", "4 · 높은 활동", "5 · 매우 높음"],
      swimming: ["수영을 못해도 가능", "수영 가능자만 참여"],
      weather: ["낮음", "보통", "높음"],
      thumbnail: ["대표 썸네일", "상품 목록에 보일 사진", "JPG, PNG, WEBP · 최대 5MB"],
      details: ["상세 사진", "상품 설명용 사진 여러 장", "최대 6장"],
      preview: "선택한 사진이 여기에 미리 표시됩니다.",
      recommendedFor: "추천 대상", moodsHelp: "쉼표로 구분해 주세요.", availableDays: "이용 가능 요일", timeSlotsHelp: "쉼표로 구분", supportedLanguages: "지원 언어", lineHelp: "한 줄에 한 항목씩 입력해 주세요.",
      audience: ["혼자", "친구", "연인", "가족"], days: ["월", "화", "수", "목", "금", "토", "일"], languages: ["한국어", "영어", "일본어", "중국어"],
      termsTitle: "구매자가 예약 전에 확인해야 하는 내용을 구체적으로 적어주세요.", termsDescription: "환불, 기상 취소, 안전 책임, 이용 제한 사항을 빠뜨리지 않는 것이 좋습니다.", waiverTitle: "전자서명 동의서가 필요한 상품입니다.", waiverDescription: "예약 고객에게 전자계약서를 발송합니다.",
      previous: "← 이전", cancel: "취소", next: "다음 단계", create: "상품 등록 완료", save: "수정 내용 저장",
      placeholders: { title: "광안리 선셋 요트 투어", partnerName: "웨이브온 마린", location: "수영만 요트경기장", description: "고객이 경험할 내용과 상품의 특징을 소개해 주세요.", moods: "노을, 사진, 휴식, 기념일", timeSlots: "09:00, 11:30, 14:30", included: "구명조끼\n웰컴 음료\n사진 촬영", refundPolicy: "이용 3일 전까지 전액 환불, 2일 전 70%, 당일 환불 불가", termsAndConditions: "기상 악화 시 일정 변경 기준, 지각·노쇼 처리, 장비 파손 책임, 이용 중 준수사항 등을 자세히 입력해 주세요.", participantRequirements: "임산부 또는 특정 질환이 있는 이용자는 참여가 제한될 수 있습니다.\n미성년자는 보호자 동의가 필요합니다.", safetyNotes: "강풍 또는 풍랑특보 시 일정이 변경될 수 있습니다.\n현장 안전요원의 안내를 따라야 합니다." },
    },
    en: {
      newHeading: "Create a new experience", editHeading: "Edit experience", newDescription: "Add your product details in four steps. Terms and safety information are completed in the final step.", editDescription: "Review the existing product in four steps and save only the changes you need.",
      steps: ["Basics", "Photos & experience", "Operations", "Terms & safety"], legends: ["Basic product details", "Photos and experience details", "Operations", "Terms and safety"],
      fields: { title: "Product name", partnerName: "Business name", category: "Category", region: "Area", location: "Specific location", pricePerPerson: "Price per guest (KRW)", durationMinutes: "Duration (minutes)", minAge: "Minimum age", maxParticipants: "Maximum guests", description: "Product description", difficulty: "Difficulty", thrillLevel: "Thrill level", physicalIntensity: "Activity intensity", swimmingRequired: "Swimming requirement", moods: "Mood and search tags", timeSlots: "Operating times", weatherDependency: "Weather sensitivity", included: "What's included", refundPolicy: "Refund and cancellation policy", termsAndConditions: "Terms of use", participantRequirements: "Participation requirements", safetyNotes: "Safety notes" },
      category: { "": "Select", "요트": "Yacht", "크루즈": "Cruise", "서핑": "Surfing", "바디보드": "Bodyboarding", "다이빙": "Diving", "스노클링": "Snorkeling", "프리다이빙": "Freediving", SUP: "SUP", "카약": "Kayak", "낚시": "Fishing", "제트스키": "Jet ski", "바나나보트": "Banana boat", "웨이크보드": "Wakeboarding", "기타": "Other" },
      region: { "": "Select", "해운대": "Haeundae", "광안리": "Gwangalli", "송정": "Songjeong", "기장": "Gijang", "다대포": "Dadaepo", "영도": "Yeongdo", "송도": "Songdo", "남구": "Nam-gu" },
      difficulty: ["1 · Very easy", "2 · Easy", "3 · Moderate", "4 · Challenging", "5 · Expert"], thrill: ["1 · Calm", "2 · Light", "3 · Moderate", "4 · Exciting", "5 · Very exciting"], intensity: ["1 · Restful", "2 · Light activity", "3 · Moderate", "4 · Active", "5 · Very active"], swimming: ["No swimming required", "Swimmers only"], weather: ["Low", "Medium", "High"],
      thumbnail: ["Cover image", "Shown in the product list", "JPG, PNG, WEBP · up to 5 MB"], details: ["Detail images", "Photos for the product story", "Up to 6 photos"], preview: "Selected photos appear here.", recommendedFor: "Recommended for", moodsHelp: "Separate tags with commas.", availableDays: "Available days", timeSlotsHelp: "Separate times with commas", supportedLanguages: "Supported languages", lineHelp: "Enter one item per line.", audience: ["Solo", "Friends", "Couples", "Families"], days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], languages: ["Korean", "English", "Japanese", "Chinese"],
      termsTitle: "Add the details buyers should review before booking.", termsDescription: "Include refunds, weather cancellations, safety responsibilities, and participation limits.", waiverTitle: "This product requires an electronic consent form.", waiverDescription: "An electronic contract will be sent to each booking customer.", previous: "← Previous", cancel: "Cancel", next: "Next step", create: "Publish product", save: "Save changes",
      placeholders: { title: "Gwangalli Sunset Yacht Tour", partnerName: "Waveon Marine", location: "Suyeong Bay Yacht Marina", description: "Describe the experience and the product's highlights.", moods: "sunset, photos, relaxation, anniversary", timeSlots: "09:00, 11:30, 14:30", included: "Life jacket\nWelcome drink\nPhoto session", refundPolicy: "Full refund until three days before use, 70% until two days before, no refund on the day", termsAndConditions: "Describe weather rescheduling, late arrival and no-show rules, equipment damage responsibility, and rules during the experience.", participantRequirements: "Guests who are pregnant or have certain medical conditions may be unable to participate.\nMinors need guardian consent.", safetyNotes: "The schedule may change in strong wind or high-wave advisories.\nFollow the on-site safety staff's instructions." },
    },
    ja: {
      newHeading: "新しい体験を登録", editHeading: "体験を編集", newDescription: "商品情報を4段階で入力します。最後の段階で規約と安全案内を詳しく追加できます。", editDescription: "既存の商品情報を4段階で確認し、必要な内容だけ保存してください。", steps: ["基本情報", "写真・体験", "運営情報", "規約・安全"], legends: ["基本商品情報", "写真と体験の特徴", "運営情報", "規約と安全情報"],
      fields: { title: "商品名", partnerName: "事業者名", category: "カテゴリー", region: "エリア", location: "詳細場所", pricePerPerson: "1人料金（KRW）", durationMinutes: "所要時間（分）", minAge: "最低年齢", maxParticipants: "最大人数", description: "商品紹介", difficulty: "難易度", thrillLevel: "スリル", physicalIntensity: "運動強度", swimmingRequired: "泳力条件", moods: "雰囲気・検索タグ", timeSlots: "運営時間", weatherDependency: "天候の影響", included: "含まれるもの", refundPolicy: "返金・キャンセル規定", termsAndConditions: "利用規約", participantRequirements: "参加条件・制限", safetyNotes: "安全上の注意" },
      category: { "": "選択", "요트": "ヨット", "크루즈": "クルーズ", "서핑": "サーフィン", "바디보드": "ボディボード", "다이빙": "ダイビング", "스노클링": "シュノーケリング", "프리다이빙": "フリーダイビング", SUP: "SUP", "카약": "カヤック", "낚시": "釣り", "제트스키": "ジェットスキー", "바나나보트": "バナナボート", "웨이크보드": "ウェイクボード", "기타": "その他" }, region: { "": "選択", "해운대": "海雲台", "광안리": "広安里", "송정": "松亭", "기장": "機張", "다대포": "多大浦", "영도": "影島", "송도": "松島", "남구": "南区" },
      difficulty: ["1 · とても簡単", "2 · 簡単", "3 · 普通", "4 · 難しい", "5 · 上級者向け"], thrill: ["1 · 穏やか", "2 · 軽め", "3 · 普通", "4 · スリリング", "5 · とてもスリリング"], intensity: ["1 · 休息型", "2 · 軽い運動", "3 · 普通", "4 · 活動的", "5 · とても活動的"], swimming: ["泳げなくても参加可", "泳げる方のみ"], weather: ["低い", "普通", "高い"], thumbnail: ["メイン画像", "商品一覧に表示", "JPG、PNG、WEBP · 最大5MB"], details: ["詳細写真", "商品説明用の写真", "最大6枚"], preview: "選択した写真がここに表示されます。", recommendedFor: "おすすめの対象", moodsHelp: "カンマで区切ってください。", availableDays: "利用可能な曜日", timeSlotsHelp: "カンマで区切る", supportedLanguages: "対応言語", lineHelp: "1行に1項目ずつ入力してください。", audience: ["一人", "友人", "カップル", "家族"], days: ["月", "火", "水", "木", "金", "土", "日"], languages: ["韓国語", "英語", "日本語", "中国語"], termsTitle: "購入者が予約前に確認すべき内容を具体的に入力してください。", termsDescription: "返金、天候による中止、安全責任、利用制限を含めてください。", waiverTitle: "この商品には電子署名の同意書が必要です。", waiverDescription: "予約したお客様に電子契約書を送信します。", previous: "← 前へ", cancel: "キャンセル", next: "次へ", create: "商品を登録", save: "変更を保存", placeholders: { title: "広安里サンセットヨットツアー", partnerName: "ウェーブオンマリン", location: "水営湾ヨット競技場", description: "お客様が体験する内容と商品の特徴を紹介してください。", moods: "夕日、写真、休息、記念日", timeSlots: "09:00, 11:30, 14:30", included: "ライフジャケット\nウェルカムドリンク\n写真撮影", refundPolicy: "利用3日前まで全額返金、2日前まで70%、当日は返金不可", termsAndConditions: "悪天候時の日程変更、遅刻・無断欠席、機材破損の責任、利用中のルールを詳しく入力してください。", participantRequirements: "妊娠中または特定の疾患がある方は参加できない場合があります。\n未成年者は保護者の同意が必要です。", safetyNotes: "強風または波浪注意報時は日程が変更される場合があります。\n現場の安全スタッフの案内に従ってください。" },
    },
    zh: {
      newHeading: "创建新体验", editHeading: "编辑体验", newDescription: "请分四步填写商品信息。最后一步可补充条款和安全说明。", editDescription: "请分四步检查现有商品信息，只保存需要修改的内容。", steps: ["基本信息", "照片与体验", "运营信息", "条款与安全"], legends: ["基本商品信息", "照片和体验特点", "运营信息", "条款和安全信息"],
      fields: { title: "商品名称", partnerName: "商家名称", category: "类别", region: "地区", location: "详细地点", pricePerPerson: "每人价格（KRW）", durationMinutes: "体验时长（分钟）", minAge: "最低年龄", maxParticipants: "最大人数", description: "商品介绍", difficulty: "难度", thrillLevel: "刺激程度", physicalIntensity: "活动强度", swimmingRequired: "游泳要求", moods: "氛围和搜索标签", timeSlots: "营业时段", weatherDependency: "天气影响", included: "包含项目", refundPolicy: "退款和取消政策", termsAndConditions: "使用条款", participantRequirements: "参与条件和限制", safetyNotes: "安全注意事项" },
      category: { "": "请选择", "요트": "游艇", "크루즈": "游轮", "서핑": "冲浪", "바디보드": "趴板冲浪", "다이빙": "潜水", "스노클링": "浮潜", "프리다이빙": "自由潜水", SUP: "SUP", "카약": "皮划艇", "낚시": "钓鱼", "제트스키": "水上摩托", "바나나보트": "香蕉船", "웨이크보드": "尾波滑水", "기타": "其他" }, region: { "": "请选择", "해운대": "海云台", "광안리": "广安里", "송정": "松亭", "기장": "机张", "다대포": "多大浦", "영도": "影岛", "송도": "松岛", "남구": "南区" },
      difficulty: ["1 · 非常简单", "2 · 简单", "3 · 普通", "4 · 较难", "5 · 专业级"], thrill: ["1 · 平静", "2 · 轻松", "3 · 普通", "4 · 刺激", "5 · 非常刺激"], intensity: ["1 · 休闲型", "2 · 轻度活动", "3 · 普通", "4 · 高强度", "5 · 非常高强度"], swimming: ["不会游泳也可参加", "仅限会游泳者"], weather: ["低", "中", "高"], thumbnail: ["封面图片", "显示在商品列表中", "JPG、PNG、WEBP · 最大5MB"], details: ["详情图片", "用于商品介绍的照片", "最多6张"], preview: "选择的照片会显示在这里。", recommendedFor: "推荐对象", moodsHelp: "请用逗号分隔。", availableDays: "可用日期", timeSlotsHelp: "请用逗号分隔", supportedLanguages: "支持语言", lineHelp: "每行输入一个项目。", audience: ["独自", "朋友", "情侣", "家庭"], days: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"], languages: ["韩语", "英语", "日语", "中文"], termsTitle: "请具体填写购买者在预约前需要确认的内容。", termsDescription: "建议包含退款、天气取消、安全责任和参与限制。", waiverTitle: "该商品需要电子签名同意书。", waiverDescription: "将向预约客户发送电子合同。", previous: "← 上一步", cancel: "取消", next: "下一步", create: "发布商品", save: "保存修改", placeholders: { title: "广安里日落游艇之旅", partnerName: "WAVEON MARINE", location: "水营湾游艇码头", description: "请介绍客户将体验的内容和商品特色。", moods: "日落、拍照、休闲、纪念日", timeSlots: "09:00, 11:30, 14:30", included: "救生衣\n欢迎饮料\n照片拍摄", refundPolicy: "使用日前3天可全额退款，前2天可退70%，当天不可退款", termsAndConditions: "请详细填写恶劣天气改期、迟到和爽约处理、设备损坏责任及体验期间的规则。", participantRequirements: "孕妇或有特定疾病的客户可能无法参加。\n未成年人需要监护人同意。", safetyNotes: "强风或海浪警报时，日程可能会调整。\n请遵从现场安全人员的指引。" },
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

  function setEditorFieldLabel(name, value) {
    const field = document.querySelector(`[name="${name}"]`);
    const label = field?.closest("label")?.querySelector(":scope > span");
    if (label) label.textContent = value;
  }

  function setEditorOptions(name, labels) {
    document.querySelectorAll(`[name="${name}"] option`).forEach((option, index) => {
      const label = Array.isArray(labels) ? labels[index] : labels[option.value];
      if (label) option.textContent = label;
    });
  }

  function setChoiceLabels(selector, labels) {
    document.querySelectorAll(selector).forEach((label, index) => {
      const text = label.matches("span") ? label : label.querySelector("span");
      if (text && labels[index]) text.textContent = labels[index];
    });
  }

  function applyProductEditorLocale(locale, localeCopy) {
    const editor = document.querySelector(".product-editor-page");
    if (!editor) return;

    const editorCopy = productEditorCopy[locale] ?? productEditorCopy.ko;
    const isEditing = editor.dataset.editorMode === "edit";
    setText("#editor-kicker", isEditing ? "EDIT PRODUCT" : "NEW PRODUCT");
    setText("#editor-title", isEditing ? editorCopy.editHeading : editorCopy.newHeading);
    setText("#editor-description", isEditing ? editorCopy.editDescription : editorCopy.newDescription);
    setText("#editor-account", localeCopy.editorAccount);
    const stepsSuffix = locale === "en" ? "steps" : locale === "ja" ? "ステップ" : locale === "zh" ? "步骤" : "단계";
    document.querySelector(".editor-steps")?.setAttribute("aria-label", `${editorCopy.newHeading} ${stepsSuffix}`);
    document.querySelectorAll("[data-step-indicator] strong").forEach((element, index) => {
      element.textContent = editorCopy.steps[index];
    });
    document.querySelectorAll("[data-product-step]").forEach((section, index) => {
      const legend = section.querySelector("legend");
      const number = legend?.querySelector("span");
      if (legend && number) legend.replaceChildren(number, document.createTextNode(` ${editorCopy.legends[index]}`));
    });
    Object.entries(editorCopy.fields).forEach(([name, label]) => setEditorFieldLabel(name, label));
    Object.entries(editorCopy.placeholders).forEach(([name, placeholder]) => {
      const field = document.querySelector(`[name="${name}"]`);
      if (field) field.placeholder = placeholder;
    });
    setEditorOptions("category", editorCopy.category);
    setEditorOptions("region", editorCopy.region);
    setEditorOptions("difficulty", editorCopy.difficulty);
    setEditorOptions("thrillLevel", editorCopy.thrill);
    setEditorOptions("physicalIntensity", editorCopy.intensity);
    setEditorOptions("swimmingRequired", editorCopy.swimming);
    setEditorOptions("weatherDependency", editorCopy.weather);

    const imageBoxes = document.querySelectorAll(".image-upload-box");
    [[...editorCopy.thumbnail], [...editorCopy.details]].forEach((texts, index) => {
      const box = imageBoxes[index];
      if (!box) return;
      setText(`.image-upload-box:nth-of-type(${index + 1}) > span`, texts[0]);
      setText(`.image-upload-box:nth-of-type(${index + 1}) > strong`, texts[1]);
      setText(`.image-upload-box:nth-of-type(${index + 1}) > small`, texts[2]);
    });
    setText("#seller-image-preview p", editorCopy.preview);
    setText("[data-product-step='2'] .input-label", editorCopy.recommendedFor);
    setText("[name='moods'] + .field-help", editorCopy.moodsHelp);
    setChoiceLabels("[name='suitableFor'] ~ span", editorCopy.audience);
    setText("[data-product-step='3'] .input-label", editorCopy.availableDays);
    setChoiceLabels("[name='availableDays'] ~ span", editorCopy.days);
    setText("[name='timeSlots'] + .field-help", editorCopy.timeSlotsHelp);
    const languageGroup = document.querySelector("[name='languages']")?.closest(".wide");
    languageGroup?.querySelector(".input-label") && (languageGroup.querySelector(".input-label").textContent = editorCopy.supportedLanguages);
    setChoiceLabels("[name='languages'] ~ span", editorCopy.languages);
    document.querySelectorAll("[data-product-step='3'] .field-help, [data-product-step='4'] .field-help").forEach((element) => {
      if (element !== document.querySelector("[name='timeSlots'] + .field-help")) element.textContent = editorCopy.lineHelp;
    });
    setText(".terms-editor-intro strong", editorCopy.termsTitle);
    setText(".terms-editor-intro p", editorCopy.termsDescription);
    setText(".waiver-choice strong", editorCopy.waiverTitle);
    setText(".waiver-choice small", editorCopy.waiverDescription);
    setText("#editor-previous", editorCopy.previous);
    setText(".editor-cancel", editorCopy.cancel);
    const next = document.querySelector("#editor-next");
    const submit = document.querySelector("#editor-submit");
    if (next) next.innerHTML = `${editorCopy.next} <span>→</span>`;
    if (submit) submit.innerHTML = `${isEditing ? editorCopy.save : editorCopy.create} <span>→</span>`;
  }

  function applyLocale(locale) {
    const localeCopy = copy[locale] ?? copy.ko;
    const isProductEditor = Boolean(document.querySelector(".product-editor-page"));

    document.documentElement.lang = locale === "zh" ? "zh-CN" : locale;
    document.title = isProductEditor ? localeCopy.editorTitle : localeCopy.sellerTitle;

    document.querySelectorAll(".seller-language-switcher").forEach((switcher) => {
      switcher.setAttribute("aria-label", localeCopy.languageLabel);
    });
    document.querySelectorAll(".seller-settings-language").forEach((switcher) => {
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
    setText(".seller-account > div:first-child > span", localeCopy.sellerDemoAccount);
    setText(".seller-settings-heading strong", localeCopy.settings);
    setText(".seller-settings-language-group > span", localeCopy.language);
    const settingsToggle = document.querySelector("#seller-settings-toggle");
    if (settingsToggle) settingsToggle.setAttribute("aria-label", localeCopy.settings);
    const settingsMenu = document.querySelector("#seller-settings-menu");
    if (settingsMenu) settingsMenu.setAttribute("aria-label", localeCopy.settings);
    const settingsClose = document.querySelector("#seller-settings-close");
    if (settingsClose) settingsClose.setAttribute("aria-label", localeCopy.settingsClose);
    setText("#seller-logout", localeCopy.logout);
    setText("#seller-reservation-notification-label", localeCopy.reservationNotification);
    setText("#seller-reservation-alert-title", localeCopy.reservationAttention);
    setText("#seller-reservation-alert-description", localeCopy.reservationAttentionDescription);
    setText("#seller-reservation-alert-action", localeCopy.reservationAttentionAction);
    setText(".dashboard-stats article:nth-child(1) > span", localeCopy.registeredProducts);
    setText(".dashboard-stats article:nth-child(2) > span", localeCopy.contractsSent);
    setText(".dashboard-stats article:nth-child(3) > span", localeCopy.completedSignatures);
    setText(".dashboard-stats article:nth-child(1) > small", localeCopy.productUnit);
    setText(".dashboard-stats article:nth-child(2) > small", localeCopy.contractUnit);
    setText(".dashboard-stats article:nth-child(3) > small", localeCopy.contractUnit);
    setText("#products .section-heading h2", localeCopy.productManagement);
    setText(".new-product-link", localeCopy.createProduct);
    setText(".post-list-panel .panel-heading h3", localeCopy.myProducts);
    setText("#contracts .section-heading h2", localeCopy.contractsDesk);
    setText("#contracts .section-heading > p", localeCopy.contractsDeskDescription);
    setText("#reservation-inbox-title", localeCopy.incomingReservations);
    setText(".inbox-guide", localeCopy.incomingReservationsGuide);
    setText(".contract-history .panel-heading h3", localeCopy.contractHistory);
    setText("#refresh-overview", localeCopy.refreshList);
    applyProductEditorLocale(locale, localeCopy);
  }

  let activeLocale = getSavedLocale();
  window.SellerLocale = {
    getText(key, ...args) {
      const value = copy[activeLocale]?.[key] ?? copy.ko[key];
      return typeof value === "function" ? value(...args) : value;
    },
    getLocale() {
      return activeLocale;
    },
    applyLocale() {
      applyLocale(activeLocale);
    },
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
      window.dispatchEvent(new CustomEvent("sellerlocalechange"));
    });
  });
})();
