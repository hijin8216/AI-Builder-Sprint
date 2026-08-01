# AI Builder Sprint 2026

> 총 168시간, AI와 함께 만드는 도전

## WAVEON BUSAN

WAVEON BUSAN은 부산 해양레저 상품을 취향과 예산에 맞게 추천하고, 예약 약관의 환불 제한과 불리할 수 있는 조항을 AI로 점검한 뒤 모두싸인 전자서명까지 연결하는 웹서비스입니다.

- 구매자: 상품 탐색, AI 맞춤 추천, 다국어 상세·약관, 예약, 계약 알림, 웹 전자서명, 마이페이지
- 판매자: 상품 등록·수정·삭제, 예약 확인, 계약 발송·재발송, 서명 상태와 취소 관리
- AI: Upstage Solar Pro 3 추천·번역·약관 요약, Upstage Document Parse 실제 계약서 PDF 분석
- 전자서명: 모두싸인 Secure Link 및 웹사이트 내 임베디드 서명

### 심사위원 빠른 실행

Node.js 20 이상이 설치된 환경에서 다음 명령을 실행합니다.

```bash
git clone <제출된-GitHub-저장소-주소>
cd AI-Builder-Sprint
npm install
cp .env.example .env
npm start
```

Windows PowerShell에서는 `cp` 대신 `Copy-Item .env.example .env`를 사용하고, npm 실행 정책 오류가 있으면 `npm.cmd install`, `npm.cmd start`를 사용합니다.

실행 후 다음 주소를 확인합니다.

- 구매자 화면: `http://127.0.0.1:3000`
- 판매자 화면: `http://127.0.0.1:3000/seller`
- 서버 상태: `http://127.0.0.1:3000/api/health`

API 키 없이도 상품 탐색과 로컬 추천·약관 요약을 확인할 수 있습니다. 실제 Solar 분석과 모두싸인 전자서명에는 `.env`에 유효한 인증 정보를 입력해야 합니다. 비밀값은 저장소에 포함하지 않습니다.

설치, 환경변수, 구매자·판매자 전체 시연, 문제 해결 방법은 [심사위원 실행 가이드](docs/JUDGE_GUIDE.md)에 정리되어 있습니다. AI 모델, 프롬프트와 대체 동작은 [AI 사용 기록](docs/AI_USAGE.md)에서 확인할 수 있습니다.

## 대회 소개

**AI Builder Sprint 2026**은 부산대학교 **APPTIVE**가 주최하고, **Upstage**, 부산대학교 **Anchor 사업단** 및 부산대학교 **AI융합교육원**이 후원하는 해커톤입니다. 참가자들은 자유로운 기술 스택을 바탕으로 실제로 동작하는 서비스를 직접 코드로 구현합니다.

| 항목 | 내용 |
| --- | --- |
| 주제 | AI를 통해 인간다움을 더욱 잘 드러낼 수 있는 서비스 개발 |
| 팀 구성 | 2~4인 1팀 |
| 개발 방식 | 코드 기반 앱 개발 필수 (노코드/로우코드 단독 사용 불가) |

### 진행 흐름

1. **팀 단위 참가 신청** — 팀원 정보, 프로젝트 아이디어, 활용 예정 AI 기술·API 제출
2. **참가팀 선발** (20~50팀) — 아이디어 참신성·실현 가능성·AI 활용 계획 기반 서류 심사
3. **예선 개발 기간** (7.27 ~ 8.3, 약 1주일) — API 크레딧 발급, 아이디어 구체화 및 개발
4. **결과물 제출 및 1차 심사** — 데모 영상/배포 링크, 코드 저장소, 발표 자료, AI 활용 증빙 제출
5. **본선 발표 및 질의응답** (8.7) — 팀당 7분 발표 + 5분 Q&A, 심사 후 수상팀 확정

### 기술 스택 및 규칙

