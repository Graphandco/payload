import * as migration_20260624_000000_baseline from './20260624_000000_baseline'
import * as migration_20260624_000001_add_site_domain from './20260624_000001_add_site_domain'
import * as migration_20260624_000002_cleanup_products_drop_weights from './20260624_000002_cleanup_products_drop_weights'

export const migrations = [
  {
    up: migration_20260624_000000_baseline.up,
    down: migration_20260624_000000_baseline.down,
    name: '20260624_000000_baseline',
  },
  {
    up: migration_20260624_000001_add_site_domain.up,
    down: migration_20260624_000001_add_site_domain.down,
    name: '20260624_000001_add_site_domain',
  },
  {
    up: migration_20260624_000002_cleanup_products_drop_weights.up,
    down: migration_20260624_000002_cleanup_products_drop_weights.down,
    name: '20260624_000002_cleanup_products_drop_weights',
  },
]
