<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { gsap, SplitText } from '@/lib/gsap'
import { useGsapContext } from '@/composables/useGsapContext'
import { featured } from '@/data/projects'
import ProjectCard from './ProjectCard.vue'

const { t } = useI18n()
const root = ref(null)
const track = ref(null)
const progress = ref(null)
const counter = ref(null)

useGsapContext(root, () => {
  const split = new SplitText('.rail__title', { type: 'words,chars', charsClass: 'char' })
  gsap.from(split.chars, {
    yPercent: 100, autoAlpha: 0, stagger: 0.02, duration: 0.9,
    scrollTrigger: { trigger: '.rail__title', start: 'top 85%' },
  })

  const mm = gsap.matchMedia()
  // Desktop: galeria horizontal pinada; a rolagem vertical move os cards na horizontal.
  mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
    const distance = () => track.value.scrollWidth - window.innerWidth
    const tween = gsap.to(track.value, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: root.value,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          progress.value.style.transform = `scaleX(${self.progress})`
          const i = Math.min(featured.length, Math.floor(self.progress * featured.length) + 1)
          counter.value.textContent = String(i).padStart(2, '0')
        },
      },
    })
    // Cada card: leve parallax interno e entrada inclinada enquanto atravessa a tela.
    gsap.utils.toArray('.rail__item').forEach((item) => {
      gsap.fromTo(item.querySelector('.card__cover-inner'), { xPercent: -8 }, {
        xPercent: 8, ease: 'none',
        scrollTrigger: { trigger: item, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
      })
      gsap.from(item, {
        rotate: 4, yPercent: 8, transformOrigin: 'left bottom', ease: 'none',
        scrollTrigger: { trigger: item, containerAnimation: tween, start: 'left 100%', end: 'left 55%', scrub: true },
      })
    })
  })
  // Mobile: lista vertical com revelação ao entrar.
  mm.add('(max-width: 900px), (prefers-reduced-motion: reduce)', () => {
    gsap.utils.toArray('.rail__item').forEach((item) => {
      gsap.from(item, { y: 60, autoAlpha: 0, duration: 1, scrollTrigger: { trigger: item, start: 'top 88%' } })
    })
  })
  return () => { mm.revert(); split.revert() }
})
</script>

<template>
  <section id="work" ref="root" class="rail" aria-labelledby="work-title">
    <div class="rail__head container">
      <div>
        <span class="label">{{ t('work.label') }}</span>
        <h2 id="work-title" class="rail__title display">{{ t('work.title') }}</h2>
      </div>
      <div class="rail__meta">
        <span class="rail__count"><span ref="counter">01</span> / {{ String(featured.length).padStart(2, '0') }}</span>
        <span class="rail__hint">{{ t('work.hint') }} →</span>
      </div>
    </div>
    <div ref="track" class="rail__track">
      <div v-for="(p, i) in featured" :key="p.slug" class="rail__item">
        <ProjectCard :project="p" :index="i" />
      </div>
    </div>
    <div class="rail__progress container" aria-hidden="true"><div><span ref="progress"></span></div></div>
  </section>
</template>

<style scoped>
.rail {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(1rem, 3vh, 2.5rem);
  padding-block: calc(var(--nav-h) + 0.5rem) 1.5rem;
  overflow: hidden;
}
.rail__head { display: flex; justify-content: space-between; align-items: flex-end; gap: 2rem; flex-wrap: wrap; }
.rail__title { margin-top: 0.75rem; font-size: clamp(2.5rem, 5vw, 4.5rem); }
.rail__title :deep(.char) { display: inline-block; }
.rail__meta { display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem; font-family: var(--font-mono); font-size: 0.78rem; color: var(--muted); }
.rail__count { color: var(--fg); font-size: 1rem; }
.rail__track {
  display: flex;
  gap: clamp(1.5rem, 4vw, 4rem);
  padding-inline: var(--gutter) 12vw;
  width: max-content;
  will-change: transform;
}
.rail__item { width: min(58vw, calc((100svh - 30rem) * 1.6)); min-width: 340px; flex-shrink: 0; }
.rail__progress div { height: 2px; background: var(--line); overflow: hidden; }
.rail__progress span { display: block; height: 100%; background: var(--accent); transform-origin: left; transform: scaleX(0); }

@media (max-width: 900px), (prefers-reduced-motion: reduce) {
  .rail { min-height: 0; padding-block: clamp(5rem, 12vw, 8rem); }
  .rail__track { flex-direction: column; width: 100%; padding-inline: var(--gutter); gap: 3.5rem; }
  .rail__item { width: 100%; min-width: 0; }
  .rail__progress, .rail__hint { display: none; }
  .rail__meta { align-items: flex-start; }
}
</style>
