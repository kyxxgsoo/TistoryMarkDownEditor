import type { TistoryEditorElements } from './detector';
import { createEditor } from '../editor/create-editor';
import { syncToTistory } from './sync-bridge';
import type { Editor } from '@tiptap/core';

const TIPTAP_CONTAINER_ID = 'tiptap-markdown-editor';

/**
 * 기존 Tistory 에디터를 숨기고 TipTap 에디터를 주입한다.
 * TinyMCE는 오프스크린으로 숨겨 기능을 유지하며,
 * 발행/저장 시점에만 콘텐츠를 동기화한다.
 */
/** iframe body나 textarea에서 빈 콘텐츠가 아닌 값이 있는지 확인 */
function isEmptyContent(html: string): boolean {
  const trimmed = html.trim();
  return !trimmed || trimmed === '<p><br></p>' || trimmed === '<br>' || trimmed === '<p><br data-mce-bogus="1"></p>';
}

/** 기존 콘텐츠를 읽어온다. iframe/textarea에서 즉시 읽고, 비어있으면 폴링으로 대기한다. */
function readContent(elements: TistoryEditorElements): string {
  try {
    const iframeDoc = elements.editorIframe.contentDocument;
    if (iframeDoc?.body) {
      const bodyHtml = iframeDoc.body.innerHTML;
      if (!isEmptyContent(bodyHtml)) return bodyHtml;
    }
  } catch {
    // iframe 접근 실패 시 무시
  }

  const textareaVal = elements.hiddenTextarea.value;
  if (!isEmptyContent(textareaVal)) return textareaVal;

  return '';
}

/**
 * 수정 페이지에서 기존 콘텐츠를 가져온다.
 * TinyMCE가 AJAX로 콘텐츠를 로드하는 경우 지연이 있을 수 있으므로,
 * 수정 페이지(/manage/post/*)에서는 콘텐츠가 나타날 때까지 최대 10초 대기한다.
 * MutationObserver + 폴링 이중 감지로 레이스 컨디션을 방지한다.
 */
function loadExistingContent(elements: TistoryEditorElements): Promise<string> {
  const immediate = readContent(elements);
  if (immediate) return Promise.resolve(immediate);

  // 새 글 작성 페이지면 콘텐츠가 없는 것이 정상
  const isEditPage = /\/manage\/post\/\d+/.test(location.pathname);
  if (!isEditPage) return Promise.resolve('');

  return new Promise((resolve) => {
    let resolved = false;
    const maxWait = 10_000;

    function done(content: string) {
      if (resolved) return;
      resolved = true;
      observer?.disconnect();
      clearInterval(pollTimer);
      clearTimeout(timeout);
      resolve(content);
    }

    // 1. MutationObserver: iframe body 변경 감지
    let observer: MutationObserver | null = null;
    try {
      const iframeDoc = elements.editorIframe.contentDocument;
      if (iframeDoc?.body) {
        observer = new MutationObserver(() => {
          const content = readContent(elements);
          if (content) done(content);
        });
        observer.observe(iframeDoc.body, { childList: true, subtree: true, characterData: true });
      }
    } catch {
      // iframe 접근 실패 시 무시
    }

    // 2. 폴링: textarea 변경도 감지 (MutationObserver가 못 잡는 경우 대비)
    const pollTimer = setInterval(() => {
      const content = readContent(elements);
      if (content) done(content);
    }, 300);

    // 3. 타임아웃
    const timeout = setTimeout(() => {
      done(readContent(elements));
    }, maxWait);
  });
}

export async function injectEditor(elements: TistoryEditorElements): Promise<Editor> {
  const { editorContainer, kakaoEditor } = elements;

  if (document.getElementById(TIPTAP_CONTAINER_ID)) {
    throw new Error('[Tition] 에디터가 이미 주입되어 있습니다.');
  }

  // 기존 에디터를 오프스크린으로 숨기기
  editorContainer.style.position = 'absolute';
  editorContainer.style.left = '-9999px';
  editorContainer.style.height = '0';
  editorContainer.style.overflow = 'hidden';
  editorContainer.style.opacity = '0';
  editorContainer.style.pointerEvents = 'none';

  // TipTap 에디터 컨테이너 생성
  const tiptapContainer = document.createElement('div');
  tiptapContainer.id = TIPTAP_CONTAINER_ID;
  kakaoEditor.insertBefore(tiptapContainer, editorContainer);

  // 기존 글 수정 시 콘텐츠 가져오기
  const initialContent = await loadExistingContent(elements);

  // TipTap 에디터 생성
  let syncTimer: ReturnType<typeof setTimeout> | null = null;
  const editor = createEditor({
    element: tiptapContainer,
    content: initialContent || '',
    onUpdate: (html) => {
      // 디바운스: 2초마다 TinyMCE에 동기화 (매 키입력이 아닌 유휴 시점)
      if (syncTimer) clearTimeout(syncTimer);
      syncTimer = setTimeout(() => {
        syncToTistory(html);
      }, 2000);
    },
  });

  /** 현재 TipTap 콘텐츠를 즉시 동기화 */
  function doSyncNow() {
    if (syncTimer) clearTimeout(syncTimer);
    const html = editor.getHTML();
    syncToTistory(html);
  }

  // 발행 버튼: mousedown은 click보다 먼저 발생 → 동기화 시간 확보
  const publishBtn = document.getElementById('publish-layer-btn');
  if (publishBtn) {
    publishBtn.addEventListener('mousedown', () => doSyncNow(), { capture: true });
    // click에서도 한번 더 동기화 (안전장치)
    publishBtn.addEventListener('click', () => doSyncNow(), { capture: true });
  }

  // 임시저장 버튼도 동기화
  const draftBtn = document.querySelector('.btn-draft .action') as HTMLElement | null;
  if (draftBtn) {
    draftBtn.addEventListener('mousedown', () => doSyncNow(), { capture: true });
    draftBtn.addEventListener('click', () => doSyncNow(), { capture: true });
  }

  return editor;
}

/**
 * TipTap 에디터를 제거하고 기존 에디터를 복원한다.
 */
export function removeEditor(editor: Editor, elements: TistoryEditorElements): void {
  editor.destroy();

  const tiptapContainer = document.getElementById(TIPTAP_CONTAINER_ID);
  if (tiptapContainer) {
    tiptapContainer.remove();
  }

  elements.editorContainer.style.position = '';
  elements.editorContainer.style.left = '';
  elements.editorContainer.style.height = '';
  elements.editorContainer.style.overflow = '';
  elements.editorContainer.style.opacity = '';
  elements.editorContainer.style.pointerEvents = '';
}
