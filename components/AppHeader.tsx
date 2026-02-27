import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

export function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link href="/" className="brand-link" aria-label="Integra Docs">
          <img src="/logo-integra.svg" alt="Integra ERP" className="brand-logo" />
        </Link>

        <nav className="top-nav" aria-label="Navegação principal">
          <Link href="/">Início</Link>
          <Link href="/v2">Documentação v2</Link>
          <a href="mailto:contato@harucode.com.br">Contato</a>
        </nav>

        <div className="header-actions">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
