<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { gsap, reducedMotion } from '@/lib/gsap'

const emit = defineEmits(['done'])
const { t } = useI18n()
const root = ref(null)
const count = ref(null)
const name = ref(null)
const bar = ref(null)

onMounted(() => {
  if (reducedMotion()) {
    gsap.to(root.value, { autoAlpha: 0, duration: 0.3, onComplete: () => emit('done') })
    return
  }
  const progress = { v: 0 }
  // Espera fontes carregarem (com teto) para o hero entrar já com a tipografia certa.
  const fontsReady = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 2500))])

  const tl = gsap.timeline({ paused: true })
  tl.to(name.value, { duration: 1.4, scrambleText: { text: 'DANILLO JOSÉ', chars: '01<>/{}#*', speed: 0.5 }, ease: 'none' }, 0)
    .to(progress, {
      v: 100, duration: 1.8, ease: 'power3.inOut',
      onUpdate: () => {
        count.value.textContent = String(Math.round(progress.v)).padStart(3, '0')
        bar.value.style.transform = `scaleX(${progress.v / 100})`
      },
    }, 0)
    .to([name.value, count.value], { yPercent: -110, duration: 0.6, ease: 'expo.custom', stagger: 0.05 }, '+=0.15')
    .to(root.value, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.custom' }, '-=0.2')
    .call(() => emit('done'), null, '-=0.55')

  fontsReady.then(() => tl.play())
})
</script>

<template>
  <div ref="root" class="loader" role="status" :aria-label="t('loader.loading')">
    <div class="loader__name split-mask"><span ref="name">&nbsp;</span></div>
    <div class="loader__bottom">
      <span class="label">{{ t('loader.loading') }}</span>
      <div class="split-mask"><span ref="count" class="loader__count">000</span></div>
    </div>
    <div class="loader__track"><div ref="bar" class="loader__bar"></div></div>
  </div>
</template>

<style scoped>
.loader {
  position: fixed; inset: 0; z-index: 100;
  background: var(--bg);
  clip-path: inset(0 0 0 0);
  display: grid;
  place-items: center;
  padding: var(--gutter);
}
.loader__name {
  font-weight: 800;
  font-size: clamp(2.2rem, 9vw, 8rem);
  letter-spacing: -0.04em;
  white-space: nowrap;
}
.loader__name span { display: inline-block; }
.loader__bottom {
  position: absolute;
  left: var(--gutter); right: var(--gutter); bottom: calc(var(--gutter) + 1.5rem);
  display: flex; justify-content: space-between; align-items: flex-end;
}
.loader__count {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: clamp(2.5rem, 8vw, 6rem);
  line-height: 1;
  color: var(--accent-ink);
}
.loader__track { position: absolute; left: 0; right: 0; bottom: 0; height: 4px; background: var(--line); }
.loader__bar { height: 100%; background: var(--accent); transform-origin: left; transform: scaleX(0); }
</style>
