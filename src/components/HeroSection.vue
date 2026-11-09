<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { gsap, SplitText, ScrollTrigger, reducedMotion } from '@/lib/gsap'
import { HeroField } from '@/gl/HeroField'
import { scrollToTarget } from '@/composables/useLenis'
import { profile } from '@/data/profile'
import { app } from '@/state'

const { t, tm, rt, locale } = useI18n()
const root = ref(null)
const canvasWrap = ref(null)
const roleWord = ref(null)
const time = ref('')
let ctx, field, tick, clock, roleTl, splits = []

const themeColors = () =>
  app.theme === 'light' ? ['#6f6b64', '#4f7a00'] : ['#7d7a74', '#c6ff3d']

function updateClock() {
  time.value = new Intl.DateTimeFormat(locale.value === 'pt' ? 'pt-BR' : 'en-US', {
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Fortaleza',
  }).format(new Date())
}

// Palavra do papel girando como um flap de aeroporto.
function startRoles() {
  roleTl?.kill()
  const words = tm('hero.roles').map((w) => rt(w))
  let i = 0
  roleWord.value.textContent = words[0]
  if (reducedMotion()) return
  roleTl = gsap.timeline({ repeat: -1, repeatDelay: 1.6 })
  roleTl.to(roleWord.value, { yPercent: -100, autoAlpha: 0, duration: 0.45, ease: 'power3.in' })
    .call(() => { i = (i + 1) % words.length; roleWord.value.textContent = words[i] })
    .fromTo(roleWord.value, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'out.soft' })
}

function intro() {
  const reduce = reducedMotion()
  ctx.add(() => {
    const tl = gsap.timeline({ delay: 0.1 })
    if (reduce) { tl.to('.hero__fade', { autoAlpha: 1, duration: 0.6 }); return }
    const chars = splits[0].chars
    tl.from(chars, { yPercent: 110, rotate: 8, duration: 1.3, stagger: 0.035, ease: 'expo.custom' })
      .to('.hero__fade', { autoAlpha: 1, y: 0, stagger: 0.08, duration: 1 }, 0.5)
      .from('.hero__rule', { scaleX: 0, transformOrigin: 'left', duration: 1.4, ease: 'expo.custom' }, 0.4)
    if (field) tl.to(field, { intro: 1, duration: 2.4, ease: 'power2.out' }, 0)
  })
}

onMounted(() => {
  updateClock()
  clock = setInterval(updateClock, 15000)
  const reduce = reducedMotion()

  ctx = gsap.context(() => {
    splits = [new SplitText('.hero__name', { type: 'lines,chars', linesClass: 'split-mask', charsClass: 'char' })]
    gsap.set('.hero__fade', { autoAlpha: 0, y: reduce ? 0 : 30 })

    if (!reduce) {
      // Ao rolar: nome se afasta, partículas sobem e esmaecem.
      gsap.timeline({ scrollTrigger: { trigger: root.value, start: 'top top', end: 'bottom top', scrub: true } })
        .to('.hero__name', { yPercent: -30, scale: 0.92, transformOrigin: 'left bottom', ease: 'none' }, 0)
        .to('.hero__meta', { yPercent: -60, autoAlpha: 0, ease: 'none' }, 0)
    }
  }, root.value)

  if (!reduce) {
    try {
      const [a, b] = themeColors()
      field = new HeroField(canvasWrap.value, { colorA: a, colorB: b })
      let visible = true
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
      io.observe(root.value)
      tick = (time) => visible && !document.hidden && field.render(time)
      gsap.ticker.add(tick)
      ctx.add(() => {
        ScrollTrigger.create({
          trigger: root.value, start: 'top top', end: 'bottom top', scrub: true,
          onUpdate: (s) => (field.scroll = s.progress),
        })
      })
      field._io = io
    } catch (e) {
      field = null // Sem WebGL: o hero continua funcionando sem o fundo.
    }
  }

  startRoles()
  if (app.loaded) intro()
  else watch(() => app.loaded, (v) => v && intro(), { once: true })
})

watch(() => app.theme, () => field?.setColors(...themeColors()))
watch(locale, () => { updateClock(); startRoles() })

onBeforeUnmount(() => {
  clearInterval(clock)
  roleTl?.kill()
  if (tick) gsap.ticker.remove(tick)
  field?._io?.disconnect()
  field?.destroy()
  splits.forEach((s) => s.revert())
  ctx?.revert()
})
</script>

