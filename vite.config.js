import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { fileURLToPath, URL } from 'node:url'

// Repositório danillojose.github.io → servido na raiz. Para um repo de projeto, use base: '/<repo>/'.
export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    // Vue DevTools + Inspector: só no `npm run dev` (não entra no build de produção).
    // Inspector: Alt+Shift+clique num elemento abre o componente no VS Code.
    vueDevTools({ launchEditor: 'code' }),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
