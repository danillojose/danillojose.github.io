<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch, useId } from 'vue'
import { gsap, reducedMotion } from '@/lib/gsap'

// Capa gerada para cada projeto (sem prints de repositórios privados): arte SVG por "motif",
// animada em loop enquanto ativa, com distorção por feDisplacementMap ao entrar.
const props = defineProps({
  project: { type: Object, required: true },
  active: { type: Boolean, default: false },
  idle: { type: Boolean, default: false }, // anima sempre (página do case)
})

const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
const root = ref(null)
const disp = ref(null)
const [bg, c1, c2] = props.project.palette
const motif = computed(() => props.project.motif)
let loop, ctx

const ticks = Array.from({ length: 41 }, (_, i) => {
  const a = Math.PI * (0.8 + (1.4 * i) / 40)
  const r1 = 230, r2 = i % 5 === 0 ? 196 : 212
  return { x1: 400 + Math.cos(a) * r1, y1: 380 + Math.sin(a) * r1, x2: 400 + Math.cos(a) * r2, y2: 380 + Math.sin(a) * r2, major: i % 5 === 0 }
})
const grid = Array.from({ length: 9 }, (_, i) => i)
const nodes = [[160, 170], [330, 110], [520, 190], [650, 120], [230, 340], [430, 310], [600, 380], [170, 480], [380, 470], [560, 520], [690, 300]]
const edges = [[0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 2], [5, 6], [6, 10], [3, 10], [4, 7], [7, 8], [8, 5], [8, 9], [9, 6]]
let seed = [...props.project.slug].reduce((a, ch) => a + ch.charCodeAt(0) * 31, 7)
const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
const codeLines = Array.from({ length: 9 }, (_, i) => [60 + Math.floor(rand() * 3) * 40 * (i % 4 ? 1 : 0), 60 + Math.round(rand() * 260)])

