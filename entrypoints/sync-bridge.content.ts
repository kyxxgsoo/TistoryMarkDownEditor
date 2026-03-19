/**
 * 메인 월드에서 실행되는 동기화 브릿지.
 * TinyMCE API에 접근하여 TipTap 콘텐츠를 동기화한다.
 * window.postMessage로 Content Script와 통신한다.
 */
export default defineContentScript({
  matches: ['*://*.tistory.com/manage/newpost*', '*://*.tistory.com/manage/post/*'],
  world: 'MAIN',
  runAt: 'document_idle',
  main() {
    const SYNC_MESSAGE_TYPE = 'tiptap-sync-to-tistory';

    window.addEventListener('message', (e) => {
      // 같은 윈도우에서 온 메시지만 처리
      if (e.source !== window || e.data?.type !== SYNC_MESSAGE_TYPE) return;

      const html = e.data.html;
      if (typeof html !== 'string') return;

      console.log('[SyncBridge] 수신된 HTML:', html.substring(0, 100));

      // 1. TinyMCE API로 콘텐츠 설정 + save()로 textarea에 반영
      const tinymce = (window as any).tinymce;
      if (tinymce) {
        const editor = tinymce.get('editor-tistory');
        if (editor) {
          editor.setContent(html);
          editor.setDirty(true);
          // save()는 TinyMCE 내부적으로 textarea에 콘텐츠를 기록한다
          editor.save();
          console.log('[SyncBridge] TinyMCE 동기화 + save 성공');
          console.log('[SyncBridge] TinyMCE getContent:', editor.getContent().substring(0, 100));
        } else {
          console.warn('[SyncBridge] TinyMCE editor 인스턴스 없음');
        }
      } else {
        console.warn('[SyncBridge] window.tinymce 없음');
      }

      // 2. 숨겨진 textarea에도 직접 설정 (안전장치)
      const textarea = document.getElementById('editor-tistory') as HTMLTextAreaElement | null;
      if (textarea) {
        textarea.value = html;
      }

      // 3. iframe body에도 설정
      const iframe = document.getElementById('editor-tistory_ifr') as HTMLIFrameElement | null;
      if (iframe?.contentDocument?.body) {
        iframe.contentDocument.body.innerHTML = html;
      }
    });

    console.log('[TistoryMarkdownEditor] Sync bridge loaded in MAIN world.');
  },
});
