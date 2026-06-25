import '@/styles/cms.css'
import '@/styles/globals.css'

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  )
}
