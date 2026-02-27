import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Integra ERP Docs',
  description: 'Portal de documentação oficial do Integra ERP',
}

const themeBootScript = `
(() => {
  const saved = localStorage.getItem('integra-docs-theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const mode = saved === 'light' || saved === 'dark' ? saved : (systemDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', mode);
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        {children}
      </body>
    </html>
  )
}
