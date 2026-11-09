<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { gsap, ScrollTrigger, reducedMotion } from '@/lib/gsap'
import { useGsapContext } from '@/composables/useGsapContext'

const { t } = useI18n()
const root = ref(null)
const rows = [
  ['Vue.js', 'GSAP', 'JavaScript', 'Nuxt', 'Pinia', 'Vite', 'ScrollTrigger', 'PrimeVue', 'Tailwind', 'WebGL'],
  ['Firebase', 'Capacitor', 'PWA', 'Node.js', 'WebSocket', 'Spring Boot', 'PostgreSQL', 'Docker', 'Java', 'Python'],
]

// Marquee infinito; a velocidade acompanha a rolagem e o sentido inverte quando o usuário rola para cima.
useGsapContext(root, (self, el) => {
  if (reducedMotion()) return
  const loops = [...el.querySelectorAll('.marquee__inner')].map((inner, i) =>
    gsap.to(inner, { xPercent: i % 2 ? 0 : -50, startAt: { xPercent: i % 2 ? -50 : 0 }, duration: 30, ease: 'none', repeat: -1 }),
  )
  loops.forEach((l) => l.totalTime(l.duration() * 1000)) // permite timeScale negativo sem travar no início
  let dir = 1
  ScrollTrigger.create({
    trigger: el, start: 'top bottom', end: 'bottom top',
    onUpdate: (st) => {
      const v = st.getVelocity()
      if (st.direction !== dir) dir = st.direction
      const boost = 1 + Math.min(Math.abs(v) / 300, 6)
      loops.forEach((l) => {
        gsap.to(l, { timeScale: boost * dir, duration: 0.2, overwrite: true })
        gsap.to(l, { timeScale: dir, duration: 1.2, delay: 0.2, ease: 'power2.out' })
      })
      gsap.to('.marquee__row', { skewX: gsap.utils.clamp(-10, 10, v / -250), duration: 0.4, overwrite: true })
    },
  })
})
</script>

<template>
  <section id="stack" ref="root" class="marquee section" aria-labelledby="stack-title">
    <div class="container marquee__head">
      <span class="label">{{ t('stack.label') }}</span>
      <h2 id="stack-title" class="display marquee__title">{{ t('stack.title') }}</h2>
    </div>
    <div v-for="(row, r) in rows" :key="r" class="marquee__row" :class="{ 'marquee__row--alt': r % 2 }">
      <ul class="sr-only"><li v-for="w in row" :key="w">{{ w }}</li></ul>
      <div class="marquee__inner" aria-hidden="true">
        <template v-for="n in 2" :key="n">
          <span v-for="w in row" :key="w + n" class="marquee__word">{{ w }}<i>✦</i></span>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.marquee { overflow: hidden; }
.marquee__head { margin-bottom: clamp(2rem, 5vw, 4rem); }
.marquee__title { margin-top: 1rem; font-size: clamp(2.2rem, 5vw, 4.5rem); }
.marquee__row { border-block: 1px solid var(--line); padding-block: 1.2rem; }
.marquee__row + .marquee__row { border-top: 0; }
.marquee__inner { display: flex; width: max-content; will-change: transform; }
.marquee__word {
  display: inline-flex; align-items: center; gap: clamp(1.5rem, 3vw, 3rem); padding-right: clamp(1.5rem, 3vw, 3rem);
  font-size: clamp(2.4rem, 7vw, 6rem); font-weight: 700; letter-spacing: -0.04em; white-space: nowrap; line-height: 1;
}
.marquee__word i { font-style: normal; font-size: 0.4em; color: var(--accent-ink); }
.marquee__row--alt .marquee__word { color: transparent; -webkit-text-stroke: 1px var(--fg); }
.marquee__row--alt .marquee__word i { -webkit-text-stroke: 0; }
@media (prefers-reduced-motion: reduce) {
  .marquee__inner { flex-wrap: wrap; width: auto; padding-inline: var(--gutter); }
}
</style>
