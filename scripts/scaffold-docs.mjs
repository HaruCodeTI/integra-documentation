import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const mappingPath = path.join(root, 'data', 'docs-mapping.json')
const contentRoot = path.join(root, 'content', 'v2')

const mapping = JSON.parse(await fs.readFile(mappingPath, 'utf-8'))

for (let i = 0; i < mapping.length; i += 1) {
  const item = mapping[i]
  const full = path.join(contentRoot, `${item.doc_slug}.mdx`)
  await fs.mkdir(path.dirname(full), { recursive: true })

  const videoSlug = item.doc_slug.replaceAll('/', '-')
  const frontmatter = `---
title: "${item.title}"
module: "${item.menu_group}"
route: "${item.route}"
pdfRef: "${item.pdf_section_id}"
videoUrl: "/videos/${videoSlug}-v2.mp4"
updatedAt: "2026-02-27"
tags: [${item.tags.map((tag) => `"${tag}"`).join(', ')}]
permissionHints: [${item.permission_hints.map((hint) => `"${hint}"`).join(', ')}]
order: ${i + 1}
version: "v2"
description: "${item.summary}"
menuGroup: "${item.menu_group}"
menuGroupLabel: "${item.menu_group_label}"
related: [${item.related.map((rel) => `"${rel}"`).join(', ')}]
---
`

  const body = `## Quando usar
${item.summary}

## Pré-requisitos
- Perfil com permissões indicadas em \`Permissões necessárias\`.
- Dados mínimos já cadastrados para o fluxo.
- Acesso ao módulo em \`${item.route}\`.

## Passo a passo
1. Acesse o menu correspondente ao módulo \`${item.menu_group_label}\`.
2. Abra a funcionalidade \`${item.title}\`.
3. Execute o fluxo principal seguindo a sequência operacional da tela.
4. Revise os dados antes de confirmar a operação.

## Campos críticos
- Campos obrigatórios exibidos com validação de preenchimento.
- Identificadores de cliente/equipamento/produto conforme contexto.
- Datas, status e responsáveis quando aplicável.

## Erros comuns
- Permissão insuficiente para a ação solicitada.
- Dados obrigatórios ausentes ou em formato inválido.
- Inconsistência de vínculo entre registros relacionados.

## Permissões necessárias
${item.permission_hints.map((hint) => `- ${hint}`).join('\n')}

## Relacionados
${item.related.map((rel) => `- [${rel}](/docs/${rel})`).join('\n')}
`

  const exists = await fs
    .access(full)
    .then(() => true)
    .catch(() => false)

  if (!exists) {
    await fs.writeFile(full, `${frontmatter}\n${body}`)
  }
}
