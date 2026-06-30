import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

type Props = {
  isLoading: boolean
  isRefreshing: boolean
  userEmail?: string | null
  onRefresh: () => void
  onLogout: () => void
}

export function KitchenHeader({ isLoading, isRefreshing, userEmail, onRefresh, onLogout }: Props) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Cuisine</h1>
          {userEmail ? (
            <p className="mt-1 text-sm text-muted-foreground">{userEmail}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading || isRefreshing}
            onClick={onRefresh}
          >
            <RefreshCw className={isRefreshing ? 'animate-spin' : ''} />
            Actualiser
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onLogout}>
            Déconnexion
          </Button>
        </div>
      </div>
    </header>
  )
}
