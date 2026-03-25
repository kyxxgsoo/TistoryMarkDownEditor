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
      handleDrop(view, event, _slice, moved) {
        if (moved || !event.dataTransfer?.files?.length) return false;

        const images = Array.from(event.dataTransfer.files).filter((f) =>
          f.type.startsWith('image/'),
        );
        if (!images.length) return false;

        event.preventDefault();
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });

        images.forEach((file) => {
          const reader = new FileReader();
          reader.onload = () => {
            const src = reader.result as string;
            const node = view.state.schema.nodes.image.create({ src });
            if (pos) {
              const tr = view.state.tr.insert(pos.pos, node);
              view.dispatch(tr);
            }
          };
          reader.readAsDataURL(file);
        });

        return true;
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;

        const images = Array.from(items).filter((i) => i.type.startsWith('image/'));
        if (!images.length) return false;

        event.preventDefault();
        images.forEach((item) => {
          const file = item.getAsFile();
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            const src = reader.result as string;
            const node = view.state.schema.nodes.image.create({ src });
            const tr = view.state.tr.replaceSelectionWith(node);
            view.dispatch(tr);
          };
          reader.readAsDataURL(file);
        });

        return true;
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
    },
  });

  return editor;
}
