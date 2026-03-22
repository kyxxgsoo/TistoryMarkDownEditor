import { Node, mergeAttributes } from '@tiptap/core';
import katex from 'katex';

export interface MathBlockOptions {
  HTMLAttributes: Record<string, any>;
}

/**
 * 수식 블록 Extension.
 * KaTeX를 사용하여 LaTeX 수식을 렌더링한다.
 * 에디터에서는 클릭 시 LaTeX 소스를 편집할 수 있고,
 * 발행 시에는 렌더링된 HTML이 출력된다.
 */
export const MathBlock = Node.create<MathBlockOptions>({
  name: 'mathBlock',
  group: 'block',
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-latex') || '',
        renderHTML: (attributes) => ({ 'data-latex': attributes.latex }),
      },
    };
  },

  parseHTML() {
    return [{
      tag: 'div[data-math-block]',
    }];
  },

  renderHTML({ HTMLAttributes }) {
    const latex = HTMLAttributes['data-latex'] || '';
    let rendered = '';
    try {
      rendered = katex.renderToString(latex, {
        throwOnError: false,
        displayMode: true,
      });
    } catch {
      rendered = `<span style="color:#e03e3e">${latex}</span>`;
    }

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-math-block': '',
        'data-latex': latex,
        style: 'text-align:center;padding:16px 0;margin:12px 0;cursor:pointer',
        contenteditable: 'false',
      }),
      ['div', { style: 'font-size:1.2em' }, rendered],
    ];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div');
      dom.setAttribute('data-math-block', '');
      dom.setAttribute('data-latex', node.attrs.latex);
      dom.style.cssText = 'text-align:center;padding:16px 0;margin:12px 0;cursor:pointer;border:1px solid transparent;border-radius:6px';
      dom.contentEditable = 'false';

      const renderMath = (latex: string) => {
        try {
          dom.innerHTML = katex.renderToString(latex, {
            throwOnError: false,
            displayMode: true,
          });
        } catch {
          dom.innerHTML = `<span style="color:#e03e3e">${latex || '수식을 입력하세요'}</span>`;
        }
      };

      renderMath(node.attrs.latex);

      dom.addEventListener('click', () => {
        const newLatex = window.prompt('LaTeX 수식을 입력하세요', node.attrs.latex);
        if (newLatex !== null && typeof getPos === 'function') {
          editor.chain().focus().command(({ tr }) => {
            tr.setNodeMarkup(getPos(), undefined, { latex: newLatex });
            return true;
          }).run();
          renderMath(newLatex);
        }
      });

      dom.addEventListener('mouseenter', () => {
        dom.style.borderColor = '#e0e5ee';
      });

      dom.addEventListener('mouseleave', () => {
        dom.style.borderColor = 'transparent';
      });

      return { dom };
    };
  },

  addCommands() {
    return {
      setMathBlock:
        (attrs?: { latex?: string }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { latex: attrs?.latex || '' },
          });
        },
    };
  },
});
