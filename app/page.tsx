import Link from 'next/link'
import { getVersionedDocsSummary } from '@/lib/docs'

export default async function HomePage() {
  const summary = await getVersionedDocsSummary()

  return (
    <main className="home">
      <section className="hero">
        <p className="badge">Integra ERP</p>
        <h1>Documentação Oficial</h1>
        <p>
          Conteúdo orientado por tarefas com vídeo curto, passos objetivos e alinhamento com a interface real do produto.
        </p>
        <div className="hero-actions">
          <Link href="/docs/acesso-e-navegacao/acessando-o-sistema">Começar pela navegação</Link>
          <Link href="/v2">Ver versão v2</Link>
        </div>
      </section>
      <section className="versions">
        {summary.map((item) => (
          <article key={item.version} className="version-card">
            <h2>{item.version.toUpperCase()}</h2>
            <p>{item.totalDocs} páginas publicadas</p>
            <p>{item.totalGroups} grupos funcionais</p>
          </article>
        ))}
      </section>
    </main>
  )
}
