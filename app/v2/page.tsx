import Link from 'next/link'
import { AppHeader } from '@/components/AppHeader'
import { getDocsIndex } from '@/lib/docs'

export default async function VersionPage() {
  const docs = await getDocsIndex()

  return (
    <>
      <AppHeader />
      <main className="version-page">
        <h1>Documentação v2</h1>
        <p>Índice completo da documentação orientada por módulo.</p>
        <ul>
          {docs.map((doc) => (
            <li key={doc.slug}>
              <Link href={`/docs/${doc.slug}`}>{doc.title}</Link>
              <span>{doc.menuGroupLabel}</span>
            </li>
          ))}
        </ul>
      </main>
    </>
  )
}
