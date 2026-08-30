import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/yidi-zhangportfolio/' : '/',
  server: {
    port: 3000,
    open: true,
  },
});
