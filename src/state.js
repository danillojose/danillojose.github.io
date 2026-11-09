import { reactive } from 'vue'

// Estado global mínimo: preloader concluído e estado do Flip entre rotas (card → header do case).
export const app = reactive({
  loaded: false,
  flipState: null, // retângulo da capa do card clicado
  flipNav: false, // navegação iniciada por um card (a transição de página cede lugar ao Flip)
  theme: 'dark',
})
