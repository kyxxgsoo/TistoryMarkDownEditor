import { Editor } from '@tiptap/core';
import { getExtensions } from './extensions';

export interface CreateEditorOptions {
  /** TipTap 에디터를 마운트할 DOM 요소 */
  element: HTMLElement;
  /** 콘텐츠 변경 시 호출되는 콜백 (HTML 문자열) */
  onUpdate?: (html: string) => void;
  /** 초기 HTML 콘텐츠 */
  content?: string;
}

/**
 * TipTap 에디터 인스턴스를 생성한다.
 */
export function createEditor({ element, onUpdate, content }: CreateEditorOptions): Editor {
  const editor = new Editor({
    element,
    extensions: getExtensions(),
    content: content || '<p></p>',
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content',
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
    },
  });

  return editor;
}