function buildLoop() {
  const q = gsap.utils.selector(root.value)
  const tl = gsap.timeline({ repeat: -1, yoyo: false, paused: true, defaults: { ease: 'sine.inOut' } })
  switch (motif.value) {
    case 'gauge':
      tl.fromTo(q('.needle'), { rotation: -110, svgOrigin: '400 380' }, { rotation: 70, duration: 2.2, svgOrigin: '400 380', ease: 'power2.inOut', yoyo: true, repeat: 1 })
        .fromTo(q('.gauge-arc'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 2.2, ease: 'power2.inOut', yoyo: true, repeat: 1 }, 0)
      break
    case 'cycles':
      q('.ring').forEach((r, i) => tl.to(r, { rotation: (i % 2 ? -1 : 1) * 360, duration: 8 + i * 3, ease: 'none', svgOrigin: '400 300' }, 0))
      break
    case 'versus':
      tl.to(q('.vs-a'), { attr: { width: 520 }, duration: 0.9, ease: 'power3.out' })
        .to(q('.vs-a'), { attr: { width: 300 }, duration: 0.7, ease: 'power3.out' }, '+=0.3')
        .to(q('.vs-a'), { attr: { width: 440 }, duration: 0.5, ease: 'back.out(2)' }, '+=0.2')
        .to(q('.vs-a'), { attr: { width: 400 }, duration: 0.9 }, '+=0.3')
        .to(q('.petal'), { y: -18, stagger: 0.1, duration: 0.8, yoyo: true, repeat: 1 }, 0)
      break
    case 'circuit':
      tl.fromTo(q('.trace'), { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 1.4, stagger: 0.15, ease: 'power2.inOut' })
        .to(q('.trace'), { drawSVG: '100% 100%', duration: 1.2, stagger: 0.15, ease: 'power2.inOut' })
        .to(q('.pill'), { rotation: 360, duration: 2.8, svgOrigin: '400 300', ease: 'power2.inOut' }, 0)
      break
    case 'docs':
      tl.to(q('.page'), { y: -20, rotation: (i) => (i - 1) * 6, stagger: 0.12, duration: 1.2, svgOrigin: '400 300', yoyo: true, repeat: 1 })
      break
    case 'network':
      tl.fromTo(q('.edge'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.6, stagger: 0.08 })
        .to(q('.node'), { scale: 1.6, transformOrigin: 'center', stagger: 0.05, duration: 0.3, yoyo: true, repeat: 1 }, 0.3)
      break
    default:
      tl.fromTo(q('.code-line'), { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left', stagger: 0.08, duration: 0.5, ease: 'power3.out' })
        .to(q('.caret'), { opacity: 0, repeat: 5, yoyo: true, duration: 0.25, ease: 'steps(1)' })
        .to(q('.code-line'), { scaleX: 0, transformOrigin: 'right', stagger: 0.05, duration: 0.4, ease: 'power3.in' })
  }
  return tl
}

function setActive(on) {
  if (!loop) return
  if (on) {
    loop.play()
    gsap.fromTo(disp.value, { attr: { scale: 90 } }, { attr: { scale: 0 }, duration: 1.1, ease: 'power3.out' })
  } else loop.pause()
}

onMounted(() => {
  if (reducedMotion()) return
  ctx = gsap.context(() => {
    loop = buildLoop()
    loop.progress(0.35).pause()
    if (props.idle) setActive(true)
  }, root.value)
})
watch(() => props.active, (v) => !props.idle && setActive(v))
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <svg ref="root" class="cover" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" role="img" :aria-label="project.title">
    <defs>
      <filter :id="`d${uid}`" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="3" />
        <feDisplacementMap ref="disp" in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <radialGradient :id="`g${uid}`" cx="70%" cy="20%" r="80%">
        <stop offset="0" :stop-color="c1" stop-opacity="0.28" />
        <stop offset="1" :stop-color="bg" stop-opacity="0" />
      </radialGradient>
      <pattern :id="`p${uid}`" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M40 0H0v40" fill="none" :stroke="c2" stroke-opacity="0.07" />
      </pattern>
    </defs>
    <rect width="800" height="600" :fill="bg" />
    <rect width="800" height="600" :fill="`url(#p${uid})`" />
    <rect width="800" height="600" :fill="`url(#g${uid})`" />

    <g :filter="`url(#d${uid})`">
      <!-- GaragemX: velocímetro -->
      <g v-if="motif === 'gauge'">
        <line v-for="(tk, i) in ticks" :key="i" :x1="tk.x1" :y1="tk.y1" :x2="tk.x2" :y2="tk.y2" :stroke="tk.major ? c1 : c2" :stroke-width="tk.major ? 5 : 2" stroke-linecap="round" :opacity="tk.major ? 1 : 0.5" />
        <path class="gauge-arc" d="M 198 527 A 250 250 0 1 1 602 527" fill="none" :stroke="c1" stroke-width="14" stroke-linecap="round" opacity="0.9" />
        <g class="needle"><path d="M400 380 L 400 190" :stroke="c2" stroke-width="6" stroke-linecap="round" /></g>
        <circle cx="400" cy="380" r="22" :fill="c2" />
        <text x="400" y="480" text-anchor="middle" :fill="c1" font-family="JetBrains Mono, monospace" font-size="34" letter-spacing="6">12.480 KM</text>
      </g>

      <!-- EstudaMais: ciclos concêntricos -->
      <g v-else-if="motif === 'cycles'">
        <circle v-for="i in 5" :key="i" class="ring" cx="400" cy="300" :r="40 + i * 42" fill="none" :stroke="i % 2 ? c1 : c2" :stroke-width="i === 3 ? 14 : 6" stroke-linecap="round" :stroke-dasharray="`${30 + i * 40} ${18 + i * 10}`" :opacity="1 - i * 0.12" />
        <circle cx="400" cy="300" r="26" :fill="c2" />
        <text x="400" y="312" text-anchor="middle" :fill="bg" font-family="JetBrains Mono, monospace" font-size="30" font-weight="700">+</text>
      </g>

      <!-- Duelo de Rosas: barra versus -->
      <g v-else-if="motif === 'versus'">
        <g v-for="(x, i) in [190, 270, 530, 610]" :key="i" class="petal">
          <circle :cx="x" cy="200" r="34" :fill="i < 2 ? c1 : c2" opacity="0.9" />
          <circle :cx="x" cy="200" r="16" :fill="bg" opacity="0.35" />
        </g>
        <rect x="100" y="300" width="600" height="70" rx="35" :fill="c2" />
        <rect class="vs-a" x="100" y="300" width="400" height="70" rx="35" :fill="c1" />
        <text x="400" y="460" text-anchor="middle" :fill="c2" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="88" letter-spacing="-3">VS</text>
      </g>

      <!-- DARPA: circuito + cápsula -->
      <g v-else-if="motif === 'circuit'">
        <path v-for="(d, i) in ['M80 140H300V260H400', 'M720 120H520V240H400', 'M60 470H260V340H400', 'M740 500H560V360H400', 'M400 60V230', 'M400 540V370']" :key="i" class="trace" :d="d" fill="none" :stroke="i % 2 ? c2 : c1" stroke-width="4" />
        <g class="pill">
          <rect x="310" y="255" width="180" height="90" rx="45" :fill="c1" />
          <rect x="400" y="255" width="90" height="90" rx="0" :fill="c2" />
          <rect x="310" y="255" width="180" height="90" rx="45" fill="none" :stroke="bg" stroke-width="6" />
        </g>
      </g>

      <!-- RenomearPDF: páginas -->
      <g v-else-if="motif === 'docs'">
        <g v-for="i in 3" :key="i" class="page" :transform="`rotate(${(i - 2) * -8} 400 300)`">
          <rect x="290" y="130" width="220" height="300" rx="8" :fill="i === 3 ? c1 : bg" :stroke="c1" stroke-width="3" />
          <rect v-for="l in 6" :key="l" x="320" :y="170 + l * 32" :width="l % 3 ? 160 : 100" height="8" rx="4" :fill="i === 3 ? bg : c2" opacity="0.7" />
        </g>
        <text x="400" y="520" text-anchor="middle" :fill="c2" font-family="JetBrains Mono, monospace" font-size="26">setor_2504.pdf</text>
      </g>

      <!-- Rede ad-hoc: grafo -->
      <g v-else-if="motif === 'network'">
        <line v-for="(e, i) in edges" :key="i" class="edge" :x1="nodes[e[0]][0]" :y1="nodes[e[0]][1]" :x2="nodes[e[1]][0]" :y2="nodes[e[1]][1]" :stroke="c1" stroke-width="3" opacity="0.8" />
        <circle v-for="(n, i) in nodes" :key="i" class="node" :cx="n[0]" :cy="n[1]" :r="i === 5 ? 18 : 11" :fill="i === 5 ? c2 : c1" />
      </g>

      <!-- Padrão: editor de código -->
      <g v-else>
        <text x="80" y="140" :fill="c1" font-family="JetBrains Mono, monospace" font-size="64" font-weight="500">{ }</text>
        <rect v-for="(l, i) in codeLines" :key="i" class="code-line" :x="l[0] + 60" :y="190 + i * 36" :width="l[1]" height="14" rx="7" :fill="i % 3 === 0 ? c1 : c2" :opacity="i % 3 === 0 ? 1 : 0.55" />
        <rect class="caret" :x="codeLines[8][0] + codeLines[8][1] + 74" :y="190 + 8 * 36 - 6" width="4" height="26" :fill="c1" />
        <text x="720" y="540" text-anchor="end" :fill="c2" opacity="0.5" font-family="JetBrains Mono, monospace" font-size="22">{{ project.language || project.stack[0] }}</text>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.cover { width: 100%; height: 100%; display: block; }
</style>
