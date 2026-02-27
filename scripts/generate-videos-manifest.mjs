import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const docsIndexPath = path.join(root, 'data', 'docs-index.json')
const outputPath = path.join(root, 'data', 'videos-manifest.json')

const docs = JSON.parse(await fs.readFile(docsIndexPath, 'utf-8'))
const now = new Date().toISOString()

const manifest = docs.map((doc) => ({
  docSlug: doc.slug,
  videoPath: doc.videoUrl,
  thumbnailPath: `/thumbnails/${doc.slug.replaceAll('/', '-')}.jpg`,
  durationSec: 90,
  capturedAt: now,
  sourceEnv: 'staging',
}))

await fs.writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`)
