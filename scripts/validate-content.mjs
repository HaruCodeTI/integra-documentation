import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

const required = [
  'title',
  'module',
  'route',
  'pdfRef',
  'videoUrl',
  'updatedAt',
  'tags',
  'permissionHints',
  'order',
  'version',
  'description',
  'menuGroup',
  'menuGroupLabel',
  'related',
]

const root = process.cwd()
const docsRoot = path.join(root, 'content', 'v2')

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        return walk(full)
      }
      return full.endsWith('.mdx') ? [full] : []
    }),
  )
  return files.flat()
}

const files = await walk(docsRoot)
const errors = []

for (const file of files) {
  const raw = await fs.readFile(file, 'utf-8')
  const parsed = matter(raw)

  for (const field of required) {
    if (!(field in parsed.data)) {
      errors.push(`${file}: campo ausente ${field}`)
    }
  }

  if (typeof parsed.data.videoUrl !== 'string' || !parsed.data.videoUrl.startsWith('/videos/')) {
    errors.push(`${file}: videoUrl inválido`)
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`Validação concluída: ${files.length} páginas válidas.`)
