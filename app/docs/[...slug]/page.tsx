import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getDocBySlug, getDocsSlugs } from '@/lib/docs'

export async function generateStaticParams() {
  const slugs = await getDocsSlugs()
  return slugs.map((slug) => ({ slug }))
}

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const resolved = await params
  const doc = await getDocBySlug(resolved.slug)

  if (!doc) {
    notFound()
  }

  return (
    <article className="doc-content">
      <nav className="breadcrumb">
        <span>{doc.menuGroupLabel}</span>
        <span>/</span>
        <span>{doc.title}</span>
      </nav>
      <header className="doc-header animate-fade-up">
        <div>
          <p className="doc-version">Versão {doc.version.toUpperCase()}</p>
          <h1>{doc.title}</h1>
          <p>{doc.description}</p>
        </div>
      </header>

      <section className="video-block animate-fade-up-delay">
        <h2>Vídeo rápido</h2>
        <video controls preload="metadata" className="video-player">
          <source src={doc.videoUrl} type="video/mp4" />
        </video>
        <a href={doc.videoUrl}>{doc.videoUrl}</a>
      </section>

      <section className="playbook-body animate-fade-up-delay-2">
        <MDXRemote source={doc.content} />
      </section>

      <section className="next-steps animate-fade-up-delay-2">
        <h2>Próximos passos</h2>
        <ul>
          {doc.related.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
