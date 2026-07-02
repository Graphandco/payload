import * as migration_20260624_000000_baseline from './20260624_000000_baseline'
import * as migration_20260624_000001_add_site_domain from './20260624_000001_add_site_domain'
import * as migration_20260624_000002_cleanup_products_drop_weights from './20260624_000002_cleanup_products_drop_weights'
import * as migration_20260626_124619 from './20260626_124619'
import * as migration_20260626_145200_site_schedule_settings from './20260626_145200_site_schedule_settings'
import * as migration_20260626_175500_weekly_hours_by_day from './20260626_175500_weekly_hours_by_day'
import * as migration_20260626_183000_contact_address_fields from './20260626_183000_contact_address_fields'
import * as migration_20260626_193500_orders from './20260626_193500_orders'
import * as migration_20260626_200000_orders_locked_documents_rels from './20260626_200000_orders_locked_documents_rels'
import * as migration_20260627_000000_click_and_collect_slot_settings from './20260627_000000_click_and_collect_slot_settings'
import * as migration_20260628_063500_schedule_service_periods from './20260628_063500_schedule_service_periods'
import * as migration_20260628_120000_mollie_payment from './20260628_120000_mollie_payment'
import * as migration_20260629_010000_order_confirmation_email_sent from './20260629_010000_order_confirmation_email_sent'
import * as migration_20260630_120000_invoices_and_legal from './20260630_120000_invoices_and_legal'
import * as migration_20260630_130000_invoice_sequences_locked_documents_rels from './20260630_130000_invoice_sequences_locked_documents_rels'
import * as migration_20260701_100000_legal_representative from './20260701_100000_legal_representative'

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
  {
    up: migration_20260626_193500_orders.up,
    down: migration_20260626_193500_orders.down,
    name: '20260626_193500_orders',
  },
  {
    up: migration_20260626_200000_orders_locked_documents_rels.up,
    down: migration_20260626_200000_orders_locked_documents_rels.down,
    name: '20260626_200000_orders_locked_documents_rels',
  },
  {
    up: migration_20260627_000000_click_and_collect_slot_settings.up,
    down: migration_20260627_000000_click_and_collect_slot_settings.down,
    name: '20260627_000000_click_and_collect_slot_settings',
  },
  {
    up: migration_20260628_063500_schedule_service_periods.up,
    down: migration_20260628_063500_schedule_service_periods.down,
    name: '20260628_063500_schedule_service_periods',
  },
  {
    up: migration_20260628_120000_mollie_payment.up,
    down: migration_20260628_120000_mollie_payment.down,
    name: '20260628_120000_mollie_payment',
  },
  {
    up: migration_20260629_010000_order_confirmation_email_sent.up,
    down: migration_20260629_010000_order_confirmation_email_sent.down,
    name: '20260629_010000_order_confirmation_email_sent',
  },
  {
    up: migration_20260630_120000_invoices_and_legal.up,
    down: migration_20260630_120000_invoices_and_legal.down,
    name: '20260630_120000_invoices_and_legal',
  },
  {
    up: migration_20260630_130000_invoice_sequences_locked_documents_rels.up,
    down: migration_20260630_130000_invoice_sequences_locked_documents_rels.down,
    name: '20260630_130000_invoice_sequences_locked_documents_rels',
  },
  {
    up: migration_20260701_100000_legal_representative.up,
    down: migration_20260701_100000_legal_representative.down,
    name: '20260701_100000_legal_representative',
  },
]
