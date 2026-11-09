// Gera src/data/github.json com os repositórios públicos de danillojose.
// Roda no prebuild. Se a API falhar (rate limit/offline), mantém o JSON existente.
import { writeFile } from 'node:fs/promises'

const USER = 'danillojose'
const OUT = new URL('../src/data/github.json', import.meta.url)
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'danillojose-portfolio' }
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

async function get(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} em ${path}`)
  return res.json()
}

try {
  const [user, repos] = await Promise.all([
    get(`/users/${USER}`),
    get(`/users/${USER}/repos?per_page=100&sort=updated&type=owner`),
  ])
  const list = await Promise.all(
    repos
      .filter((r) => !r.fork && !r.archived && r.name !== `${USER}.github.io`)
      .map(async (r) => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        homepage: r.homepage || null,
        language: r.language,
        languages: Object.keys(await get(`/repos/${USER}/${r.name}/languages`).catch(() => ({}))),
        stars: r.stargazers_count,
        createdAt: r.created_at,
        pushedAt: r.pushed_at,
      })),
  )
  const data = {
    fetchedAt: new Date().toISOString(),
    user: { name: user.name, avatar: user.avatar_url, location: user.location, createdAt: user.created_at, url: user.html_url },
    repos: list,
  }
  await writeFile(OUT, JSON.stringify(data, null, 2) + '\n')
  console.log(`[github] ${list.length} repositórios públicos salvos.`)
} catch (err) {
  console.warn(`[github] Falha ao consultar a API (${err.message}). Usando o JSON existente.`)
}
