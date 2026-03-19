import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'Tistory Markdown Editor',
    description: 'Tistory 블로그에 마크다운 WYSIWYG 에디터를 제공합니다.',
    permissions: ['storage'],
  },
});
