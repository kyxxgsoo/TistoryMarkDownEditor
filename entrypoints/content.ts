import { waitForEditor } from '../lib/tistory/detector';
import { injectEditor } from '../lib/tistory/injector';
import '../assets/styles/editor.css';
import 'katex/dist/katex.min.css';

export default defineContentScript({
  matches: ['*://*.tistory.com/manage/newpost*', '*://*.tistory.com/manage/post/*'],
  async main() {
    try {
      const elements = await waitForEditor();
      injectEditor(elements);
    } catch (error) {
      console.error('[Tition]', error);
    }
  },
});