<template>
  <section ref="root" class="hero" aria-labelledby="hero-title">
    <div ref="canvasWrap" class="hero__canvas" aria-hidden="true"></div>

    <div class="hero__content container">
      <div class="hero__top hero__fade">
        <span class="label">{{ t('hero.available') }}</span>
      </div>

      <h1 id="hero-title" class="hero__name">
        <span class="hero__line">{{ profile.firstName }}</span>
        <span class="hero__line hero__line--outline">{{ profile.lastName }}</span>
      </h1>

      <div class="hero__rule" aria-hidden="true"></div>

      <div class="hero__meta">
        <p class="hero__role hero__fade">
          {{ t('hero.role') }}
          <span class="hero__role-sep">/</span>
          <span class="hero__role-word split-mask"><span ref="roleWord"></span></span>
        </p>
        <p class="hero__intro hero__fade">{{ t('hero.intro') }}</p>
        <div class="hero__info hero__fade">
          <span>{{ profile.location[locale] }}</span>
          <span class="hero__clock">{{ time }} <small>GMT−3</small></span>
        </div>
      </div>

      <button class="hero__scroll hero__fade" data-cursor="↓" @click="scrollToTarget('#work')" v-magnetic="0.4">
        <span class="sr-only">{{ t('hero.scroll') }}</span>
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <defs><path id="circlePath" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
          <text><textPath href="#circlePath" textLength="286" lengthAdjust="spacingAndGlyphs">{{ t('hero.scroll') }} · {{ t('hero.scroll') }} · </textPath></text>
          <path d="M60 44v30m-10-10 10 10 10-10" fill="none" stroke="currentColor" stroke-width="2" />
        </svg>
      </button>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  padding-top: var(--nav-h);
}
.hero__canvas { position: absolute; inset: 0; z-index: 0; }
.hero__canvas :deep(canvas) { width: 100% !important; height: 100% !important; }
.hero__content {
  position: relative; z-index: 1;
  padding-bottom: clamp(2rem, 6vh, 4rem);
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 0 2rem;
}
.hero__top { grid-column: 1 / -1; margin-bottom: 1.5rem; }
.hero__name {
  grid-column: 1 / -1;
  font-weight: 800;
  font-size: clamp(4.2rem, 17vw, 17rem);
  line-height: 0.86;
  letter-spacing: -0.055em;
  margin-left: -0.04em;
}
.hero__line { display: block; }
.hero__line--outline { color: transparent; -webkit-text-stroke: 1.5px var(--fg); padding-left: 0.6em; }
.hero__name :deep(.char) { will-change: transform; }
.hero__rule { grid-column: 1 / -1; height: 1px; background: var(--line); margin: clamp(1.5rem, 3vw, 2.5rem) 0; }
.hero__meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem 2rem;
  align-items: start;
}
.hero__role { font-weight: 600; font-size: 1.15rem; display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: baseline; }
.hero__role-sep { color: var(--muted); }
.hero__role-word { display: inline-block; color: var(--accent-ink); min-width: 8ch; }
.hero__role-word span { display: inline-block; }
.hero__intro { color: var(--muted); max-width: 40ch; }
.hero__info { font-family: var(--font-mono); font-size: 0.78rem; display: flex; flex-direction: column; gap: 0.3rem; text-transform: uppercase; color: var(--muted); }
.hero__clock { color: var(--fg); }
.hero__clock small { color: var(--muted); }
.hero__scroll { width: 120px; height: 120px; align-self: end; }
.hero__scroll svg { width: 100%; height: 100%; animation: spin 14s linear infinite; }
.hero__scroll path:last-child { animation: spin 14s linear infinite reverse; transform-origin: 60px 60px; }
.hero__scroll text { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.18em; text-transform: uppercase; fill: currentColor; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .hero__content { grid-template-columns: 1fr; }
  .hero__meta { grid-template-columns: 1fr; }
  .hero__scroll { display: none; }
  .hero__line--outline { padding-left: 0; -webkit-text-stroke-width: 1px; }
}
@media (prefers-reduced-motion: reduce) {
  .hero__scroll svg, .hero__scroll path:last-child { animation: none; }
}
</style>
