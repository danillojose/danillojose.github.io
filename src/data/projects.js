import github from './github.json'
import { privateProjects } from './projects.private.js'

// Enriquecimento dos repositórios públicos (texto bilíngue, stack e destaque).
// Repositórios novos que não estiverem aqui aparecem automaticamente com a descrição do GitHub.
const publicMeta = {
  DARPA: {
    slug: 'darpa',
    title: 'DARPA',
    tagline: { pt: 'Dispensador automático de remédios para pacientes com Alzheimer.', en: 'Automatic medication dispenser for Alzheimer’s patients.' },
    summary: {
      pt: 'Dispositivo embarcado em Arduino que libera a medicação no horário certo para pacientes com Alzheimer. Nasceu na disciplina de Sistemas Embarcados, em 2018.',
      en: 'An Arduino embedded device that releases medication at the right time for Alzheimer’s patients. Born in the Embedded Systems course in 2018.',
    },
    stack: ['Arduino', 'C++', 'Hardware'],
    palette: ['#0c1114', '#4fd1ff', '#ffd23f'],
    motif: 'circuit',
    featured: true,
  },
  RenomearPDF_IBGE: {
    slug: 'renomear-pdf-ibge',
    title: 'RenomearPDF IBGE',
    tagline: { pt: 'Automação que lê mapas escaneados e os renomeia sozinha.', en: 'Automation that reads scanned maps and renames them.' },
    summary: {
      pt: 'Script que abre cada mapa em PDF escaneado, identifica o número do setor censitário e renomeia o arquivo. Horas de trabalho manual eliminadas.',
      en: 'A script that opens each scanned PDF map, identifies its census sector number and renames the file. Hours of manual work removed.',
    },
    stack: ['Python', 'Automação'],
    motif: 'docs',
  },
  'prova-pratica-SERPRO-2023': {
    slug: 'prova-pratica-serpro',
    title: 'Prova prática SERPRO 2023',
    tagline: { pt: 'Resolução das três questões da prova prática.', en: 'Solutions to the three practical-exam questions.' },
    stack: ['Java', 'Algoritmos'],
  },
  'javascript-estudos-SERPRO': {
    slug: 'javascript-estudos-serpro',
    title: 'Estudos SERPRO · JS',
    tagline: { pt: 'Implementações em JavaScript para a prova prática.', en: 'JavaScript implementations for the practical exam.' },
    stack: ['JavaScript', 'Algoritmos'],
  },
  'java-estudos-SERPRO': {
    slug: 'java-estudos-serpro',
    title: 'Estudos SERPRO · Java',
    tagline: { pt: 'Implementações em Java para a prova prática.', en: 'Java implementations for the practical exam.' },
    stack: ['Java', 'Algoritmos'],
  },
  'APA-algoritmos': {
    slug: 'apa-algoritmos',
    title: 'APA · Algoritmos',
    tagline: { pt: 'Implementações da disciplina de Análise e Projeto de Algoritmos.', en: 'Implementations from the Algorithm Analysis & Design course.' },
    stack: ['Java', 'Algoritmos'],
  },
  'RSF-Projeto-final': {
    slug: 'rede-ad-hoc',
    title: 'Rede ad-hoc sem fio',
    tagline: { pt: 'Camadas física, de enlace e de rede de uma rede ad-hoc.', en: 'Physical, link and network layers of an ad-hoc network.' },
    summary: {
      pt: 'Projeto final de Redes Sem Fio: implementação das camadas física, de enlace e de rede de uma rede ad-hoc.',
      en: 'Wireless Networks final project: implementing the physical, link and network layers of an ad-hoc network.',
    },
    stack: ['Java', 'Redes'],
    motif: 'network',
  },
}

const langPalettes = {
  Java: ['#120f0c', '#f89820', '#6fa8d6'],
  JavaScript: ['#11110b', '#f7df1e', '#ffffff'],
  Python: ['#0b0f16', '#4b8bbe', '#ffd43b'],
  'C++': ['#0c1114', '#4fd1ff', '#ffd23f'],
}

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const publicProjects = github.repos.map((r) => {
  const meta = publicMeta[r.name] || {}
  const desc = r.description || ''
  return {
    slug: meta.slug || slugify(r.name),
    title: meta.title || r.name,
    visibility: 'public',
    year: new Date(r.createdAt).getFullYear(),
    tagline: meta.tagline || { pt: desc, en: desc },
    summary: meta.summary || meta.tagline || { pt: desc, en: desc },
    stack: meta.stack || r.languages,
    language: r.language,
    stars: r.stars,
    links: { repo: r.url, ...(r.homepage ? { live: r.homepage } : {}) },
    palette: meta.palette || langPalettes[r.language] || ['#101010', '#c6ff3d', '#ffffff'],
    motif: meta.motif || 'code',
    featured: !!meta.featured,
  }
})

export const projects = [...privateProjects, ...publicProjects]
export const featured = projects.filter((p) => p.featured)
export const archive = projects.filter((p) => !p.featured)
export const findProject = (slug) => projects.find((p) => p.slug === slug)
export const githubUser = github.user
