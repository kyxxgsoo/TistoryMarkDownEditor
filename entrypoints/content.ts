import { waitForEditor, type TistoryEditorElements } from '../lib/tistory/detector';
import { injectEditor, removeEditor } from '../lib/tistory/injector';
import { syncToTistory } from '../lib/tistory/sync-bridge';
import '../assets/styles/editor.css';
import type { Editor } from '@tiptap/core';

const EDITOR_PATTERN = /\/manage\/(newpost|post\/\d+)/;
const STORAGE_KEY = 'tition-enabled';
const TOGGLE_BAR_ID = 'tition-toggle-bar';

let currentEditor: Editor | null = null;
let currentElements: TistoryEditorElements | null = null;

/** 에디터 페이지인지 확인 */
function isEditorPage(): boolean {
  return EDITOR_PATTERN.test(location.pathname);
}

/** 에디터 활성화 상태 조회 (기본값: true) */
async function isEnabled(): Promise<boolean> {
  const result = await browser.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] !== false;
}

/** 토글 바 UI를 생성하거나 업데이트한다. */
function renderToggleBar(enabled: boolean, kakaoEditor: HTMLElement) {
  let bar = document.getElementById(TOGGLE_BAR_ID);

  if (!bar) {
    bar = document.createElement('div');
    bar.id = TOGGLE_BAR_ID;
    bar.innerHTML = `
      <div class="tition-toggle-bar">
        <span class="tition-toggle-brand">Tition</span>
        <label class="tition-toggle-switch">
          <input type="checkbox" id="tition-toggle-input" />
          <span class="tition-toggle-slider"></span>
        </label>
      </div>
    `;
    kakaoEditor.insertBefore(bar, kakaoEditor.firstChild);

    bar.querySelector('#tition-toggle-input')!.addEventListener('change', async (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      await browser.storage.local.set({ [STORAGE_KEY]: checked });
    });
  }

  const input = bar.querySelector('#tition-toggle-input') as HTMLInputElement;
  input.checked = enabled;
}

/** 토글 바를 제거한다. */
function removeToggleBar() {
  document.getElementById(TOGGLE_BAR_ID)?.remove();
}

/** TipTap 에디터를 주입한다. */
async function activate() {
  if (currentEditor && !currentEditor.isDestroyed) return;
  if (!isEditorPage()) return;

  try {
    const elements = await waitForEditor();
    currentElements = elements;
    currentEditor = await injectEditor(elements);
    renderToggleBar(true, elements.kakaoEditor);
  } catch (error) {
    console.error('[Tition]', error);
  }
}

/** TipTap 에디터를 제거하고 원래 에디터를 복원한다. 콘텐츠를 동기화한 뒤 제거. */
function deactivate() {
  if (!currentEditor || currentEditor.isDestroyed || !currentElements) return;

  const html = currentEditor.getHTML();
  syncToTistory(html);

  removeEditor(currentEditor, currentElements);
  renderToggleBar(false, currentElements.kakaoEditor);
  currentEditor = null;
  currentElements = null;
}

/** 현재 페이지와 활성화 상태에 따라 에디터를 주입/제거한다. */
async function handleNavigation() {
  const enabled = await isEnabled();

  if (isEditorPage() && enabled) {
    await activate();
  } else if (isEditorPage() && !enabled) {
    deactivate();
    // 에디터 꺼져있어도 토글 바는 표시
    const kakaoEditor = document.querySelector('.kakao-editor') as HTMLElement | null;
    if (kakaoEditor) renderToggleBar(false, kakaoEditor);
  } else {
    deactivate();
    removeToggleBar();
  }
}

export default defineContentScript({
  matches: ['*://*.tistory.com/manage/*'],
  async main() {
    // 초기 로드
    await handleNavigation();

    // SPA 네비게이션 감지: history.pushState / replaceState 가로채기
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = function (...args) {
      originalPushState(...args);
      handleNavigation();
    };

    history.replaceState = function (...args) {
      originalReplaceState(...args);
      handleNavigation();
    };

    // 뒤로가기/앞으로가기 감지
    window.addEventListener('popstate', () => handleNavigation());

    // 팝업에서 토글 변경 시 감지
    browser.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && STORAGE_KEY in changes) {
        handleNavigation();
      }
    });
  },
});
