<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { gsap, reducedMotion } from '@/lib/gsap'

// Cursor customizado: ponto + anel com rótulo. Elementos com data-cursor="Texto" expandem o anel e mostram o texto.
const enabled = ref(false)
const dot = ref(null)
const ring = ref(null)
const label = ref('')
let cleanup = () => {}
const route = useRoute()

function reset() {
  label.value = ''
  if (!ring.value) return
  gsap.to(ring.value, { scale: 1, backgroundColor: 'transparent', borderColor: 'var(--fg)', duration: 0.4 })
  gsap.to(dot.value, { scale: 1, duration: 0.3 })
}
// O elemento sob o cursor some na troca de rota sem disparar pointerout.
watch(() => route.fullPath, reset)

onMounted(() => {
  if (reducedMotion() || !window.matchMedia('(pointer: fine)').matches) return
  enabled.value = true
  document.body.classList.add('has-cursor')

  requestAnimationFrame(() => {
    gsap.set([dot.value, ring.value], { xPercent: -50, yPercent: -50, autoAlpha: 0 })
    const dx = gsap.quickTo(dot.value, 'x', { duration: 0.1, ease: 'power3' })
    const dy = gsap.quickTo(dot.value, 'y', { duration: 0.1, ease: 'power3' })
    const rx = gsap.quickTo(ring.value, 'x', { duration: 0.5, ease: 'power3' })
    const ry = gsap.quickTo(ring.value, 'y', { duration: 0.5, ease: 'power3' })
    let visible = false

    const move = (e) => {
      if (!visible) { gsap.to([dot.value, ring.value], { autoAlpha: 1, duration: 0.3 }); visible = true }
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY)
    }
    const over = (e) => {
      const target = e.target.closest('[data-cursor], a, button')
      if (!target) return
      const text = target.dataset?.cursor || ''
      label.value = text
      gsap.to(ring.value, { scale: text ? 2.6 : 1.6, backgroundColor: text ? 'var(--accent)' : 'transparent', borderColor: 'var(--accent)', duration: 0.4 })
      gsap.to(dot.value, { scale: 0, duration: 0.3 })
    }
    const out = (e) => {
      const target = e.target.closest('[data-cursor], a, button')
      if (!target || target.contains(e.relatedTarget)) return
      reset()
    }
    const down = () => gsap.to(ring.value, { scale: '-=0.3', duration: 0.15 })
    const up = () => gsap.to(ring.value, { scale: '+=0.3', duration: 0.3 })
    const leaveWin = () => { gsap.to([dot.value, ring.value], { autoAlpha: 0, duration: 0.3 }); visible = false }

    window.addEventListener('pointermove', move)
    document.addEventListener('pointerover', over)
    document.addEventListener('pointerout', out)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.documentElement.addEventListener('pointerleave', leaveWin)
    cleanup = () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      document.removeEventListener('pointerout', out)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('pointerleave', leaveWin)
      document.body.classList.remove('has-cursor')
    }
  })
})
onBeforeUnmount(() => cleanup())
</script>

<template>
  <template v-if="enabled">
    <div ref="ring" class="cursor-ring" aria-hidden="true"><span>{{ label }}</span></div>
    <div ref="dot" class="cursor-dot" aria-hidden="true"></div>
  </template>
</template>

<style scoped>
.cursor-dot, .cursor-ring {
  position: fixed; top: 0; left: 0; z-index: 150;
  pointer-events: none; border-radius: 50%;
}
.cursor-dot { width: 6px; height: 6px; background: var(--accent); }
.cursor-ring {
  width: 36px; height: 36px;
  border: 1px solid var(--fg);
  display: grid; place-items: center;
  mix-blend-mode: normal;
}
.cursor-ring span {
  font-family: var(--font-mono);
  font-size: 5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--on-accent);
}
</style>
