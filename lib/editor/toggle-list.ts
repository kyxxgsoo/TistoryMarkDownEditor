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
          return summaryEl?.textContent || '토글';
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
        style: 'border:1px solid #e0e5ee;border-radius:6px;margin:12px 0;padding:0',
      }),
      [
        'summary',
        {
          style: 'padding:12px 16px;cursor:pointer;font-weight:500;user-select:none;list-style:none',
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
