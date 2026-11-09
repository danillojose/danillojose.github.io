import { gsap, reducedMotion } from '@/lib/gsap'

// v-magnetic="0.35" — o elemento é atraído pelo cursor dentro da sua área.
export const magnetic = {
  mounted(el, binding) {
    if (reducedMotion() || window.matchMedia('(pointer: coarse)').matches) return
    const strength = binding.value ?? 0.35
    const inner = el.querySelector('[data-magnetic-inner]')
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    const ixTo = inner && gsap.quickTo(inner, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    const iyTo = inner && gsap.quickTo(inner, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      xTo(dx * strength); yTo(dy * strength)
      ixTo?.(dx * strength * 0.5); iyTo?.(dy * strength * 0.5)
    }
    const leave = () => { xTo(0); yTo(0); ixTo?.(0); iyTo?.(0) }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    el._magnetic = { move, leave }
  },
  unmounted(el) {
    if (!el._magnetic) return
    el.removeEventListener('pointermove', el._magnetic.move)
    el.removeEventListener('pointerleave', el._magnetic.leave)
  },
}
