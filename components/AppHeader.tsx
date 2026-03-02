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
          <Link href="/docs/acesso-e-navegacao/acessando-o-sistema">Documentação</Link>
          <a href="/pdf/guia-usuario-integra-v2.pdf" target="_blank" rel="noreferrer">
            PDF Oficial
          </a>
          <a href="https://chatgpt.com/g/g-69a5a5362464819193f7c54ed0579bba-integra-suporte" target="_blank" rel="noreferrer">
            GPT Assistente
          </a>
          <a href="https://gemini.google.com/gem/1Mo9G6XOwpQUa54Dl7RoLAea8_KP1U-T2?usp=sharing" target="_blank" rel="noreferrer">
            Gem Assistente
          </a>
          <a href="mailto:contato@harucode.com.br">Contato</a>
        </nav>

        <div className="header-actions">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