- 사용 API·모델은 자유이며, **Upstage API**(Solar LLM, Document Parse, Information Extract) 활용 시 심사 가점
- Claude, GPT, Gemini 등 타사 모델 병행 사용 가능 (제약 없음)
- 프레임워크/언어 자유 (Python, JavaScript, React, Flutter 등)
- 결과물은 데모 가능한 동작하는 앱 (웹앱, 모바일앱, CLI 도구 등 형태 무관)
- 코딩 에이전트(Claude Code, Codex 등) 활용 시 `.claude/`, `AGENTS.md` 등 관련 설정·지침 파일을 저장소에 포함해야 심사에 반영됩니다

### 심사 기준

| 기준 | 배점 |
| --- | --- |
| 창의성 | 20점 |
| AI 활용도 | 20점 |
| 완성도 | 20점 |
| 실용성 | 20점 |
| 발표력 (본선) | 20점 |
| Upstage API 활용 가점 | +5점 |
| 지역사회 기여도 가점 | +5점 |

### 시상 내역

- 대상 1팀: 100만원 + 상품
- 최우수상 1팀: 50만원 + 상품
- 우수상 1팀: 상품
- 본선 참가 10팀: Upstage 굿즈 + 참가 인증서

## Git Fork 하는 방법

참가팀은 이 저장소를 팀 대표의 GitHub 계정으로 **Fork**한 뒤, 해당 Fork 저장소에서 프로젝트를 개발하고 최종 결과물을 제출합니다.

### 1. 저장소 Fork하기

1. [AI-Builder-Sprint 저장소](https://github.com/ApptiveDev/AI-Builder-Sprint)에 접속합니다.
2. 우측 상단의 **Fork** 버튼을 클릭합니다.
  <img width="1888" height="1131" alt="스크린샷 2026-07-27 오전 12 31 16" src="https://github.com/user-attachments/assets/2f0f7f80-6c92-4ba5-87c5-89ed6107eeab" />

3. 본인(또는 팀 대표) GitHub 계정으로 저장소가 복사됩니다. (`https://github.com/<내-계정>/AI-Builder-Sprint`)

### 2. Fork한 저장소 로컬로 클론하기

```bash
git clone https://github.com/<내-계정>/AI-Builder-Sprint.git
cd AI-Builder-Sprint
```

### 3. 개발 진행 및 커밋

```bash
git checkout -b develop
# 코드 작성 및 수정
git add .
git commit -m "feat: 프로젝트 초기 구현"
git push origin develop
```

포크된 저장소 내에서 개발을 진행해주시면 됩니다.

### 4. 결과물 제출

- **팀별로 Fork한 본인 저장소 URL을 제출 양식에 기재합니다.**
- 제출 마감 전까지 코드, 데모 영상/배포 링크, 발표 자료를 함께 준비해 제출해주세요.
- 코딩 에이전트를 활용한 경우 `.claude/`, `AGENTS.md` 등 설정 파일도 반드시 저장소에 포함해주세요.


## 문의

- 대회 관련 문의: 해커톤 문의 오픈채팅방
- 주최: 부산대학교 APPTIVE, 정보컴퓨터공학부 동아리연합회 / 후원: Upstage, 부산대 Anchor 사업단, 부산대 AI융합교육원

## 프로젝트 문서

- [심사위원 실행 가이드](docs/JUDGE_GUIDE.md): 설치, 환경변수, 5분 데모, 전체 전자서명 시나리오, 문제 해결
- [AI 사용 기록](docs/AI_USAGE.md): 사용 모델, API 호출 위치, 주요 프롬프트, 개인정보 보호와 장애 대체 동작
- [개발 작업 지침](AGENTS.md): 기능 목표, 코드 작성 규칙, 보안 및 문서화 원칙

전자서명 템플릿 ID는 `data/contract-templates.json`에 저장되어 있습니다. 기본 상품은 `data/products.json`의 `contractTemplateKeys`로 필요한 계약서를 선택하며, 판매자가 등록한 상품은 같은 종목의 계약서 구성을 사용합니다. 실제 API 키와 로컬 사용자·예약 데이터는 `.gitignore`로 보호됩니다.
