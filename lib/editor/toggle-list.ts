import { Node, mergeAttributes } from '@tiptap/core';

export interface ToggleListOptions {
  HTMLAttributes: Record<string, any>;
}

/**
 * 노션 스타일 토글 리스트 Extension.
 * HTML <details>/<summary> 요소를 사용하여 접기/펼치기를 구현한다.
 * 인라인 스타일을 사용하여 발행 후에도 스타일이 유지된다.
 */
export const ToggleList = Node.create<ToggleListOptions>({
  name: 'toggleList',
  group: 'block',
  content: 'block+',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      summary: {
        default: '토글',
        parseHTML: (element) => {
          const summaryEl = element.querySelector('summary');
          return summaryEl?.textContent?.replace(/^▶\s*/, '') || '토글';
        },
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{
      tag: 'details[data-toggle]',
      contentElement: 'div[data-toggle-content]',
    }];
  },

  renderHTML({ HTMLAttributes }) {
    const summary = HTMLAttributes.summary || '토글';

    return [
      'details',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-toggle': '',
        open: true,
        style: 'border:1px solid #e0e5ee;border-radius:6px;margin:12px 0;padding:0',
      }),
      [
        'summary',
        {
          style: 'padding:12px 16px;cursor:pointer;font-weight:500;list-style:none',
        },
        `▶ ${summary}`,
      ],
      [
        'div',
        {
          'data-toggle-content': '',
          style: 'padding:4px 16px 12px',
        },
        0,
      ],
    ];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      let currentAttrs = { ...node.attrs };

      const details = document.createElement('details');
      details.setAttribute('data-toggle', '');
      details.open = true;
      details.style.cssText = 'border:1px solid #e0e5ee;border-radius:6px;margin:12px 0;padding:0';

      const summary = document.createElement('summary');
      summary.style.cssText = 'padding:12px 16px;cursor:pointer;font-weight:500;list-style:none';
      summary.contentEditable = 'true';
      summary.textContent = `▶ ${node.attrs.summary || '토글'}`;

      // summary 편집 시 attribute 업데이트
      summary.addEventListener('input', () => {
        const text = summary.textContent?.replace(/^▶\s*/, '') || '';
        currentAttrs = { ...currentAttrs, summary: text };
        const pos = getPos();
        if (typeof pos === 'number') {
          editor.view.dispatch(
            editor.view.state.tr.setNodeMarkup(pos, undefined, currentAttrs),
          );
        }
      });

      // summary 클릭 시 details 토글 방지 (편집 모드에서)
      summary.addEventListener('click', (e) => {
        e.preventDefault();
      });

      // Enter 키로 줄바꿈 방지
      summary.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      });

      const contentDiv = document.createElement('div');
      contentDiv.setAttribute('data-toggle-content', '');
      contentDiv.style.cssText = 'padding:4px 16px 12px;border-top:1px solid #e0e5ee';

      details.appendChild(summary);
      details.appendChild(contentDiv);

      return {
        dom: details,
        contentDOM: contentDiv,
        update: (updatedNode) => {
          if (updatedNode.type.name !== this.name) return false;
          currentAttrs = { ...updatedNode.attrs };
          return true;
        },
      };
    };
  },

  addCommands() {
    return {
      setToggleList:
        (attrs?: { summary?: string }) =>
        ({ commands }) => {
          return commands.wrapIn(this.name, attrs);
        },
      toggleToggleList:
        (attrs?: { summary?: string }) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, attrs);
        },
    };
  },
});
