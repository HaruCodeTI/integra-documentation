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
          {doc.permissionDescriptions && doc.permissionDescriptions.length > 0 && (
            <div className="permissions-callout">
              <h2>Permissões (nomes no sistema)</h2>
              <ul>
                {doc.permissionDescriptions.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <p className="perm-codes">
                Códigos: {doc.permissionHints.join(', ')}
              </p>
            </div>
          )}

          <MDXRemote source={doc.content} />

          <div className="pdf-reference">
            <h2>Campos e validações</h2>
            <p>
              Detalhamento completo está na seção {doc.pdfRef} do Guia do Usuário. Consulte também o PDF anexo para nomes de campos,
              obrigatoriedade, máscaras e exemplos.
            </p>
            <a href="/pdf/guia-usuario-integra-v2.pdf" target="_blank" rel="noreferrer">
              Abrir PDF oficial
            </a>
          </div>

          <div className="ai-assist">
            <h3>Assistentes IA</h3>
            <p>Use os assistentes treinados com o Integra para tirar dúvidas sobre o fluxo desta página.</p>
            <div className="ai-links">
              <a href="https://chatgpt.com/g/g-69a5a5362464819193f7c54ed0579bba-integra-suporte" target="_blank" rel="noreferrer">
                GPT Assistente
              </a>
              <a href="https://gemini.google.com/gem/1Mo9G6XOwpQUa54Dl7RoLAea8_KP1U-T2?usp=sharing" target="_blank" rel="noreferrer">
                Gem Assistente
              </a>
            </div>
          </div>
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
