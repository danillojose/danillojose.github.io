import { onMounted, onBeforeUnmount } from 'vue'
import { gsap } from '@/lib/gsap'

// Cria um gsap.context escopado ao elemento do componente e o reverte ao desmontar.
// setup recebe (self, el) e pode retornar uma função de limpeza.
export function useGsapContext(rootRef, setup) {
  let ctx
  onMounted(() => {
    ctx = gsap.context((self) => setup(self, rootRef.value), rootRef.value)
  })
  onBeforeUnmount(() => ctx?.revert())
  return { get ctx() { return ctx } }
}
