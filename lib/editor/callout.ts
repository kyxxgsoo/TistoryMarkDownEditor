import { Node, mergeAttributes } from '@tiptap/core';

export interface CalloutOptions {
  HTMLAttributes: Record<string, any>;
}

/** 콜아웃 타입별 인라인 스타일 (발행 후에도 유지됨) */
const CALLOUT_STYLES: Record<string, { bg: string; border: string }> = {
  info: { bg: '#f0f7ff', border: '#d0e3ff' },
  warning: { bg: '#fffbf0', border: '#ffe5a0' },
  success: { bg: '#f0fff4', border: '#a0e8b8' },
  danger: { bg: '#fff5f5', border: '#ffb8b8' },
};

function getContainerStyle(type: string): string {
  const s = CALLOUT_STYLES[type] || CALLOUT_STYLES.info;
  return `display:flex;gap:12px;padding:16px 20px;border-radius:6px;margin:12px 0;background:${s.bg};border:1px solid ${s.border}`;
}

/**
 * 노션 스타일 콜아웃 블록 Extension.
 * 인라인 스타일을 사용하여 발행 후에도 스타일이 유지된다.
 */
export const Callout = Node.create<CalloutOptions>({
  name: 'callout',
  group: 'block',
  content: 'block+',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      emoji: {
        default: '💡',
        parseHTML: (element) => element.getAttribute('data-emoji') || '💡',
        renderHTML: (attributes) => ({ 'data-emoji': attributes.emoji }),
      },
      type: {
        default: 'info',
        parseHTML: (element) => element.getAttribute('data-type') || 'info',
        renderHTML: (attributes) => ({ 'data-type': attributes.type }),
      },
    };
  },

  parseHTML() {
    return [{
      tag: 'div[data-callout]',
      contentElement: 'div:last-child',
    }];
  },

  renderHTML({ HTMLAttributes }) {
    const type = HTMLAttributes['data-type'] || 'info';
    const emoji = HTMLAttributes['data-emoji'] || '💡';

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-callout': '',
        style: getContainerStyle(type),
      }),
      [
        'span',
        {
          contenteditable: 'false',
          style: 'font-size:20px;line-height:1.5;flex-shrink:0;user-select:none',
        },
        emoji,
      ],
      [
        'div',
        { style: 'flex:1;min-width:0' },
        0,
      ],
    ];
  },

  addCommands() {
    return {
      setCallout:
        (attrs?: { emoji?: string; type?: string }) =>
        ({ commands }) => {
          return commands.wrapIn(this.name, attrs);
        },
      toggleCallout:
        (attrs?: { emoji?: string; type?: string }) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, attrs);
        },
    };
  },
});
