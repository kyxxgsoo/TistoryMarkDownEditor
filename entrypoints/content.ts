import { waitForEditor } from '../lib/tistory/detector';
import { injectEditor } from '../lib/tistory/injector';
import '../assets/styles/editor.css';

export default defineContentScript({
  matches: ['*://*.tistory.com/manage/newpost*', '*://*.tistory.com/manage/post/*'],
  async main() {
    console.log('[TistoryMarkdownEditor] Content script loaded.');

    try {
      const elements = await waitForEditor();
      console.log('[TistoryMarkdownEditor] Tistory 에디터 DOM 감지 완료.');
      injectEditor(elements);
    } catch (error) {
      console.error(error);
    }
  },
});
