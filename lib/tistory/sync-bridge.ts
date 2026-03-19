/**
 * Content Script에서 메인 월드 브릿지로 동기화 메시지를 보낸다.
 * CustomEvent.detail은 격리된 월드 간 전달이 안 되므로 window.postMessage 사용.
 */

const SYNC_MESSAGE_TYPE = 'tiptap-sync-to-tistory';

/**
 * TipTap 콘텐츠를 메인 월드의 TinyMCE로 동기화한다.
 */
export function syncToTistory(html: string): void {
  window.postMessage({ type: SYNC_MESSAGE_TYPE, html }, '*');
}
