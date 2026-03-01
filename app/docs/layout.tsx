import { AppHeader } from '@/components/AppHeader'
import { DocsSidebar } from '@/components/DocsSidebar'
import { getDocsIndex } from '@/lib/docs'

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
    const docsIndex = await getDocsIndex()

    return (
        <>
            <AppHeader />
            <main className="docs-shell">
                <DocsSidebar docsIndex={docsIndex} />
                {children}
            </main>
        </>
    )
}
