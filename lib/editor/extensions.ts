import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import Image from '@tiptap/extension-image';
import { SlashCommands } from './slash-commands';
import { Callout } from './callout';
import { ToggleList } from './toggle-list';
import { MathBlock } from './math-block';

/**
 * TipTap 에디터에 사용할 확장 목록.
 * StarterKit에 마크다운 입력 룰이 기본 포함됨:
 * - `# ` → H1, `## ` → H2, ...
 * - `- ` / `* ` → 리스트
 * - `> ` → 인용
 * - ``` → 코드블록
 * - `**bold**`, `*italic*` 등
 *
 * SlashCommands: `/` 입력 시 노션 스타일 커맨드 드롭다운 표시
 */
export function getExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4] },
      codeBlock: { HTMLAttributes: { class: 'tiptap-code-block' } },
      blockquote: { HTMLAttributes: { class: 'tiptap-blockquote' } },
      link: false,
      underline: false,
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: {
        class: 'tiptap-link',
        rel: 'noopener noreferrer',
        target: '_blank',
      },
    }),
    Underline,
    TaskList.configure({
      HTMLAttributes: { class: 'tiptap-task-list' },
    }),
    TaskItem.configure({
      nested: true,
      HTMLAttributes: { class: 'tiptap-task-item' },
    }),
    TextStyle,
    Highlight.configure({ multicolor: true }),
    Table.configure({
      resizable: true,
      HTMLAttributes: { class: 'tiptap-table' },
    }),
    TableRow,
    TableCell,
    TableHeader,
    Image.configure({
      inline: false,
      allowBase64: true,
      HTMLAttributes: { class: 'tiptap-image' },
    }),
    ToggleList,
    MathBlock,
    SlashCommands,
    Callout,
  ];
}
