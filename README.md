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
# OPENAI_API_KEY는 LLM 분류·실제 시사점에만 필요 (아래 가이드 참고)
npm run dev
```

브라우저: http://localhost:3000

## OPENAI_API_KEY 필요 여부

| 목적 | API Key |
|------|---------|
| `npm run dev` (앱 기동) | 불필요 |
| 프로젝트·후보·검수·XLSX/CSV Export | 불필요 |
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

### ① 프로젝트 — 필수: `companyName` / 권장: Target 9필드 + analysisPurpose

### ② 후보 — 필수

- `companyName`
- `technology` 또는 `product`
- `indicationOrMarket`, `businessModel`, `developmentStage`
- `sourceUrl` 또는 `memo`

## 전체 E2E (API Key 있을 때)

`.env.local`에 `OPENAI_API_KEY=sk-...` 설정 후:

1. Target + 후보 2~3건 입력
2. **Run Classification**
3. Review **Approve**
4. **Generate Report**
5. Export 탭에서 Markdown / XLSX / CSV

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

| 변수 | 필수 (v0.1) | 설명 |
|------|---------------|------|
| `OPENAI_API_KEY` | 분류·실제 시사점 | 없으면 Run Classification 실패, 리포트 §7·§8은 placeholder |
| `OPENAI_MODEL` | 선택 | 기본값 `gpt-4o-mini` |
| `NEXT_PUBLIC_APP_NAME` | 선택 | 앱 표시명 |

v0.1에서 사용 안 함: `ADMIN_PASSWORD`, `GITHUB_*`, `STORAGE_DRIVER`

## 라이선스

Private / personal use.
