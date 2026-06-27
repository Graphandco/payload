import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

type Props = {
  isLoading: boolean
  isRefreshing: boolean
  onRefresh: () => void
}

export function KitchenHeader({ isLoading, isRefreshing, onRefresh }: Props) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Cuisine</h1>
        </div>
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
      </div>
    </header>
  )
}
