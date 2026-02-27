import Link from 'next/link'
import { AppHeader } from '@/components/AppHeader'
import { getVersionedDocsSummary } from '@/lib/docs'

export default async function HomePage() {
  const summary = await getVersionedDocsSummary()

  return (
    <>
      <AppHeader />
      <main className="home">
        <section className="hero animate-fade-up">
          <p className="badge">Integra ERP</p>
          <h1>Documentação Oficial para Operação, Gestão e Suporte</h1>
          <p>
            Conteúdo em formato playbook com vídeo curto no topo, passos objetivos e alinhamento com os módulos reais
            do sistema.
          </p>
          <div className="hero-actions">
            <Link href="/docs/acesso-e-navegacao/acessando-o-sistema">Começar agora</Link>
            <Link href="/v2">Explorar índice v2</Link>
          </div>
        </section>

        <section className="versions animate-fade-up-delay">
          {summary.map((item) => (
            <article key={item.version} className="version-card">
              <h2>{item.version.toUpperCase()}</h2>
              <p>{item.totalDocs} páginas publicadas</p>
              <p>{item.totalGroups} grupos funcionais</p>
            </article>
          ))}
        </section>

        <section className="contact-strip animate-fade-up-delay-2">
          <h3>Contato do time Integra</h3>
          <div>
            <a href="mailto:contato@harucode.com.br">contato@harucode.com.br</a>
            <a href="tel:+5567999532526">+55 (67) 99953-2526</a>
            <a href="https://www.harucode.com.br" target="_blank" rel="noreferrer">
              www.harucode.com.br
            </a>
          </div>
        </section>
      </main>
    </>
  )
}
