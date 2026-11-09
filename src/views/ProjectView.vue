<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { gsap, SplitText, ScrollTrigger, reducedMotion } from '@/lib/gsap'
import { pick } from '@/i18n'
import { app } from '@/state'
import { projects, findProject } from '@/data/projects'
import ProjectCover from '@/components/ProjectCover.vue'

const props = defineProps({ slug: { type: String, required: true } })
const { t } = useI18n()
const root = ref(null)
const cover = ref(null)
const project = computed(() => findProject(props.slug))
const next = computed(() => {
  const i = projects.findIndex((p) => p.slug === props.slug)
  return projects[(i + 1) % projects.length]
})
const highlights = computed(() => pick(project.value?.highlights) || [])
// Tamanho da maior palavra do título: o CSS reduz a fonte para essa palavra caber inteira na largura.
const longestWord = computed(() => Math.max(...(project.value?.title || '').split(/\s+/).map((w) => w.length)))
let ctx

onMounted(() => {
  document.title = project.value ? `${project.value.title} · Danillo José` : 'Danillo José'
  if (!project.value) return
  const reduce = reducedMotion()
  const flipState = app.flipState
  app.flipState = null

  ctx = gsap.context(() => {}, root.value)
  // Em acesso direto, espera o preloader terminar antes de animar.
  if (app.loaded) animate(reduce, flipState)
  else watch(() => app.loaded, (v) => v && animate(reduce, flipState), { once: true })
  requestAnimationFrame(() => ScrollTrigger.refresh())
})

function animate(reduce, flipState) {
  ctx.add(() => {
    if (reduce) return
    // words + chars: as letras ficam dentro de um wrapper por palavra, então a quebra de linha só acontece entre palavras.
    const split = new SplitText('.case__title', { type: 'words,chars', wordsClass: 'word', charsClass: 'char' })
    const tl = gsap.timeline({ delay: flipState ? 0.35 : 0.15 })
    tl.from(split.chars, { yPercent: 110, stagger: 0.03, duration: 1.1, ease: 'expo.custom' })
      .from('.case__fade', { y: 30, autoAlpha: 0, stagger: 0.07, duration: 0.9 }, 0.3)

    // A capa do card "voa" para a posição do header.
    if (flipState) {
      // First/Last/Invert/Play: parte do retângulo do card e assenta no lugar final.
      const last = cover.value.getBoundingClientRect()
      gsap.from(cover.value, {
        x: flipState.left - last.left, y: flipState.top - last.top,
        width: flipState.width, height: flipState.height,
        duration: 1.2, ease: 'expo.custom', clearProps: 'x,y,width,height',
      })
    } else {
      gsap.from(cover.value, { clipPath: 'inset(20% 10% 20% 10% round 24px)', duration: 1.4, ease: 'expo.custom', delay: 0.2 })
    }

    gsap.to('.case__cover-inner', {
      yPercent: 12, ease: 'none',
      scrollTrigger: { trigger: cover.value, start: 'top top', end: 'bottom top', scrub: true },
    })
    gsap.utils.toArray('.case__reveal').forEach((el) => {
      gsap.from(el, { y: 60, autoAlpha: 0, duration: 1, scrollTrigger: { trigger: el, start: 'top 88%' } })
    })
    gsap.from('.case__highlight', {
      x: -30, autoAlpha: 0, stagger: 0.08, duration: 0.8,
      scrollTrigger: { trigger: '.case__highlights', start: 'top 80%' },
    })
    gsap.from('.case__next-title', {
      yPercent: 100, duration: 1.2, ease: 'expo.custom',
      scrollTrigger: { trigger: '.case__next', start: 'top 85%' },
    })
  })
}
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <article v-if="project" ref="root" class="case">
    <header class="case__head container">
      <router-link to="/" class="case__back case__fade" :data-cursor="t('project.back')">← {{ t('project.back') }}</router-link>
      <div class="case__meta case__fade">
        <span class="badge" :class="`badge--${project.visibility}`">{{ t(`work.${project.visibility}`) }}</span>
        <span class="label">{{ project.year }}</span>
      </div>
      <h1 class="case__title split-mask" :style="{ '--longest': longestWord }">{{ project.title }}</h1>
      <p class="case__tagline case__fade">{{ pick(project.tagline) }}</p>
    </header>

    <div class="container">
      <div class="case__cover-slot">
        <div ref="cover" class="case__cover" :data-flip-id="`cover-${project.slug}`">
          <div class="case__cover-inner"><ProjectCover :project="project" idle /></div>
        </div>
      </div>
    </div>

    <section class="container case__grid">
      <dl class="case__facts case__reveal">
        <div v-if="project.role"><dt>{{ t('project.role') }}</dt><dd>{{ pick(project.role) }}</dd></div>
        <div><dt>{{ t('project.year') }}</dt><dd>{{ project.year }}</dd></div>
        <div>
          <dt>{{ t('project.visibility') }}</dt>
          <dd>{{ project.visibility === 'private' ? t('project.privateNote') : 'GitHub' }}</dd>
        </div>
        <div class="case__links">
          <a v-if="project.links.live" :href="project.links.live" target="_blank" rel="noopener" class="btn btn--accent" v-magnetic :data-cursor="t('cursor.open')">
            <span data-magnetic-inner>{{ t('project.live') }} ↗</span>
          </a>
          <a v-if="project.links.repo" :href="project.links.repo" target="_blank" rel="noopener" class="btn" v-magnetic :data-cursor="t('cursor.open')">
            <span data-magnetic-inner>{{ t('project.repo') }} ↗</span>
          </a>
        </div>
      </dl>

      <div class="case__content">
        <div class="case__block case__reveal">
          <h2 class="label">{{ t('project.overview') }}</h2>
          <p class="case__lead">{{ pick(project.summary) }}</p>
        </div>
        <div v-if="project.challenge" class="case__block case__reveal">
          <h2 class="label">{{ t('project.challenge') }}</h2>
          <p>{{ pick(project.challenge) }}</p>
        </div>
        <div v-if="highlights.length" class="case__block">
          <h2 class="label case__reveal">{{ t('project.highlights') }}</h2>
          <ol class="case__highlights">
            <li v-for="(h, i) in highlights" :key="i" class="case__highlight">
              <span>{{ String(i + 1).padStart(2, '0') }}</span>{{ h }}
            </li>
          </ol>
        </div>
        <div class="case__block case__reveal">
          <h2 class="label">{{ t('project.stack') }}</h2>
          <ul class="case__stack"><li v-for="s in project.stack" :key="s" class="chip">{{ s }}</li></ul>
        </div>
      </div>
    </section>

    <router-link :to="`/projeto/${next.slug}`" class="case__next" :data-cursor="t('cursor.view')">
      <div class="container">
        <span class="label">{{ t('project.next') }}</span>
        <div class="split-mask"><span class="case__next-title">{{ next.title }} →</span></div>
      </div>
    </router-link>
  </article>

  <div v-else class="container case__missing">
    <p>{{ t('project.notFound') }}</p>
    <router-link to="/" class="btn">← {{ t('project.back') }}</router-link>
  </div>
