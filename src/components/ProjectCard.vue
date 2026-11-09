<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { reducedMotion } from '@/lib/gsap'
import { pick } from '@/i18n'
import { app } from '@/state'
import ProjectCover from './ProjectCover.vue'

const props = defineProps({
  project: { type: Object, required: true },
  index: { type: Number, default: 0 },
  size: { type: String, default: 'large' }, // large | small
})
const { t } = useI18n()
const hovered = ref(false)
const cover = ref(null)

// Guarda a posição da capa antes de navegar; ProjectView anima a capa a partir daqui.
function open(navigate, e) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
  e.preventDefault()
  if (!reducedMotion()) {
    // FLIP entre rotas: guarda o retângulo da capa na viewport (a página nova começa no topo).
    const r = cover.value.getBoundingClientRect()
    app.flipState = { left: r.left, top: r.top, width: r.width, height: r.height }
    app.flipNav = true
  }
  navigate()
}
</script>

<template>
  <router-link v-slot="{ href, navigate }" :to="`/projeto/${project.slug}`" custom>
    <a
      :href="href"
      class="card"
      :class="`card--${size}`"
      data-cursor-label
      :data-cursor="t('cursor.view')"
      @click="open(navigate, $event)"
      @pointerenter="hovered = true"
      @pointerleave="hovered = false"
      @focus="hovered = true"
      @blur="hovered = false"
    >
      <div ref="cover" class="card__cover" :data-flip-id="`cover-${project.slug}`">
        <div class="card__cover-inner"><ProjectCover :project="project" :active="hovered" /></div>
        <span class="badge" :class="`badge--${project.visibility}`">{{ t(`work.${project.visibility}`) }}</span>
      </div>
      <div class="card__body">
        <span class="card__index">{{ String(index + 1).padStart(2, '0') }}</span>
        <div class="card__text">
          <h3 class="card__title">{{ project.title }}</h3>
          <p class="card__tagline">{{ pick(project.tagline) }}</p>
        </div>
        <span class="card__year">{{ project.year }}</span>
      </div>
      <ul class="card__stack" :aria-label="t('project.stack')">
        <li v-for="s in project.stack.slice(0, size === 'large' ? 6 : 3)" :key="s" class="chip">{{ s }}</li>
      </ul>
    </a>
  </router-link>
</template>

<style scoped>
.card { display: flex; flex-direction: column; gap: 1.1rem; color: var(--fg); }
.card__cover {
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--bg-2);
  transform: translateZ(0);
}
.card__cover-inner { position: absolute; inset: 0; transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1); }
.card:hover .card__cover-inner, .card:focus-visible .card__cover-inner { transform: scale(1.05); }
.card .badge { position: absolute; top: 1rem; left: 1rem; }
.card__body { display: grid; grid-template-columns: auto 1fr auto; gap: 1rem; align-items: baseline; }
.card__index, .card__year { font-family: var(--font-mono); font-size: 0.78rem; color: var(--muted); }
.card__title { font-size: clamp(1.6rem, 3vw, 2.6rem); font-weight: 700; letter-spacing: -0.03em; line-height: 1; }
.card__tagline { color: var(--muted); margin-top: 0.45rem; }
.card__stack { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.card--small .card__title { font-size: 1.35rem; }
.card--small .card__tagline { font-size: 0.92rem; }
.card--small .card__cover { aspect-ratio: 4 / 3; }
</style>
