export default defineContentScript({
  matches: ['*://*.tistory.com/manage/newpost*', '*://*.tistory.com/manage/post/*'],
  main() {
    console.log('[TistoryMarkdownEditor] Content script loaded on Tistory editor page.');
  },
});
