# Tition

> **Tistory In Notion** — Tistory 블로그에 노션 스타일 에디터를 입히다

Tistory 글쓰기 페이지에 노션 스타일 마크다운 WYSIWYG 에디터를 제공하는 Chrome Extension입니다.

## 주요 기능

- **마크다운 실시간 변환**: `# ` → 제목, `- ` → 리스트, `> ` → 인용, `**bold**` → **볼드** 등
- **슬래시(/) 커맨드**: `/` 입력 시 노션처럼 블록 타입 선택 드롭다운
- **콜아웃 블록**: 정보/경고/성공/위험 4종 콜아웃 (발행 후에도 스타일 유지)
- **Tistory 발행 연동**: 기존 발행 플로우 그대로 사용 (카테고리, 태그 등 정상 동작)

## 설치

### Chrome Web Store
[Chrome Web Store에서 설치하기](#) (준비 중)

### 수동 설치 (개발자 모드)
1. [Releases](https://github.com/kyxxgsoo/TistoryMarkDownEditor/releases)에서 최신 `.zip` 다운로드
2. 압축 해제
3. Chrome에서 `chrome://extensions` 접속
4. 우측 상단 **개발자 모드** 활성화
5. **압축해제된 확장 프로그램을 로드합니다** 클릭
6. 압축 해제한 폴더 선택

## 사용법

1. Tistory 글쓰기 페이지(`관리 > 글쓰기`)에 접속하면 자동으로 마크다운 에디터가 활성화됩니다.
2. 마크다운 문법으로 글을 작성합니다:

| 입력 | 결과 |
|------|------|
| `# ` + 스페이스 | 제목 1 |
| `## ` + 스페이스 | 제목 2 |
| `### ` + 스페이스 | 제목 3 |
| `- ` + 스페이스 | 글머리 기호 목록 |
| `1. ` + 스페이스 | 번호 매기기 목록 |
| `> ` + 스페이스 | 인용문 |
| ` ``` ` | 코드 블록 |
| `**텍스트**` | **볼드** |
| `*텍스트*` | *이탤릭* |
| `~~텍스트~~` | ~~취소선~~ |
| `/` | 슬래시 커맨드 메뉴 |

3. 작성 완료 후 **완료** 버튼으로 평소처럼 발행합니다.

## 개발

### 요구 사항
- Node.js >= 22.12.0
- npm

### 설치 및 실행
```bash
cd TistoryMarkDownEditor
npm install
npm run dev      # 개발 서버 (HMR)
npm run build    # 프로덕션 빌드
npm run zip      # 배포용 zip 생성
```

### 기술 스택
- [WXT](https://wxt.dev/) — Chrome Extension 프레임워크 (Manifest V3)
- [TipTap](https://tiptap.dev/) — ProseMirror 기반 WYSIWYG 에디터
- TypeScript

## 라이선스
MIT
