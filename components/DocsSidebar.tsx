'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import type { DocsIndexItem, GroupedNav } from '@/lib/types'
import { groupNavigation } from '@/lib/navigation'

const groupIcons: Record<string, string> = {
  'acesso-e-navegacao': '🔐',
  operacoes: '🛠',
  crm: '🤝',
  compras: '🧾',
  comercial: '💼',
  gestao: '📦',
  cadastros: '🗂',
  relatorios: '📊',
  administracao: '⚙',
  rh: '👥',
  qualidade: '✅',
  financeiro: '💳',
}

function IconChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m14.5 6-6 6 6 6" />
    </svg>
  )
}

function IconChevronRight() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9.5 6 6 6-6 6" />
    </svg>
  )
}

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function DocsSidebar({ docsIndex }: { docsIndex: DocsIndexItem[] }) {
  const pathname = usePathname()
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

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
    <>
      <button type="button" className="mobile-sidebar-trigger" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
        <IconMenu />
        <span>Módulos</span>
      </button>

      {mobileOpen && <button type="button" className="sidebar-overlay" aria-label="Fechar menu" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-top">
          <button
            type="button"
            className="icon-button"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
            title={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          >
            {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
          </button>
          {!collapsed && <h2>Módulos</h2>}
          <button
            type="button"
            className="icon-button sidebar-mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
            title="Fechar menu"
          >
            <IconChevronLeft />
          </button>
        </div>

        {!collapsed && (
          <>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar página, rota ou tag"
            />
            <nav>
              {grouped.map((group) => (
                <section key={group.group}>
                  <h3>
                    <span>{groupIcons[group.group] ?? '📁'}</span>
                    <span>{group.label}</span>
                  </h3>
                  <ul>
                    {group.items.map((item) => {
                      const href = `/docs/${item.slug}`
                      const isActive = pathname === href
                      return (
                        <li key={item.slug}>
                          <Link
                            href={href}
                            className={isActive ? 'active' : ''}
                            onClick={() => setMobileOpen(false)}
                          >
                            {item.title}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))}
            </nav>

            <div className="sidebar-contact">
              <strong>Precisa de ajuda?</strong>
              <p>Fale com o time Integra para dúvidas sobre fluxos e permissões.</p>
              <a href="mailto:contato@harucode.com.br">contato@harucode.com.br</a>
              <a href="tel:+5567999532526">+55 (67) 99953-2526</a>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
