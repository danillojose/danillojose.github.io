<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { gsap, ScrollTrigger, reducedMotion } from '@/lib/gsap'
import { setLocale } from '@/i18n'
import { scrollToTarget, stopScroll, startScroll } from '@/composables/useLenis'
import { app } from '@/state'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const nav = ref(null)
const menu = ref(null)
const open = ref(false)
let st

const links = ['work', 'about', 'stack', 'timeline', 'contact']

try { app.theme = document.documentElement.dataset.theme || 'dark' } catch {}

function toggleTheme() {
  app.theme = app.theme === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = app.theme
  try { localStorage.setItem('theme', app.theme) } catch {}
}

function toggleLocale() {
  setLocale(locale.value === 'pt' ? 'en' : 'pt')
  requestAnimationFrame(() => ScrollTrigger.refresh())
}

async function go(id) {
  if (open.value) toggleMenu()
  if (route.name !== 'home') {
    await router.push('/')
    setTimeout(() => scrollToTarget(`#${id}`), 1300)
  } else scrollToTarget(`#${id}`)
}

function toggleMenu() {
  open.value = !open.value
  if (open.value) stopScroll(); else startScroll()
}

watch(open, (v) => {
  if (!menu.value) return
  if (reducedMotion()) { gsap.set(menu.value, { autoAlpha: v ? 1 : 0 }); return }
  if (v) {
    gsap.timeline()
      .set(menu.value, { autoAlpha: 1, clipPath: 'circle(0% at 100% 0%)' })
      .to(menu.value, { clipPath: 'circle(150% at 100% 0%)', duration: 0.9, ease: 'expo.custom' })
      .from(menu.value.querySelectorAll('.menu__link span'), { yPercent: 110, stagger: 0.06, duration: 0.8 }, 0.25)
  } else {
    gsap.to(menu.value, { clipPath: 'circle(0% at 100% 0%)', duration: 0.6, ease: 'expo.custom', onComplete: () => gsap.set(menu.value, { autoAlpha: 0 }) })
  }
})

onMounted(() => {
  gsap.set(menu.value, { autoAlpha: 0 })
  // Esconde a barra ao descer e mostra ao subir.
  st = ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      if (open.value) return
      const hide = self.direction === 1 && self.scroll() > 200
      gsap.to(nav.value, { yPercent: hide ? -120 : 0, duration: 0.5, ease: 'power3.out', overwrite: true })
      nav.value.classList.toggle('is-scrolled', self.scroll() > 40)
    },
  })
})
onBeforeUnmount(() => st?.kill())
</script>

<template>
  <header ref="nav" class="nav">
    <div class="nav__inner container">
      <router-link to="/" class="nav__logo" data-cursor="Home" aria-label="Danillo José, início">
        <span class="nav__mark">DJ</span>
        <span class="nav__name">Danillo José</span>
      </router-link>

      <nav class="nav__links" aria-label="Principal">
        <button v-for="l in links" :key="l" class="nav__link" @click="go(l)">
          <span data-text>{{ t(`nav.${l}`) }}</span>
        </button>
      </nav>

      <div class="nav__actions">
        <button class="nav__pill" :aria-label="t('nav.lang')" @click="toggleLocale" v-magnetic="0.3">
          <span :class="{ on: locale === 'pt' }">PT</span><span class="sep">/</span><span :class="{ on: locale === 'en' }">EN</span>
        </button>
        <button class="nav__icon" :aria-label="t('nav.theme')" @click="toggleTheme" v-magnetic="0.3">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6" />
            <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
          </svg>
        </button>
        <button class="nav__burger" :aria-expanded="open" aria-controls="menu" @click="toggleMenu">
          {{ open ? t('nav.close') : t('nav.menu') }}
        </button>
      </div>
    </div>
  </header>

  <div id="menu" ref="menu" class="menu" :aria-hidden="!open">
    <nav class="container menu__inner" aria-label="Menu">
      <button v-for="(l, i) in links" :key="l" class="menu__link split-mask" :tabindex="open ? 0 : -1" @click="go(l)">
        <span><small>0{{ i + 1 }}</small>{{ t(`nav.${l}`) }}</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 70;
  height: var(--nav-h);
  transition: background-color 0.4s, backdrop-filter 0.4s;
}
.nav.is-scrolled { background: color-mix(in srgb, var(--bg) 70%, transparent); backdrop-filter: blur(14px); }
.nav__inner { height: 100%; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.nav__logo { display: flex; align-items: center; gap: 0.75rem; font-weight: 700; }
.nav__mark {
  display: grid; place-items: center;
  width: 38px; height: 38px; border-radius: 50%;
  background: var(--accent); color: var(--on-accent);
  font-size: 0.85rem; font-weight: 800;
}
.nav__links { display: flex; gap: 2rem; }
.nav__link {
  font-family: var(--font-mono); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em;
  position: relative; overflow: hidden; height: 1.2em; line-height: 1.2em;
}
.nav__link span { display: block; }
.nav__link::after {
  content: ''; position: absolute; left: 0; bottom: 0; height: 1px; width: 100%;
  background: var(--accent); transform: scaleX(0); transform-origin: right; transition: transform 0.5s cubic-bezier(0.76, 0, 0.24, 1);
}
.nav__link:hover::after { transform: scaleX(1); transform-origin: left; }
.nav__actions { display: flex; align-items: center; gap: 0.5rem; }
.nav__pill, .nav__icon, .nav__burger {
  height: 40px; border: 1px solid var(--line); border-radius: 999px;
  font-family: var(--font-mono); font-size: 0.75rem;
  display: inline-flex; align-items: center; justify-content: center;
}
.nav__pill { padding-inline: 0.9rem; gap: 0.25rem; }
.nav__pill span { color: var(--muted); transition: color 0.3s; }
.nav__pill span.on { color: var(--fg); }
.nav__icon { width: 40px; }
.nav__burger { padding-inline: 1rem; text-transform: uppercase; display: none; }

.menu {
  position: fixed; inset: 0; z-index: 65;
  background: var(--accent); color: var(--on-accent);
  display: flex; align-items: center;
}
.menu__inner { display: flex; flex-direction: column; gap: 0.25rem; }
.menu__link { text-align: left; font-weight: 800; font-size: clamp(2.6rem, 12vw, 6rem); letter-spacing: -0.04em; line-height: 1.05; }
.menu__link span { display: inline-flex; align-items: baseline; gap: 1rem; }
.menu__link small { font-family: var(--font-mono); font-size: 0.8rem; font-weight: 500; }
.menu :focus-visible { outline-color: var(--on-accent); }

@media (max-width: 900px) {
  .nav__links { display: none; }
  .nav__burger { display: inline-flex; }
  .nav__name { display: none; }
}
@media (max-width: 380px) {
  .nav__icon { display: none; }
}
</style>
