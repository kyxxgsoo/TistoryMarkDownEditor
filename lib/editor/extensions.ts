import StarterKit from '@tiptap/starter-kit';

/**
 * TipTap 에디터에 사용할 확장 목록.
 * StarterKit에 마크다운 입력 룰이 기본 포함됨:
 * - `# ` → H1, `## ` → H2, ...
 * - `- ` / `* ` → 리스트
 * - `> ` → 인용
 * - ``` → 코드블록
 * - `**bold**`, `*italic*` 등
 */
export function getExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4] },
      codeBlock: { HTMLAttributes: { class: 'tiptap-code-block' } },
      blockquote: { HTMLAttributes: { class: 'tiptap-blockquote' } },
    }),
  ];
}
