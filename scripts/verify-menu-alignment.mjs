import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const mappingPath = path.join(root, 'data', 'docs-mapping.json')
const menuPath = path.join(root, '..', 'integra-web', 'src', 'config', 'menu.ts')

const mapping = JSON.parse(await fs.readFile(mappingPath, 'utf-8'))
const menuText = await fs.readFile(menuPath, 'utf-8')

const allowedExternal = new Set(['/auth/sign-in', '/auth/forgot-password', '/financial', '/'])
const missing = []

for (const item of mapping) {
  if (allowedExternal.has(item.route)) {
    continue
  }

  if (!menuText.includes(`path: '${item.route}'`) && !menuText.includes(`path: \"${item.route}\"`)) {
    missing.push(`${item.doc_slug} -> ${item.route}`)
  }
}

if (missing.length > 0) {
  console.error('Rotas sem correspondência no menu:')
  console.error(missing.join('\n'))
  process.exit(1)
}

console.log(`Alinhamento confirmado: ${mapping.length} itens verificados.`)