</template>

<style scoped>
.case { padding-top: calc(var(--nav-h) + 2rem); }
.case__head { display: flex; flex-direction: column; gap: 1.2rem; padding-bottom: clamp(2rem, 4vw, 3rem); }
.case__back { font-family: var(--font-mono); font-size: 0.8rem; text-transform: uppercase; color: var(--muted); align-self: flex-start; }
.case__back:hover { color: var(--accent-ink); }
.case__meta { display: flex; gap: 1rem; align-items: center; }
.case__meta .badge { background: var(--bg-2); color: var(--fg); }
.case__title {
  /* O menor entre o tamanho de design e o que faz a maior palavra caber (~0.62em por letra nesta fonte). */
  font-size: min(clamp(3.5rem, 13vw, 13rem), calc((100vw - 2 * var(--gutter)) / (var(--longest, 8) * 0.62)));
  font-weight: 800;
  letter-spacing: -0.055em;
  line-height: 0.88;
  overflow-wrap: normal;
  word-break: normal;
  hyphens: none;
  text-wrap: balance;
}
.case__title :deep(.word) { display: inline-block; white-space: nowrap; }
.case__title :deep(.char) { display: inline-block; }
.case__tagline { font-size: clamp(1.2rem, 2.2vw, 1.8rem); color: var(--muted); max-width: 36ch; }
.case__cover-slot { position: relative; aspect-ratio: 21 / 9; }
.case__cover { position: absolute; inset: 0; border-radius: var(--radius); overflow: hidden; background: var(--bg-2); z-index: 2; }
.case__cover-inner { position: absolute; inset: -8% 0; }
.case__grid {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 2.2fr;
  gap: clamp(2rem, 6vw, 7rem);
  padding-block: clamp(4rem, 9vw, 8rem);
}
.case__facts { margin: 0; display: flex; flex-direction: column; gap: 1.6rem; align-self: start; position: sticky; top: calc(var(--nav-h) + 1.5rem); }
.case__facts dt { font-family: var(--font-mono); font-size: 0.72rem; text-transform: uppercase; color: var(--muted); margin-bottom: 0.3rem; }
.case__facts dd { margin: 0; }
.case__links { display: flex; flex-direction: column; align-items: flex-start; gap: 0.75rem; }
.case__content { display: flex; flex-direction: column; gap: clamp(3rem, 6vw, 5rem); }
.case__block { display: flex; flex-direction: column; gap: 1.2rem; }
.case__block p { font-size: 1.15rem; color: var(--muted); max-width: 60ch; }
.case__block .case__lead { font-size: clamp(1.4rem, 2.6vw, 2.2rem); color: var(--fg); line-height: 1.25; letter-spacing: -0.02em; }
.case__highlights { list-style: none; padding: 0; margin: 0; border-top: 1px solid var(--line); }
.case__highlight {
  display: grid; grid-template-columns: 3rem 1fr; gap: 1rem;
  padding-block: 1.1rem; border-bottom: 1px solid var(--line); font-size: 1.1rem;
}
.case__highlight span { font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-ink); padding-top: 0.25rem; }
.case__stack { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.case__next { display: block; border-top: 1px solid var(--line); padding-block: clamp(4rem, 10vw, 8rem); transition: background-color 0.5s, color 0.5s; }
.case__next:hover { background: var(--accent); color: var(--on-accent); }
.case__next:hover .label { color: var(--on-accent); }
.case__next-title { display: inline-block; margin-top: 1rem; font-size: clamp(2.8rem, 9vw, 9rem); font-weight: 800; letter-spacing: -0.05em; line-height: 1; }
.case__missing { padding-top: 40vh; min-height: 80vh; display: flex; flex-direction: column; gap: 1.5rem; align-items: flex-start; }
@media (max-width: 900px) {
  .case__grid { grid-template-columns: 1fr; }
  .case__facts { position: static; }
  .case__cover-slot { aspect-ratio: 4 / 3; }
}
</style>
