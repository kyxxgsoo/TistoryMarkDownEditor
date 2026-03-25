import { Extension } from '@tiptap/core';
import { Suggestion } from '@tiptap/suggestion';
import type { Editor } from '@tiptap/core';

const MAX_GRID = 8;

/** 드래그로 테이블 크기를 선택하는 그리드 팝업 */
function showTableGridPicker(onSelect: (rows: number, cols: number) => void) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99998';

  const popup = document.createElement('div');
  popup.className = 'table-grid-picker';

  const label = document.createElement('div');
  label.className = 'table-grid-label';
  label.textContent = '0 × 0';

  const grid = document.createElement('div');
  grid.className = 'table-grid';
  grid.style.gridTemplateColumns = `repeat(${MAX_GRID}, 1fr)`;

  let hoverRow = 0;
  let hoverCol = 0;

  for (let r = 0; r < MAX_GRID; r++) {
    for (let c = 0; c < MAX_GRID; c++) {
      const cell = document.createElement('div');
      cell.className = 'table-grid-cell';
      cell.dataset.row = String(r);
      cell.dataset.col = String(c);
      cell.addEventListener('mouseenter', () => {
        hoverRow = r;
        hoverCol = c;
        label.textContent = `${r + 1} × ${c + 1}`;
        updateGridHighlight();
      });
      cell.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        cleanup();
        onSelect(r + 1, c + 1);
      });
      grid.appendChild(cell);
    }
  }

  function updateGridHighlight() {
    const cells = grid.querySelectorAll('.table-grid-cell');
    cells.forEach((cell) => {
      const el = cell as HTMLElement;
      const cr = parseInt(el.dataset.row || '0');
      const cc = parseInt(el.dataset.col || '0');
      el.classList.toggle('is-selected', cr <= hoverRow && cc <= hoverCol);
    });
  }

  function cleanup() {
    popup.remove();
    overlay.remove();
  }

  overlay.addEventListener('click', cleanup);
  popup.appendChild(grid);
  popup.appendChild(label);
  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  // 화면 중앙에 배치
  const rect = popup.getBoundingClientRect();
  popup.style.left = `${(window.innerWidth - rect.width) / 2}px`;
  popup.style.top = `${(window.innerHeight - rect.height) / 2}px`;
}

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  command: (editor: Editor) => void;
}

/** 사용 가능한 슬래시 커맨드 목록 */
export const SLASH_COMMANDS: SlashCommandItem[] = [
  {
    title: '제목 1',
    description: '큰 제목',
    icon: 'H1',
    command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: '제목 2',
    description: '중간 제목',
    icon: 'H2',
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: '제목 3',
    description: '작은 제목',
    icon: 'H3',
    command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: '글머리 기호 목록',
    description: '순서 없는 리스트',
    icon: '•',
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: '번호 매기기 목록',
    description: '순서 있는 리스트',
    icon: '1.',
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: '체크리스트',
    description: '할 일 목록',
    icon: '☑',
    command: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    title: '토글 리스트',
    description: '접기/펼치기 블록',
    icon: '▶',
    command: (editor) => {
      const summary = window.prompt('토글 제목을 입력하세요', '토글');
      if (summary) {
        (editor.commands as any).setToggleList({ summary });
      }
    },
  },
  {
    title: '인용',
    description: '인용문 블록',
    icon: '"',
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: '코드 블록',
    description: '코드 입력 영역',
    icon: '<>',
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    title: '구분선',
    description: '가로 구분선',
    icon: '—',
    command: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    title: '굵게',
    description: '굵은 텍스트',
    icon: 'B',
    command: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    title: '기울임',
    description: '기울인 텍스트',
    icon: 'I',
    command: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    title: '취소선',
    description: '취소선 텍스트',
    icon: 'S',
    command: (editor) => editor.chain().focus().toggleStrike().run(),
  },
  {
    title: '밑줄',
    description: '밑줄 텍스트',
    icon: 'U',
    command: (editor) => editor.chain().focus().toggleUnderline().run(),
  },
  {
    title: '링크',
    description: '하이퍼링크 삽입',
    icon: '🔗',
    command: (editor) => {
      const url = window.prompt('URL을 입력하세요');
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    },
  },
  {
    title: '인라인 코드',
    description: '인라인 코드 서식',
    icon: '`',
    command: (editor) => editor.chain().focus().toggleCode().run(),
  },
  {
    title: '텍스트 색상',
    description: '글자 색상 변경',
    icon: 'A',
    command: (editor) => {
      const color = window.prompt('색상을 입력하세요 (예: red, #e03e3e)', '#e03e3e');
      if (color) {
        editor.chain().focus().setColor(color).run();
      }
    },
  },
  {
    title: '배경색',
    description: '텍스트 배경색 변경',
    icon: '🎨',
    command: (editor) => {
      const color = window.prompt('배경색을 입력하세요 (예: yellow, #fff3bf)', '#fff3bf');
      if (color) {
        editor.chain().focus().toggleHighlight({ color }).run();
      }
    },
  },
  {
    title: '이미지 (URL)',
    description: 'URL로 이미지 삽입',
    icon: '🖼',
    command: (editor) => {
      const url = window.prompt('이미지 URL을 입력하세요');
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    },
  },
  {
    title: '이미지 (파일)',
    description: '파일에서 이미지 삽입',
    icon: '📁',
    command: (editor) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const src = reader.result as string;
          editor.chain().focus().setImage({ src }).run();
        };
        reader.readAsDataURL(file);
      };
      input.click();
    },
  },
  {
    title: '테이블',
    description: '표 삽입 (크기 선택)',
    icon: '▦',
    command: (editor) => {
      showTableGridPicker((rows, cols) => {
        editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
      });
    },
  },
  {
    title: '수식',
    description: 'LaTeX 수식 블록',
    icon: '∑',
    command: (editor) => {
      const latex = window.prompt('LaTeX 수식을 입력하세요 (예: E = mc^2)', 'E = mc^2');
      if (latex) {
        (editor.commands as any).setMathBlock({ latex });
      }
    },
  },
  {
    title: '콜아웃',
    description: '💡 정보 강조 블록',
    icon: '💡',
    command: (editor) => (editor.commands as any).setCallout({ emoji: '💡', type: 'info' }),
  },
  {
    title: '경고 콜아웃',
    description: '⚠️ 경고 강조 블록',
    icon: '⚠️',
    command: (editor) => (editor.commands as any).setCallout({ emoji: '⚠️', type: 'warning' }),
  },
  {
    title: '성공 콜아웃',
    description: '✅ 성공 강조 블록',
    icon: '✅',
    command: (editor) => (editor.commands as any).setCallout({ emoji: '✅', type: 'success' }),
  },
  {
    title: '위험 콜아웃',
    description: '🚨 위험 강조 블록',
    icon: '🚨',
    command: (editor) => (editor.commands as any).setCallout({ emoji: '🚨', type: 'danger' }),
  },
];

