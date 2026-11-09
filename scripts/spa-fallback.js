// GitHub Pages não tem rewrite de SPA: 404.html = index.html faz /projeto/:slug funcionar em acesso direto.
import { copyFile } from 'node:fs/promises'
await copyFile(new URL('../dist/index.html', import.meta.url), new URL('../dist/404.html', import.meta.url))
console.log('[spa] dist/404.html criado.')
