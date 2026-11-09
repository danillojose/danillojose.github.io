<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { gsap, SplitText, reducedMotion } from '@/lib/gsap'
import { useGsapContext } from '@/composables/useGsapContext'
import { scrollToTarget } from '@/composables/useLenis'
import { profile } from '@/data/profile'

const { t } = useI18n()
const root = ref(null)
const year = new Date().getFullYear()

useGsapContext(root, () => {
  if (reducedMotion()) return
  const split = new SplitText('.contact__title', { type: 'lines,words', linesClass: 'split-mask', wordsClass: 'word' })
  gsap.timeline({ scrollTrigger: { trigger: root.value, start: 'top 65%' } })
    .from(split.words, { yPercent: 110, rotate: 4, stagger: 0.04, duration: 1.1, ease: 'expo.custom' })
    .from('.contact__fade', { y: 30, autoAlpha: 0, stagger: 0.1, duration: 0.9 }, 0.4)
  // Fundo do rodapé "sobe" enquanto a seção entra.
  gsap.from('.contact__bg', {
    yPercent: 30, ease: 'none',
    scrollTrigger: { trigger: root.value, start: 'top bottom', end: 'bottom bottom', scrub: true },
  })
  return () => split.revert()
})
</script>

<template>
  <section id="contact" ref="root" class="contact" aria-labelledby="contact-title">
    <div class="contact__bg" aria-hidden="true"></div>
    <div class="container contact__inner">
      <span class="label contact__fade">{{ t('contact.label') }}</span>
      <h2 id="contact-title" class="contact__title">{{ t('contact.title') }}</h2>
      <p class="contact__text contact__fade">{{ t('contact.text') }}</p>

      <div class="contact__actions contact__fade">
        <a v-if="profile.email" :href="`mailto:${profile.email}`" class="contact__email" :data-cursor="t('cursor.open')">{{ profile.email }}</a>
        <a :href="profile.github" target="_blank" rel="noopener" class="btn btn--accent" v-magnetic="0.4" :data-cursor="t('cursor.open')">
          <span data-magnetic-inner>{{ t('contact.cta') }} ↗</span>
        </a>
        <a v-if="profile.linkedin" :href="profile.linkedin" target="_blank" rel="noopener" class="btn" v-magnetic="0.4">
          <span data-magnetic-inner>LinkedIn ↗</span>
        </a>
      </div>

      <footer class="contact__footer">
        <span>© {{ year }} {{ profile.name }}</span>
        <span>{{ t('contact.rights') }}</span>
        <button class="contact__top" @click="scrollToTarget(0)">{{ t('contact.top') }} ↑</button>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.contact { position: relative; overflow: hidden; padding-top: clamp(6rem, 14vw, 12rem); }
.contact__bg {
  position: absolute; inset: 0; z-index: 0;
  background: radial-gradient(80% 60% at 50% 110%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%);
}
.contact__inner { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 2rem; }
.contact__title {
  font-size: clamp(3rem, 10vw, 10rem);
  font-weight: 800;
  line-height: 0.92;
  letter-spacing: -0.05em;
  max-width: 12ch;
}
.contact__title :deep(.word) { display: inline-block; }
.contact__text { color: var(--muted); font-size: 1.15rem; max-width: 40ch; }
.contact__actions { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; }
.contact__email {
  width: 100%;
  font-size: clamp(1.5rem, 4.5vw, 3.5rem); font-weight: 600; letter-spacing: -0.03em;
  background: linear-gradient(var(--accent), var(--accent)) left bottom / 0 3px no-repeat;
  transition: background-size 0.6s cubic-bezier(0.76, 0, 0.24, 1);
  overflow-wrap: anywhere;
}
.contact__email:hover { background-size: 100% 3px; }
.contact__footer {
  margin-top: clamp(4rem, 10vw, 8rem);
  padding-block: 2rem;
  border-top: 1px solid var(--line);
  display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
  font-family: var(--font-mono); font-size: 0.75rem; text-transform: uppercase; color: var(--muted);
}
.contact__top:hover { color: var(--accent-ink); }
</style>
