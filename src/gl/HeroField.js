import { Renderer, Camera, Geometry, Program, Mesh } from 'ogl'

// Campo de partículas: grade de pontos deformada por ruído simplex 3D, que se afasta do cursor.
const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`

const vertex = /* glsl */ `
attribute vec3 position;
attribute float random;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uSize;
uniform float uPixel;
uniform float uScroll;
uniform float uIntro;
varying float vAlpha;
varying float vMix;
${noise}
void main(){
  vec3 p = position;
  p.xy *= uSize * 0.56;
  float n = snoise(vec3(p.xy * 0.32, uTime * 0.1));
  float n2 = snoise(vec3(p.xy * 1.1 + 10.0, uTime * 0.18));
  p.z = (n * 0.7 + n2 * 0.18) * uIntro;
  vec2 m = uMouse * uSize * 0.5;
  vec2 dir = p.xy - m;
  float f = smoothstep(1.4, 0.0, length(dir));
  p.xy += normalize(dir + 0.0001) * f * 0.45;
  p.z += f * 0.8;
  p.y += uScroll * 1.6;
  p.z -= (1.0 - uIntro) * 4.0 * random;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (1.1 + (n * 0.5 + 0.5) * 2.0 + f * 3.5) * uPixel * (6.0 / -mv.z);
  vAlpha = (0.18 + (n * 0.5 + 0.5) * 0.55 + f * 0.5) * uIntro * (1.0 - uScroll * 0.8);
  vMix = clamp(f * 1.3 + smoothstep(0.35, 0.95, n2) * 0.8 + random * 0.1, 0.0, 1.0);
}`

const fragment = /* glsl */ `
precision highp float;
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vAlpha;
varying float vMix;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.15, d) * vAlpha;
  gl_FragColor = vec4(mix(uColorA, uColorB, vMix), a);
}`

const hex = (h) => {
  const n = parseInt(h.replace('#', ''), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export class HeroField {
  constructor(container, { colorA = '#8d8a83', colorB = '#c6ff3d' } = {}) {
    this.container = container
    this.mouse = { x: 0, y: 0, tx: 0, ty: 0 }
    // Telas touch não têm cursor: a bolha passeia sozinha, devagar e sem padrão repetitivo.
    this.touch = window.matchMedia('(pointer: coarse)').matches
    this.phase = Array.from({ length: 4 }, () => Math.random() * Math.PI * 2)
    this.renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: true, antialias: false })
    const gl = (this.gl = this.renderer.gl)
    gl.clearColor(0, 0, 0, 0)
    container.appendChild(gl.canvas)

    this.camera = new Camera(gl, { fov: 35 })
    this.camera.position.z = 6

    const mobile = window.innerWidth < 768
    const cols = mobile ? 90 : 170
    const rows = mobile ? 110 : 95
    const pos = new Float32Array(cols * rows * 3)
    const rnd = new Float32Array(cols * rows)
    let i = 0
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        pos[i * 3] = (x / (cols - 1)) * 2 - 1
        pos[i * 3 + 1] = (y / (rows - 1)) * 2 - 1
        pos[i * 3 + 2] = 0
        rnd[i] = Math.random()
        i++
      }
    }
    const geometry = new Geometry(gl, { position: { size: 3, data: pos }, random: { size: 1, data: rnd } })
    this.program = new Program(gl, {
      vertex, fragment, transparent: true, depthTest: false,
      uniforms: {
        uTime: { value: 0 }, uMouse: { value: [0, 0] }, uSize: { value: [1, 1] },
        uPixel: { value: this.renderer.dpr }, uScroll: { value: 0 }, uIntro: { value: 0 },
        uColorA: { value: hex(colorA) }, uColorB: { value: hex(colorB) },
      },
    })
    this.mesh = new Mesh(gl, { mode: gl.POINTS, geometry, program: this.program })
    this.mesh.rotation.x = -0.35

    this.onResize = this.resize.bind(this)
    this.onMove = (e) => {
      this.mouse.tx = (e.clientX / window.innerWidth) * 2 - 1
      this.mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('resize', this.onResize)
    if (!this.touch) window.addEventListener('pointermove', this.onMove)
    this.resize()
  }

  setColors(a, b) {
    this.program.uniforms.uColorA.value = hex(a)
    this.program.uniforms.uColorB.value = hex(b)
  }
  set intro(v) { this.program.uniforms.uIntro.value = v }
  get intro() { return this.program.uniforms.uIntro.value }
  set scroll(v) { this.program.uniforms.uScroll.value = v }

  resize() {
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    this.renderer.setSize(w, h)
    this.camera.perspective({ aspect: w / h })
    const vh = 2 * Math.tan((this.camera.fov * Math.PI) / 360) * this.camera.position.z
    this.program.uniforms.uSize.value = [vh * (w / h) * 1.15, vh * 1.25]
  }

  render(time) {
    if (this.touch) {
      // Soma de senoides lentas com frequências que não se alinham: trajetória orgânica e aleatória.
      const [a, b, c, d] = this.phase
      this.mouse.tx = Math.sin(time * 0.13 + a) * 0.45 + Math.sin(time * 0.071 + b) * 0.25
      this.mouse.ty = Math.sin(time * 0.097 + c) * 0.4 + Math.sin(time * 0.053 + d) * 0.25
    }
    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.06
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.06
    this.program.uniforms.uMouse.value = [this.mouse.x, this.mouse.y]
    this.program.uniforms.uTime.value = time
    this.renderer.render({ scene: this.mesh, camera: this.camera })
  }

  destroy() {
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('pointermove', this.onMove)
    this.gl.getExtension('WEBGL_lose_context')?.loseContext()
    this.gl.canvas.remove()
  }
}
