import { Node, mergeAttributes } from '@tiptap/core';

const KATEX_CDN_JS = 'https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.js';
const KATEX_CDN_CSS = 'https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css';

let katexLoaded: Promise<void> | null = null;

/** KaTeX JS + CSS를 CDN에서 로드 (중복 방지) */
function ensureKatex(): Promise<void> {
  if (katexLoaded) return katexLoaded;

  katexLoaded = new Promise<void>((resolve) => {
    // CSS 로드
    if (!document.getElementById('tition-katex-css')) {
      const link = document.createElement('link');
      link.id = 'tition-katex-css';
      link.rel = 'stylesheet';
      link.href = KATEX_CDN_CSS;
      document.head.appendChild(link);
    }

    // JS 로드
    if ((window as any).katex) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = KATEX_CDN_JS;
    script.onload = () => resolve();
    script.onerror = () => resolve(); // 실패해도 진행
    document.head.appendChild(script);
  });

  return katexLoaded;
}

/** KaTeX 렌더링 (로드 전이면 원본 텍스트 반환) */
function renderLatex(latex: string): string {
  const k = (window as any).katex;
  if (!k) return `<span style="font-family:monospace">${latex}</span>`;
  try {
    return k.renderToString(latex, { throwOnError: false, displayMode: true });
  } catch {
    return `<span style="color:#e03e3e">${latex}</span>`;
  }
}

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
    const rendered = renderLatex(latex);

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

      const updateDisplay = (latex: string) => {
        dom.innerHTML = renderLatex(latex) || `<span style="color:#999">수식을 입력하세요</span>`;
      };

      // KaTeX CDN 로드 후 렌더링
      ensureKatex().then(() => updateDisplay(node.attrs.latex));

      dom.addEventListener('click', () => {
        const newLatex = window.prompt('LaTeX 수식을 입력하세요', node.attrs.latex);
        if (newLatex !== null && typeof getPos === 'function') {
          editor.chain().focus().command(({ tr }) => {
            tr.setNodeMarkup(getPos(), undefined, { latex: newLatex });
            return true;
          }).run();
          updateDisplay(newLatex);
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
