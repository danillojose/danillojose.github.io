<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { gsap, reducedMotion } from '@/lib/gsap'
import { useGsapContext } from '@/composables/useGsapContext'

const { t, tm, rt } = useI18n()
const root = ref(null)
const h = ref(1000)
// Caminho sinuoso gerado na altura real da lista (sem esticar o SVG, para o DrawSVG medir certo).
const path = computed(() => {
  const H = h.value, seg = H / 6
  let d = `M20 0`
  for (let i = 0; i < 6; i++) d += ` C ${i % 2 ? 2 : 38} ${seg * i + seg * 0.35}, ${i % 2 ? 2 : 38} ${seg * i + seg * 0.65}, 20 ${seg * (i + 1)}`
  return d
})
const items = computed(() => tm('timeline.items').map((i) => ({ year: rt(i.year), title: rt(i.title), text: rt(i.text) })))

useGsapContext(root, (self, el) => {
  const list = el.querySelector('.timeline__list')
  h.value = list.offsetHeight
  const ro = new ResizeObserver(() => (h.value = list.offsetHeight))
  ro.observe(list)
  self.add(() => () => ro.disconnect())
  if (reducedMotion()) return
  // O caminho é desenhado conforme a rolagem; cada marco acende quando a linha chega nele.
  gsap.fromTo('.timeline__path', { drawSVG: '0%' }, {
    drawSVG: '100%', ease: 'none',
    scrollTrigger: { trigger: '.timeline__list', start: 'top 70%', end: 'bottom 60%', scrub: 0.6 },
  })
  el.querySelectorAll('.timeline__item').forEach((item, i) => {
    gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 72%', toggleActions: 'play none none reverse' } })
      .from(item.querySelector('.timeline__year'), { yPercent: 100, duration: 0.9, ease: 'expo.custom' })
      .from(item.querySelectorAll('.timeline__body > *'), { x: i % 2 ? -40 : 40, autoAlpha: 0, stagger: 0.08, duration: 0.8 }, 0.1)
      .to(item.querySelector('.timeline__dot'), { scale: 1, backgroundColor: 'var(--accent)', duration: 0.5, ease: 'back.out(3)' }, 0)
  })
})
</script>

<template>
  <section id="timeline" ref="root" class="timeline section" aria-labelledby="timeline-title">
    <div class="container">
      <span class="label">{{ t('timeline.label') }}</span>
      <h2 id="timeline-title" class="display timeline__title">{{ t('timeline.title') }}</h2>

      <div class="timeline__wrap">
        <svg class="timeline__svg" :viewBox="`0 0 40 ${h}`" aria-hidden="true">
          <path :d="path" fill="none" stroke="var(--line)" stroke-width="2" />
          <path class="timeline__path" :d="path" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" />
        </svg>
        <ol class="timeline__list">
          <li v-for="(item, i) in items" :key="item.year" class="timeline__item" :class="{ 'is-right': i % 2 }">
            <span class="timeline__dot" aria-hidden="true"></span>
            <div class="timeline__year split-mask"><span>{{ item.year }}</span></div>
            <div class="timeline__body">
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.timeline__title { margin-top: 1rem; max-width: 16ch; font-size: clamp(2.2rem, 5vw, 4.5rem); }
.timeline__wrap { position: relative; margin-top: clamp(3rem, 6vw, 6rem); }
.timeline__svg { position: absolute; left: 50%; top: 0; width: 40px; height: 100%; transform: translateX(-50%); overflow: visible; }
.timeline__list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: clamp(3rem, 8vw, 6rem); }
.timeline__item {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 clamp(3rem, 8vw, 8rem);
  align-items: center;
}
.timeline__dot {
  position: absolute; left: 50%; top: 50%;
  width: 16px; height: 16px; margin: -8px 0 0 -8px; border-radius: 50%;
  background: var(--bg); border: 2px solid var(--accent);
  transform: scale(0.6);
}
.timeline__year { text-align: right; font-size: clamp(3rem, 8vw, 7rem); font-weight: 800; letter-spacing: -0.05em; line-height: 1; }
.timeline__year span { display: inline-block; }
.timeline__body h3 { font-size: 1.4rem; letter-spacing: -0.02em; margin-bottom: 0.4rem; }
.timeline__body p { color: var(--muted); max-width: 38ch; }
.timeline__item.is-right .timeline__year { order: 2; text-align: left; }
.timeline__item.is-right .timeline__body { order: 1; text-align: right; justify-self: end; }
@media (max-width: 760px) {
  .timeline__svg { left: 8px; }
  .timeline__item, .timeline__item.is-right { grid-template-columns: 1fr; padding-left: 3rem; }
  .timeline__dot { left: 8px; top: 2.2rem; }
  .timeline__year, .timeline__item.is-right .timeline__year { order: 0; text-align: left; }
  .timeline__item.is-right .timeline__body { order: 1; text-align: left; justify-self: start; }
}
</style>
