import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { z } from 'zod'
import type { DocPage, DocsIndexItem } from '@/lib/types'

const docsRoot = path.join(process.cwd(), 'content', 'v2')
const docsIndexFile = path.join(process.cwd(), 'data', 'docs-index.json')

const frontmatterSchema = z.object({
  title: z.string(),
  module: z.string(),
  route: z.string(),
  pdfRef: z.string(),
  videoUrl: z.string(),
  updatedAt: z.string(),
  tags: z.array(z.string()),
  permissionHints: z.array(z.string()),
  order: z.number(),
  version: z.string(),
  description: z.string(),
  menuGroup: z.string(),
  menuGroupLabel: z.string(),
  related: z.array(z.string()),
})

async function walk(dir: string): Promise<string[]> {
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

function slugFromAbsolute(filePath: string): string {
  return filePath.replace(`${docsRoot}/`, '').replace(/\.mdx$/g, '')
}

export async function getDocsSlugs(): Promise<string[][]> {
  const files = await walk(docsRoot)
  return files.map((item) => slugFromAbsolute(item).split('/'))
}

export async function getDocsIndex(): Promise<DocsIndexItem[]> {
  const raw = await fs.readFile(docsIndexFile, 'utf-8')
  const parsed = JSON.parse(raw) as DocsIndexItem[]
  return parsed.sort((a, b) => a.order - b.order)
}

export async function getDocBySlug(slugParts: string[]): Promise<DocPage | null> {
  const fullSlug = slugParts.join('/')
  const filePath = path.join(docsRoot, `${fullSlug}.mdx`)

  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    const parsed = matter(raw)
    const frontmatter = frontmatterSchema.parse(parsed.data)
    const index = await getDocsIndex()
    const relatedDocs = index.filter((doc) => frontmatter.related.includes(doc.slug))

    return {
      ...frontmatter,
      slug: fullSlug,
      content: parsed.content,
      related: relatedDocs.map((item) => ({
        href: `/docs/${item.slug}`,
        label: item.title,
      })),
    }
  } catch {
    return null
  }
}

export async function getVersionedDocsSummary(): Promise<Array<{ version: string; totalDocs: number; totalGroups: number }>> {
  const index = await getDocsIndex()
  const map = new Map<string, { totalDocs: number; groups: Set<string> }>()

  index.forEach((doc) => {
    if (!map.has(doc.version)) {
      map.set(doc.version, { totalDocs: 0, groups: new Set<string>() })
    }

    const entry = map.get(doc.version)!
    entry.totalDocs += 1
    entry.groups.add(doc.menuGroup)
  })

  return Array.from(map.entries()).map(([version, data]) => ({
    version,
    totalDocs: data.totalDocs,
    totalGroups: data.groups.size,
  }))
}
