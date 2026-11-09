<script setup>
import { onMounted, ref } from 'vue'
import { gsap, ScrollTrigger, reducedMotion } from '@/lib/gsap'
import { initLenis, scrollTopNow, stopScroll, startScroll } from '@/composables/useLenis'
import { app } from '@/state'
import Preloader from '@/components/Preloader.vue'
import CursorFollower from '@/components/CursorFollower.vue'
import NavBar from '@/components/NavBar.vue'

const curtain = ref(null)

onMounted(() => {
  initLenis()
  stopScroll()
})

function onLoaded() {
  app.loaded = true
  startScroll()
  ScrollTrigger.refresh()
}

// Transição entre páginas: cortina diagonal. Se a navegação veio de um card (Flip), a cortina é dispensada
// e a página antiga só some, para o card "voar" até o topo do case.
function onLeave(el, done) {
  if (reducedMotion()) return done()
  if (app.flipNav) {
    gsap.to(el, { autoAlpha: 0, duration: 0.25, ease: 'power1.out', onComplete: done })
    return
  }
  gsap.timeline({ onComplete: done })
    .set(curtain.value, { display: 'block', clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' })
    .to(curtain.value, { clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)', duration: 0.7, ease: 'expo.custom' })
    .to(el, { y: -80, duration: 0.7, ease: 'expo.custom' }, 0)
}

function onEnter(el, done) {
  scrollTopNow()
  ScrollTrigger.refresh()
  const flip = app.flipNav
  app.flipNav = false
  if (reducedMotion() || flip || !app.loaded) return done()
  // clearProps: um transform residual na página quebraria o position: fixed dos pins do ScrollTrigger.
  gsap.timeline({ onComplete: () => { ScrollTrigger.refresh(); done() } })
    .from(el, { y: 120, duration: 0.9, ease: 'out.soft', clearProps: 'transform' }, 0.05)
    .to(curtain.value, { clipPath: 'polygon(0 0%, 100% 0%, 100% 0%, 0 0%)', duration: 0.7, ease: 'expo.custom' }, 0)
    .set(curtain.value, { display: 'none' })
}
</script>

<template>
  <a class="skip" href="#main">Pular para o conteúdo</a>
  <Preloader v-if="!app.loaded" @done="onLoaded" />
  <CursorFollower />
  <NavBar />
  <main id="main">
    <router-view v-slot="{ Component, route }">
      <Transition :css="false" mode="out-in" @leave="onLeave" @enter="onEnter">
        <component :is="Component" :key="route.path" />
      </Transition>
    </router-view>
  </main>
  <div ref="curtain" class="curtain" aria-hidden="true">
    <span>Danillo José</span>
  </div>
  <div class="grain" aria-hidden="true"></div>
</template>

<style scoped>
.skip {
  position: fixed; top: -100px; left: 1rem; z-index: 200;
  background: var(--accent); color: var(--on-accent); padding: 0.75rem 1rem; border-radius: 8px;
}
.skip:focus { top: 1rem; }
.curtain {
  display: none;
  position: fixed; inset: 0; z-index: 80;
  background: var(--accent);
  color: var(--on-accent);
  pointer-events: none;
}
.curtain span {
  position: absolute; left: var(--gutter); bottom: var(--gutter);
  font-weight: 800; font-size: clamp(2rem, 6vw, 5rem); letter-spacing: -0.04em;
}
</style>
