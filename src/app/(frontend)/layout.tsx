import '@/styles/cms.css'
import '@/styles/globals.css'
import { Toaster } from '@/components/ui/sonner'

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}
