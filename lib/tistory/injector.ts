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
export function injectEditor(elements: TistoryEditorElements): Editor {
  const { editorContainer, kakaoEditor } = elements;

  if (document.getElementById(TIPTAP_CONTAINER_ID)) {
    throw new Error('[TistoryMarkdownEditor] 에디터가 이미 주입되어 있습니다.');
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
  let initialContent = '';
  try {
    const iframeDoc = elements.editorIframe.contentDocument;
    if (iframeDoc?.body) {
      const bodyHtml = iframeDoc.body.innerHTML.trim();
      if (bodyHtml && bodyHtml !== '<p><br></p>' && bodyHtml !== '<br>' && bodyHtml !== '<p><br data-mce-bogus="1"></p>') {
        initialContent = bodyHtml;
      }
    }
  } catch {
    // iframe 접근 실패 시 무시
  }

  if (!initialContent && elements.hiddenTextarea.value.trim()) {
    initialContent = elements.hiddenTextarea.value;
  }

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
    console.log('[TistoryMarkdownEditor] 즉시 동기화:', html.substring(0, 200));
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

  console.log('[TistoryMarkdownEditor] TipTap 에디터 주입 완료');
  console.log('[TistoryMarkdownEditor] extensions:', editor.extensionManager.extensions.map(e => e.name));
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
  console.log('[TistoryMarkdownEditor] 기존 에디터 복원 완료');
}
