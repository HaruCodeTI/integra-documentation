'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { DocsIndexItem, GroupedNav } from '@/lib/types'
import { groupNavigation } from '@/lib/navigation'

export function DocsSidebar({ docsIndex, currentSlug }: { docsIndex: DocsIndexItem[]; currentSlug: string }) {
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState(false)

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return docsIndex
    }

    const term = query.toLowerCase()
    return docsIndex.filter((doc) => {
      const text = [doc.title, doc.description, doc.route, doc.module, doc.tags.join(' ')].join(' ').toLowerCase()
      return text.includes(term)
    })
  }, [docsIndex, query])

  const grouped = useMemo<GroupedNav[]>(() => groupNavigation(filtered), [filtered])

  return (
    <aside className={collapsed ? 'sidebar collapsed' : 'sidebar'}>
      <div className="sidebar-top">
        <button type="button" onClick={() => setCollapsed((prev) => !prev)}>
          {collapsed ? 'Expandir' : 'Recolher'}
        </button>
        {!collapsed && <h2>Módulos</h2>}
      </div>
      {!collapsed && (
        <>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por página, rota ou tag"
          />
          <nav>
            {grouped.map((group) => (
              <section key={group.group}>
                <h3>{group.label}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.slug}>
                      <Link href={`/docs/${item.slug}`} className={item.slug === currentSlug ? 'active' : ''}>
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </>
      )}
    </aside>
  )
}
