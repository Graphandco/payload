/**
 * Affichage client de /commande : récap panier, formulaire client, choix du créneau
 * et envoi vers POST /api/orders.
 */
'use client'

import { ClickAndCollectStatusBanner } from '@/components/click-and-collect/ClickAndCollectStatusBanner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { checkoutFormSchema, type CheckoutFormValues } from '@/lib/checkoutFormSchema'
import { formatPrice } from '@/lib/formatPrice'
import {
  formatPickupSlotValue,
  getAvailablePickupSlots,
  type PickupSlot,
} from '@/lib/pickupSlots'
import { isClickAndCollectOpen } from '@/lib/siteSchedule'
import { useCartLines, useCartStore, useCartTotal, type CartLine } from '@/stores/cartStore'
import type { Site } from '@/payload-types'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type Props = {
  site: Site
}

type SubmittedOrder = CheckoutFormValues & {
  displayNumber: string
  trackingToken: string
  lines: CartLine[]
  total: number
  pickupLabel: string
}

const defaultValues: CheckoutFormValues = {
  name: '',
  email: '',
  phone: '',
  pickupSlot: '',
}

function CartRecap({ lines, total }: { lines: CartLine[]; total: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Votre panier</CardTitle>
        <CardDescription>{lines.length} article{lines.length > 1 ? 's' : ''}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="list-none space-y-3 p-0">
          {lines.map((line) => (
            <li key={line.productId} className="flex items-start justify-between gap-4 text-sm">
              <div>
                <p className="font-medium">{line.name}</p>
                <p className="text-muted-foreground">
                  {line.quantity} × {formatPrice(line.price)}
                </p>
              </div>
              <p className="menu-price font-medium">{formatPrice(line.price * line.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t pt-4 font-semibold">
          <span>Total</span>
          <span className="menu-price text-lg">{formatPrice(total)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function PickupSlotField({
  slots,
  value,
  onChange,
}: {
  slots: PickupSlot[]
  value: string
  onChange: (value: string) => void
}) {
  if (slots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun créneau de retrait disponible pour le moment. Vérifiez les horaires du restaurant.
      </p>
    )
  }

  return (
    <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border p-3">
      {slots.map((slot) => (
        <label
          key={slot.value}
          className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50 has-checked:bg-muted"
        >
          <input
            type="radio"
            name="pickupSlot"
            value={slot.value}
            checked={value === slot.value}
            onChange={() => onChange(slot.value)}
            className="size-4 accent-primary"
          />
          <span className="text-sm">{slot.label}</span>
        </label>
      ))}
    </div>
  )
}

function SubmittedPreview({
  order,
}: {
  order: SubmittedOrder
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Commande {order.displayNumber}</CardTitle>
        <CardDescription>
          Votre commande est enregistrée. Le paiement en ligne sera disponible prochainement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-medium text-muted-foreground">Nom</dt>
            <dd className="mt-1">{order.name}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">Email</dt>
            <dd className="mt-1">{order.email}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">Téléphone</dt>
            <dd className="mt-1">{order.phone}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">Créneau de retrait</dt>
            <dd className="mt-1">{order.pickupLabel}</dd>
          </div>
        </dl>

        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">Articles</p>
          <ul className="list-none space-y-2 p-0 text-sm">
            {order.lines.map((line) => (
              <li key={line.productId} className="flex justify-between gap-4">
                <span>
                  {line.name} × {line.quantity}
                </span>
                <span className="menu-price">{formatPrice(line.price * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="menu-price mt-3 text-right font-semibold">{formatPrice(order.total)}</p>
        </div>

        <p className="text-sm text-muted-foreground">
          Conservez ce lien pour suivre votre commande :{' '}
          <Link
            href={`/commande/suivi/${order.trackingToken}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Suivre la commande
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

export function CheckoutView({ site }: Props) {
  const siteId = site.id
  const lines = useCartLines(siteId)
  const total = useCartTotal(siteId)
  const clearSite = useCartStore((state) => state.clearSite)
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<SubmittedOrder | null>(null)

  const pickupSlots = useMemo(() => getAvailablePickupSlots(site), [site])
  const canOrder = isClickAndCollectOpen(site) && pickupSlots.length > 0

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (pickupSlots.length === 1 && !form.getValues('pickupSlot')) {
      form.setValue('pickupSlot', pickupSlots[0].value, { shouldValidate: true })
    }
  }, [pickupSlots, form])

  const handleSubmit = async (values: CheckoutFormValues) => {
    const slotIsValid = pickupSlots.some((slot) => slot.value === values.pickupSlot)
    if (!slotIsValid) {
      form.setError('pickupSlot', { message: 'Créneau invalide ou plus disponible' })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteId,
          name: values.name,
          email: values.email,
          phone: values.phone,
          pickupSlot: values.pickupSlot,
          lines: lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
          })),
        }),
      })

      const data = (await response.json()) as {
        displayNumber?: string
        trackingToken?: string
        total?: number
        pickupLabel?: string
        message?: string
      }

      if (!response.ok) {
        throw new Error(data.message ?? 'Impossible d’enregistrer la commande.')
      }

      const snapshotLines = [...lines]
      const snapshotTotal = total
      const pickupLabel = data.pickupLabel ?? formatPickupSlotValue(values.pickupSlot)

      clearSite(siteId)
      setSubmitted({
        ...values,
        displayNumber: data.displayNumber ?? '',
        trackingToken: data.trackingToken ?? '',
        lines: snapshotLines,
        total: data.total ?? snapshotTotal,
        pickupLabel,
      })
      toast.success(`Commande ${data.displayNumber} enregistrée`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Impossible d’enregistrer la commande.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <h1 className="text-4xl font-semibold tracking-tight">Commande</h1>
        <p className="mt-2 text-neutral-600">Chargement…</p>
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-8 sm:py-12">
        <h1 className="text-4xl font-semibold tracking-tight">Commande</h1>
        <p className="text-neutral-600">Votre panier est vide.</p>
        <Link href="/carte" className="cart-link inline-block font-medium no-underline">
          Voir la carte
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <p className="text-sm text-neutral-600">{site.name}</p>
      <h1 className="text-4xl font-semibold tracking-tight">Commande</h1>
      <p className="mt-2 max-w-2xl text-neutral-600">
        Renseignez vos coordonnées et choisissez un créneau de retrait.
      </p>

      <div className="mt-4">
        <ClickAndCollectStatusBanner site={site} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-12">
        <section aria-labelledby="checkout-cart-heading">
          <h2 id="checkout-cart-heading" className="sr-only">
            Panier
          </h2>
          <CartRecap lines={lines} total={total} />
          <Link
            href="/panier"
            className="cart-link mt-4 inline-block text-sm font-medium no-underline"
          >
            Modifier le panier
          </Link>
        </section>

        <section aria-labelledby="checkout-form-heading">
          <h2 id="checkout-form-heading" className="text-lg font-semibold">
            Coordonnées & retrait
          </h2>

          <div className="mt-4">
            {submitted ? (
              <SubmittedPreview order={submitted} />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                              <Input autoComplete="name" placeholder="Votre nom" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                autoComplete="email"
                                placeholder="vous@exemple.fr"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                autoComplete="tel"
                                placeholder="06 12 34 56 78"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pickupSlot"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Créneau de retrait</FormLabel>
                            <PickupSlotField
                              slots={pickupSlots}
                              value={field.value}
                              onChange={field.onChange}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {!canOrder ? (
                        <p className="text-sm text-amber-800">
                          Commande indisponible : click & collect fermé ou aucun créneau libre.
                        </p>
                      ) : null}

                      <Button
                        type="submit"
                        className="w-full sm:w-auto"
                        disabled={!canOrder || isSubmitting}
                      >
                        {isSubmitting ? 'Enregistrement…' : 'Confirmer la commande'}
                      </Button>

                      <p className="text-xs text-muted-foreground">
                        Le paiement en ligne sera disponible prochainement.
                      </p>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
