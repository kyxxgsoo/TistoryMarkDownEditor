# TistoryMarkDownEditor Development Guide

## ⚠️ 최우선 규칙: Git 컨벤션 반드시 준수

아래 컨벤션은 **모든 작업에서 예외 없이** 지켜야 한다. 작업 시작 전 반드시 확인할 것.

### 브랜치 전략 (반드시 이 순서를 따를 것)
1. **이슈 생성** — GitHub Issue에 작업 내용 등록
2. **브랜치 생성** — develop에서 브랜치 생성
3. **구현** — 커밋 컨벤션에 맞춰 작업
4. **PR to develop** — develop으로 PR 생성 (PR 제목 = 이슈 제목 + #이슈번호)
5. **머지 & 테스트** — develop 머지 후 Dev 환경에서 테스트
6. **PR to master** — 테스트 완료 후 master로 PR (버전 업)
7. **프로덕션 배포** — master 머지 시 자동 배포

### 이슈 컨벤션
- 형식: `[TYPE] 설명`
- 예시: `[FEAT] Dev 환경 자동 시작/중지 구성`
- Types: `[FEAT]`, `[FIX]`, `[BUG]`, `[REFACTOR]`, `[HOTFIX]`, `[CHORE]`, `[DOCS]`, `[ENHANCE]`

### 브랜치 네이밍
- 형식: `type/#이슈번호/설명`
- 예시: `feat/#227/icsTranslation`, `fix/#222/partialUniqueIndex`
- Types: feat, fix, refactor, hotfix, docs, chore
- hotfix만 master에서 분기, 나머지는 develop에서 분기

### 커밋 컨벤션
- 형식: `type: #이슈번호 설명`
- 예시: `feat: #227 ICS note 정리 - 보일러플레이트 제거 및 URL 추출`
- Types: feat, fix, refactor, chore, perf, hotfix, docs
- Claude 작성 시 Co-Authored-By 추가: `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`
- **기능 단위 커밋 필수**: 하나의 커밋에 여러 기능을 묶지 않는다. 변경 사항을 논리적 기능 단위로 분리하여 각각 커밋한다.
  - 좋은 예: `Entity 추가` → `Repository 추가` → `Service 구현` → `Controller 연결` → `테스트 작성`
  - 나쁜 예: `feat: #230 일정 공유 기능 전체 구현` (Entity + Service + Controller + 테스트를 한 커밋에 몰아넣기)

### PR 컨벤션
- **develop PR 제목: 이슈 제목과 동일한 형식 + #이슈번호**
  - 형식: `[TYPE] 설명 #이슈번호`
  - 예시: `[FEAT] ICS 일정 영어 → 한글 번역 기능 추가 (DeepL API) #227`
  - 같은 이슈의 같은 브랜치에서 여러 PR 가능 (세부 단위로 분리)
- **master PR 제목: 버전 태그**
  - 예시: `v1.4.1`

### ADR (Architecture Decision Record) — PR마다 필수 작성
- **대상**: 기술적 결정이 포함된 모든 PR (단순 오타/포맷 수정 제외)
- **위치**: `docs/decisions/NNN-제목.md` (번호는 기존 마지막 번호 + 1)
- **작성 시점**: PR 생성 전, 코드 변경과 함께 커밋
- **형식**:
```markdown
# ADR-NNN: 제목

> Date: YYYY-MM-DD

## 상황 (Context)
왜 이 변경이 필요한가? 어떤 문제를 해결하는가?

## 선택지 (Options)
1. **선택지 A** — 장점 / 단점
2. **선택지 B** — 장점 / 단점

## 결정 (Decision)
어떤 선택지를 골랐고, 구체적으로 어떻게 구현했는가?

## 결과 (Result)
이 결정으로 인한 영향, 트레이드오프, 후속 작업
```
- **규칙**:
  - `선택지 (Options)` 섹션에 최소 2개 이상의 대안을 반드시 기록 (왜 다른 방법을 택하지 않았는지 명확히)
  - 코드 변경의 근거가 되는 기술적 맥락을 충분히 기술
  - hotfix PR은 간략하게 작성 가능하나 생략 불가

### 절대 금지 사항
- develop에 직접 push 금지 — 반드시 브랜치 → PR → 머지
- master에 직접 push 금지
- 하나의 이슈에 관련 없는 작업 묶지 않기
- 이슈 없이 브랜치/PR 생성 금지
- PR 제목에 이슈번호 누락 금지
- **DB 직접 접근 금지** — 데이터 조회/수정은 반드시 Swagger API를 통해 정상 루트로 수행. SSH 터널 + psql 직접 쿼리 절대 금지
