<script setup>
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { gsap, Flip, ScrollTrigger, reducedMotion } from '@/lib/gsap'
import { useGsapContext } from '@/composables/useGsapContext'
import { projects } from '@/data/projects'
import ProjectCard from './ProjectCard.vue'

const { t } = useI18n()
const root = ref(null)
const grid = ref(null)
const active = ref('all')

// Filtros: tecnologias que aparecem em pelo menos 2 projetos, mais frequentes primeiro.
const filters = computed(() => {
  const count = {}
  projects.forEach((p) => p.stack.forEach((s) => (count[s] = (count[s] || 0) + 1)))
  return Object.entries(count).filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).map(([s]) => s).slice(0, 8)
})
const matches = (p) => active.value === 'all' || p.stack.includes(active.value)
const visibleCount = computed(() => projects.filter(matches).length)

async function setFilter(f) {
  if (f === active.value) return
  const items = grid.value.querySelectorAll('.archive__item')
  const state = Flip.getState(items)
  active.value = f
  await nextTick()
  if (reducedMotion()) return ScrollTrigger.refresh()
  Flip.from(state, {
    duration: 0.7,
    ease: 'expo.custom',
    absolute: true,
    stagger: 0.03,
    scale: true,
    onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.6, delay: 0.15 }),
    onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.85, duration: 0.4 }),
    onComplete: () => ScrollTrigger.refresh(),
  })
}

useGsapContext(root, () => {
  if (reducedMotion()) return
  gsap.from('.archive__item', {
    y: 80, autoAlpha: 0, stagger: 0.08, duration: 1,
    scrollTrigger: { trigger: grid.value, start: 'top 85%' },
  })
})
</script>

<template>
  <section ref="root" class="archive section" aria-labelledby="archive-title">
    <div class="container">
      <div class="archive__head">
        <h2 id="archive-title" class="display archive__title">{{ t('work.archiveTitle') }}<sup>{{ projects.length }}</sup></h2>
        <p class="archive__text">{{ t('work.archiveText') }}</p>
      </div>
      <div class="archive__filters" role="group" :aria-label="t('project.stack')">
        <button class="chip archive__filter" :class="{ on: active === 'all' }" :aria-pressed="active === 'all'" @click="setFilter('all')">{{ t('work.all') }}</button>
        <button v-for="f in filters" :key="f" class="chip archive__filter" :class="{ on: active === f }" :aria-pressed="active === f" @click="setFilter(f)">{{ f }}</button>
      </div>
      <div ref="grid" class="archive__grid">
        <div v-for="(p, i) in projects" v-show="matches(p)" :key="p.slug" class="archive__item" :data-flip-id="p.slug">
          <ProjectCard :project="p" :index="i" size="small" />
        </div>
      </div>
      <p v-if="!visibleCount" class="archive__empty">{{ t('work.empty') }}</p>
    </div>
  </section>
</template>

<style scoped>
.archive__head { display: flex; justify-content: space-between; align-items: flex-end; gap: 2rem; flex-wrap: wrap; margin-bottom: 2rem; }
.archive__title sup { font-family: var(--font-mono); font-size: 0.9rem; font-weight: 500; color: var(--accent-ink); vertical-align: top; margin-left: 0.4rem; letter-spacing: 0; }
.archive__text { color: var(--muted); max-width: 34ch; }
.archive__filters { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 2.5rem; }
.archive__filter { padding: 0.55rem 1rem; transition: background-color 0.3s, color 0.3s, border-color 0.3s; }
.archive__filter:hover { border-color: var(--fg); }
.archive__filter.on { background: var(--accent); color: var(--on-accent); border-color: var(--accent); }
.archive__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 3rem 1.5rem; }
.archive__empty { color: var(--muted); padding: 2rem 0; }
</style>
