import type { DocsIndexItem, GroupedNav } from '@/lib/types'

export function groupNavigation(docs: DocsIndexItem[]): GroupedNav[] {
  const map = new Map<string, GroupedNav>()

  docs.forEach((doc) => {
    if (!map.has(doc.menuGroup)) {
      map.set(doc.menuGroup, {
        group: doc.menuGroup,
        label: doc.menuGroupLabel,
        items: [],
      })
    }

    map.get(doc.menuGroup)!.items.push(doc)
  })

  return Array.from(map.values())
    .map((group) => ({
      ...group,
      items: group.items.sort((a, b) => a.order - b.order),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}