/**
 * 슬래시 커맨드 TipTap Extension.
 * `/` 입력 시 커맨드 드롭다운을 표시한다.
 */
export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        items: ({ query }: { query: string }) => {
          return SLASH_COMMANDS.filter((item) => {
            const q = query.toLowerCase();
            return (
              item.title.toLowerCase().includes(q) ||
              item.description.toLowerCase().includes(q)
            );
          });
        },
        command: ({ editor, range, props }: { editor: Editor; range: any; props: SlashCommandItem }) => {
          // `/query` 텍스트를 삭제하고 커맨드 실행
          editor.chain().focus().deleteRange(range).run();
          props.command(editor);
        },
        render: () => {
          let popup: SlashCommandPopup | null = null;

          return {
            onStart: (props: any) => {
              popup = new SlashCommandPopup(props);
            },
            onUpdate: (props: any) => {
              popup?.update(props);
            },
            onKeyDown: (props: any) => {
              return popup?.onKeyDown(props.event) ?? false;
            },
            onExit: () => {
              popup?.destroy();
              popup = null;
            },
          };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

/**
 * 슬래시 커맨드 드롭다운 UI
 */
class SlashCommandPopup {
  private element: HTMLDivElement;
  private items: SlashCommandItem[] = [];
  private selectedIndex = 0;
  private command: ((item: SlashCommandItem) => void) | null = null;

  constructor(props: any) {
    this.element = document.createElement('div');
    this.element.className = 'slash-command-popup';
    document.body.appendChild(this.element);
    this.update(props);
  }

  update(props: any) {
    this.items = props.items;
    this.selectedIndex = 0;
    this.command = (item: SlashCommandItem) => {
      props.command(item);
    };
    this.render();
    this.updatePosition(props.clientRect?.());
  }

  private render() {
    if (this.items.length === 0) {
      this.element.innerHTML = '<div class="slash-command-empty">결과 없음</div>';
      return;
    }

    this.element.innerHTML = this.items
      .map(
        (item, index) => `
        <button class="slash-command-item ${index === this.selectedIndex ? 'is-selected' : ''}" data-index="${index}">
          <span class="slash-command-icon">${item.icon}</span>
          <div class="slash-command-text">
            <span class="slash-command-title">${item.title}</span>
            <span class="slash-command-desc">${item.description}</span>
          </div>
        </button>
      `
      )
      .join('');

    // 클릭 및 호버 이벤트
    this.element.querySelectorAll('.slash-command-item').forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        const index = parseInt((btn as HTMLElement).dataset.index || '0');
        this.selectedIndex = index;
        this.updateSelectedClass();
      });
      btn.addEventListener('click', () => {
        const index = parseInt((btn as HTMLElement).dataset.index || '0');
        this.selectItem(index);
      });
    });
  }

  private updateSelectedClass() {
    this.element.querySelectorAll('.slash-command-item').forEach((btn) => {
      const index = parseInt((btn as HTMLElement).dataset.index || '0');
      btn.classList.toggle('is-selected', index === this.selectedIndex);
    });
  }

  private updatePosition(rect: DOMRect | null) {
    if (!rect) return;
    this.element.style.left = `${rect.left}px`;
    this.element.style.top = `${rect.bottom + 8}px`;
  }

  onKeyDown(event: KeyboardEvent): boolean {
    if (event.key === 'ArrowUp') {
      this.selectedIndex = (this.selectedIndex - 1 + this.items.length) % this.items.length;
      this.updateSelectedClass();
      return true;
    }

    if (event.key === 'ArrowDown') {
      this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
      this.updateSelectedClass();
      return true;
    }

    if (event.key === 'Enter') {
      this.selectItem(this.selectedIndex);
      return true;
    }

    if (event.key === 'Escape') {
      return true;
    }

    return false;
  }

  private selectItem(index: number) {
    const item = this.items[index];
    if (item && this.command) {
      this.command(item);
    }
  }

  destroy() {
    this.element.remove();
  }
}
