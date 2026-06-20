# Competitive Landscape Builder

기술특례상장 평가자와 VC 투자심사역을 위한 **경쟁사·비교기업 정리 도구** (v0.1 로컬 MVP).

bio-news-report와 **별개의 독립 프로젝트**입니다.

## 요구 사항

- Node.js 20+
- npm

## 로컬 실행

```bash
cd competitive-landscape
npm install
copy .env.local.example .env.local   # Windows
# OPENAI_API_KEY는 LLM 기능에 필요 (아래 가이드 참고)
# ADMIN_PASSWORD는 write 작업에 필요
npm run dev
```

브라우저: http://localhost:3000

## OPENAI_API_KEY 필요 여부

| 목적 | API Key |
|------|---------|
| `npm run dev` (앱 기동) | 불필요 |
| 프로젝트·후보·검수·XLSX/CSV Export | 불필요 |
| **Analyze Target** | **필요** |
| **Generate Candidates** | **필요** |
| **Run Classification** (LLM 분류) | **필요** |
| Generate Report (§7·§8 시사점) | 없어도 동작 (fallback 문구) |
| `npm run verify:step*` / `e2e:*` | 불필요 |

## 빠른 시작 (API Key 없이 UI 확인)

```bash
npm run seed:demo    # 분류·승인·리포트 포함 데모 프로젝트 주입
npm run dev
```

→ http://localhost:3000 에서 **Demo Target Bio (E2E)** 프로젝트 열기

## v0.1 워크플로 (수동 E2E)

```text
① 프로젝트 생성 (/projects/new)
② 후보 추가 (Workbench → Add Candidate)
③ (선택) Evidence 추가
④ LLM 분류 (Run Classification) — API Key 필요
⑤ Review → Approve
⑥ Generate Report
⑦ Export (Markdown / XLSX / CSV)
```

## AI-assisted 워크플로 (v0.1.5)

보고서 참조·인간 검수 전제. **두 AI 단계는 자동 연결하지 않습니다.**

```text
① 프로젝트 생성 (Target companyName + website 권장)
② Analyze Target — OpenAI가 Target 프로필 보완 (웹사이트 fetch 시도)
   → 완료 후 Target 프로필 검토
③ Generate Candidates — 저장된 Target 기준 12~20건 AI 제안
   → Pending 후보로 추가, evidence confidence Low
④ Run Classification / Reclassify Batch
⑤ Review → Approve
⑥ Generate Report
⑦ Export
```

### Workbench 버튼

| 버튼 | 설명 |
|------|------|
| Add Candidate | 수동 후보 추가 |
| Analyze Target | Target 필드 AI 보완 (별도 실행) |
| Generate Candidates | Target 기준 AI 후보 제안 (별도 실행) |
| Run Classification | Unclassified 후보 LLM 분류 |
| Reclassify Batch | 기분류 후보 재분류 |
| Generate Report | 9섹션 Markdown 리포트 |
| Export | Markdown / XLSX / CSV |

**구현하지 않음:** Auto Build Landscape, Analyze Target + Generate Candidates 원클릭 연속 실행.

### Analyze Target

- 입력: `companyName`, `website`, 기존 Target 필드
- 웹사이트 텍스트 fetch 시도 (실패 시 caveat 표시)
- OpenAI로 비어 있는 Target 필드 추론
- 완료 메시지: *Target analysis completed. Please review the target profile before generating candidates.*

### Generate Candidates

- 입력: **저장된** Target 프로필
- OpenAI로 12~20건 후보 제안
- `companyName` 중복 제외, `reviewStatus: Pending`, evidence `confidenceLevel: Low`
- 완료 메시지: *AI-suggested candidates were added as Pending. Please verify sources before using them in a report.*

### ① 프로젝트 — 필수: `companyName` / 권장: Target 9필드 + `website` + analysisPurpose

### ② 후보 — 필수

- `companyName`
- `technology` 또는 `product`
- `indicationOrMarket`, `businessModel`, `developmentStage`
- `sourceUrl` 또는 `memo`

## 전체 E2E (API Key 있을 때)

`.env.local`에 `OPENAI_API_KEY=sk-...` 및 `ADMIN_PASSWORD=...` 설정 후:

1. Target + (선택) website 입력
2. **Analyze Target** → Target 탭에서 검토
3. **Generate Candidates** → Candidates 탭에서 검토
4. **Run Classification**
5. Review **Approve**
6. **Generate Report**
7. Export 탭에서 Markdown / XLSX / CSV

## 자동 검증 스크립트

```bash
# 단계별 오프라인 검증
npm run verify:step1
npm run verify:step4
npm run verify:step5
npm run verify:step7
npm run verify:step8
npm run verify:step9

# E2E 서비스 레이어 검증 (API Key 불필요)
npm run e2e:manual

# 전체 흐름 (API Key 있으면 live LLM, 없으면 mock)
npm run e2e:full

npm run build
```

## 빌드

```bash
npm run build
npm start
```

## 데이터

- `data/landscapes.json` — 로컬 런타임 데이터 (Git 제외, 민감 정보 보호)
- `data/landscapes.json.example` — 빈 시드 템플릿 (`projects: []`)
- 첫 실행 시 파일이 없으면 자동 생성되거나 `npm run seed:demo`로 데모 프로젝트 주입

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `OPENAI_API_KEY` | AI 기능 | Analyze Target, Generate Candidates, Run Classification |
| `OPENAI_MODEL` | 선택 | 기본값 `gpt-4o-mini` |
| `ADMIN_PASSWORD` | write 작업 | 프로젝트·후보·AI·분류·리포트 생성 |
| `STORAGE_DRIVER` | 선택 | `local` (기본) 또는 `github` |
| `GITHUB_TOKEN` | github 모드 | Contents Read/Write |
| `GITHUB_OWNER` / `GITHUB_REPO` | github 모드 | 저장소 |
| `NEXT_PUBLIC_APP_NAME` | 선택 | 앱 표시명 |

## 라이선스

Private / personal use.
