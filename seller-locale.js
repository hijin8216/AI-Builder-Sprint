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
      incomingReservations: "들어온 예약",
      incomingReservationsGuide: "구매자가 예약한 이름, 이메일, 날짜와 인원을 자동으로 불러옵니다.",
      reservationsEmptyTitle: "아직 들어온 예약이 없습니다.",
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
      incomingReservations: "Incoming reservations",
      incomingReservationsGuide: "The buyer's name, email, date, and guest count are added automatically.",
      reservationsEmptyTitle: "No reservations have arrived yet.",
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
      incomingReservations: "受信した予約",
      incomingReservationsGuide: "購入者の氏名、メールアドレス、日付、人数を自動で読み込みます。",
      reservationsEmptyTitle: "まだ届いた予約はありません。",
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
      incomingReservations: "收到的预约",
      incomingReservationsGuide: "买家的姓名、邮箱、日期和人数会自动导入。",
      reservationsEmptyTitle: "暂时没有收到预约。",
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
    setText(".seller-account > div:first-child > span", localeCopy.sellerDemoAccount);
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
    setText("#editor-title", localeCopy.editorHeading);
    setText("#editor-description", localeCopy.editorDescription);
    setText("#editor-account", localeCopy.editorAccount);
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
