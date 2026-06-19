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
cp .env.local.example .env.local   # Windows: copy .env.local.example .env.local
# .env.local에 OPENAI_API_KEY 설정 (Step 5 이후 LLM 분류에 필요)
npm run dev
```

브라우저: http://localhost:3000

## 빌드

```bash
npm run build
npm start
```

## v0.1 워크플로

```text
Target Company 입력
→ 후보 기업 수동 입력
→ Evidence Source 입력
→ LLM 분류 + 8종 sub-score
→ rule-based 스코어링
→ 사용자 검수
→ Markdown / XLSX / CSV export
```

## 데이터

- `data/landscapes.json` — 프로젝트·후보·evidence 단일 JSON (Step 1부터 생성)

## 환경 변수

| 변수 | 필수 (v0.1) | 설명 |
|------|---------------|------|
| `OPENAI_API_KEY` | Step 5~ | LLM 분류·시사점 |
| `NEXT_PUBLIC_APP_NAME` | 선택 | 앱 표시명 |

## 개발 Step

| Step | 내용 |
|------|------|
| 0 | 레포·스캐폴드·환경변수 ← **현재** |
| 1 | 데이터 모델 + landscapes.json |
| 2 | 저장소 추상화 |
| 3–9 | UI, LLM, 검수, 리포트, export |

## 라이선스

Private / personal use.
