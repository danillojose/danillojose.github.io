# Portfólio · Danillo José

Portfólio em **Vue 3 + Vite (JavaScript)** com animações **GSAP** (ScrollTrigger, SplitText, ScrambleText, DrawSVG, Flip), smooth scroll com **Lenis** e um campo de partículas **WebGL (OGL)** no hero. Bilíngue (PT/EN), tema claro/escuro e respeito a `prefers-reduced-motion`.

## Rodar

```bash
npm install
npm run dev        # desenvolvimento
npm run build      # atualiza os dados do GitHub, gera dist/ e dist/404.html (SPA no GitHub Pages)
npm run preview    # testa o build
```

## Onde editar o conteúdo

| Arquivo | O que tem |
|---|---|
| `src/data/profile.js` | Nome, e-mail, LinkedIn, localização. **Preencha `email` e `linkedin`.** |
| `src/data/projects.private.js` | Cases dos repositórios privados (GaragemX, EstudaMais, Duelo de Rosas). Textos PT/EN, stack, links, cores da capa. |
| `src/data/projects.js` | Textos PT/EN e stack dos repositórios públicos. Repositórios novos aparecem sozinhos com a descrição do GitHub. |
| `src/data/github.json` | Gerado por `scripts/fetch-github.js` (API pública, sem token). Não editar à mão. |
| `src/locales/pt.js`, `en.js` | Todos os textos da interface, incluindo "Sobre" e a linha do tempo. |

As capas dos projetos são geradas em SVG (`src/components/ProjectCover.vue`) a partir de `palette` e `motif`, então nenhum print de código privado é exposto.

## Deploy no GitHub Pages

1. Crie o repositório **`danillojose.github.io`** e envie este projeto para a branch `main`.
2. Em *Settings → Pages*, escolha **Source: GitHub Actions**.
3. O workflow `.github/workflows/deploy.yml` faz o build e publica a cada push, e toda segunda-feira atualiza os dados públicos do GitHub.

Para publicar em um repositório com outro nome, mude `base` em `vite.config.js` para `'/<nome-do-repo>/'`.

## Estrutura

```
src/
  App.vue                 transições de página (cortina e FLIP card → case)
  lib/gsap.js             registro dos plugins e eases
  composables/useLenis.js smooth scroll ligado ao ticker do GSAP
  gl/HeroField.js         partículas WebGL com ruído simplex e repulsão do cursor
  components/             Preloader, CursorFollower, NavBar, HeroSection, ProjectsRail (galeria pinada),
                          ArchiveGrid (filtros com Flip), AboutSection, StackMarquee, TimelineSection, ContactSection
  views/                  HomeView, ProjectView (/projeto/:slug)
```
