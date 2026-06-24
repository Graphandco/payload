import * as migration_20260624_000000_baseline from './20260624_000000_baseline'
import * as migration_20260624_000001_add_site_domain from './20260624_000001_add_site_domain'

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
]
