import * as migration_20260624_000000_baseline from './20260624_000000_baseline'
import * as migration_20260624_000001_add_site_domain from './20260624_000001_add_site_domain'
import * as migration_20260624_000002_cleanup_products_drop_weights from './20260624_000002_cleanup_products_drop_weights'
import * as migration_20260626_124619 from './20260626_124619'
import * as migration_20260626_145200_site_schedule_settings from './20260626_145200_site_schedule_settings'
import * as migration_20260626_175500_weekly_hours_by_day from './20260626_175500_weekly_hours_by_day'
import * as migration_20260626_183000_contact_address_fields from './20260626_183000_contact_address_fields'

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
  {
    up: migration_20260626_124619.up,
    down: migration_20260626_124619.down,
    name: '20260626_124619',
  },
  {
    up: migration_20260626_145200_site_schedule_settings.up,
    down: migration_20260626_145200_site_schedule_settings.down,
    name: '20260626_145200_site_schedule_settings',
  },
  {
    up: migration_20260626_175500_weekly_hours_by_day.up,
    down: migration_20260626_175500_weekly_hours_by_day.down,
    name: '20260626_175500_weekly_hours_by_day',
  },
  {
    up: migration_20260626_183000_contact_address_fields.up,
    down: migration_20260626_183000_contact_address_fields.down,
    name: '20260626_183000_contact_address_fields',
  },
]
