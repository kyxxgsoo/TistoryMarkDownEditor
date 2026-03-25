import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'Tition',
    description: 'Tistory In Notion — Tistory 블로그에 노션 스타일 마크다운 에디터를 제공합니다.',
    permissions: ['storage'],
  },
  vite: () => ({
    esbuild: {
      charset: 'utf8',
    },
  }),
});
