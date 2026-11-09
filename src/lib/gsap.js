import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'
import { Observer } from 'gsap/Observer'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, Observer, ScrambleTextPlugin, DrawSVGPlugin, CustomEase)

CustomEase.create('expo.custom', '0.76, 0, 0.24, 1')
CustomEase.create('out.soft', '0.16, 1, 0.3, 1')
gsap.defaults({ ease: 'out.soft', duration: 1 })

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export { gsap, ScrollTrigger, SplitText, Flip, Observer }
