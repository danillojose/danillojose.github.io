import Lenis from 'lenis'
import { gsap, ScrollTrigger, reducedMotion } from '@/lib/gsap'

let lenis = null

// Smooth scroll sincronizado com o ticker do GSAP (um único loop de animação para tudo).
export function initLenis() {
  if (lenis || reducedMotion()) return lenis
  lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function scrollToTarget(target, opts = {}) {
  if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4, ...opts })
  else {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    if (typeof target === 'number') window.scrollTo({ top: target })
    else el?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' })
  }
}

export const stopScroll = () => lenis?.stop()
export const startScroll = () => lenis?.start()
export const scrollTopNow = () => (lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : window.scrollTo(0, 0))
