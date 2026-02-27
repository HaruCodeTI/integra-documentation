import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

const root = process.cwd()
const docsRoot = path.join(root, 'content', 'v2')
const output = path.join(root, 'data', 'docs-index.json')

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
const docs = []

for (const file of files) {
  const raw = await fs.readFile(file, 'utf-8')
  const parsed = matter(raw)
  docs.push({
    ...parsed.data,
    slug: file.replace(`${docsRoot}/`, '').replace(/\.mdx$/g, ''),
  })
}

docs.sort((a, b) => Number(a.order) - Number(b.order))
await fs.writeFile(output, `${JSON.stringify(docs, null, 2)}\n`)
