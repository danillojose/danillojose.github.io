<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { gsap, SplitText } from '@/lib/gsap'
import { useGsapContext } from '@/composables/useGsapContext'
import { projects } from '@/data/projects'
import { profile } from '@/data/profile'
import github from '@/data/github.json'

const { t } = useI18n()
const root = ref(null)

const languages = new Set([...github.repos.flatMap((r) => r.languages), 'JavaScript', 'TypeScript', 'Java'])
const stats = [
  { key: 'years', value: new Date().getFullYear() - profile.githubSince, suffix: '+' },
  { key: 'projects', value: projects.length, suffix: '' },
  { key: 'stores', value: 2, suffix: '' },
  { key: 'langs', value: languages.size, suffix: '' },
]

useGsapContext(root, (self, el) => {
  const split = new SplitText('.about__text', { type: 'words', wordsClass: 'word' })
  const mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // Texto revelado palavra a palavra conforme a rolagem.
    gsap.fromTo(split.words, { opacity: 0.12 }, {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: '.about__text', start: 'top 80%', end: 'bottom 45%', scrub: true },
    })
    gsap.from('.about__photo', {
      clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'expo.custom',
      scrollTrigger: { trigger: '.about__photo', start: 'top 85%' },
    })
  })
  // Contadores.
  el.querySelectorAll('[data-count]').forEach((n) => {
    const obj = { v: 0 }
    gsap.to(obj, {
      v: Number(n.dataset.count), duration: 2, ease: 'power3.out',
      scrollTrigger: { trigger: n, start: 'top 90%' },
      onUpdate: () => (n.textContent = Math.round(obj.v)),
    })
  })
  return () => { mm.revert(); split.revert() }
})
</script>

<template>
  <section id="about" ref="root" class="about section" aria-labelledby="about-label">
    <div class="container about__grid">
      <div class="about__side">
        <span id="about-label" class="label">{{ t('about.label') }}</span>
        <figure class="about__photo">
          <img :src="github.user.avatar + '&s=480'" :alt="profile.name" width="240" height="240" loading="lazy" />
        </figure>
      </div>
      <div>
        <p class="about__text">{{ t('about.text') }}</p>
        <dl class="about__stats">
          <div v-for="s in stats" :key="s.key" class="about__stat">
            <dt>{{ t(`about.stats.${s.key}`) }}</dt>
            <dd><span :data-count="s.value">{{ s.value }}</span>{{ s.suffix }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about__grid { display: grid; grid-template-columns: minmax(180px, 1fr) 3fr; gap: clamp(2rem, 6vw, 6rem); }
.about__side { display: flex; flex-direction: column; gap: 2rem; }
.about__photo {
  margin: 0; width: min(100%, 240px); aspect-ratio: 1; border-radius: var(--radius); overflow: hidden;
  filter: grayscale(1) contrast(1.1);
  transition: filter 0.6s;
}
.about__photo:hover { filter: none; }
.about__photo img { width: 100%; height: 100%; object-fit: cover; }
.about__text {
  font-size: clamp(1.6rem, 3.4vw, 3.2rem);
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.025em;
}
.about__stats {
  margin: clamp(3rem, 6vw, 5rem) 0 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid var(--line);
}
.about__stat { padding: 1.5rem 1rem 0 0; display: flex; flex-direction: column-reverse; gap: 0.4rem; }
.about__stat dt { font-family: var(--font-mono); font-size: 0.75rem; text-transform: uppercase; color: var(--muted); }
.about__stat dd { margin: 0; font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 700; letter-spacing: -0.04em; line-height: 1; color: var(--accent-ink); }
@media (max-width: 900px) {
  .about__grid { grid-template-columns: 1fr; }
  .about__side { flex-direction: row; justify-content: space-between; align-items: flex-start; }
  .about__photo { width: 120px; }
  .about__stats { grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 1.5rem; }
}
</style>
