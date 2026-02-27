import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Integra ERP Docs',
  description: 'Portal de documentação oficial do Integra ERP',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
