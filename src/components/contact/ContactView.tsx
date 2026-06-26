/**
 * Affichage client de /contact : coordonnées du site et formulaire (aperçu, Resend plus tard).
 */
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { contactFormSchema, type ContactFormValues } from '@/lib/contactFormSchema'
import { formatSiteAddress, hasSiteContactDetails } from '@/lib/formatSiteAddress'
import type { Site } from '@/payload-types'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

type Props = {
  site: Site
}

const defaultValues: ContactFormValues = {
  name: '',
  email: '',
  message: '',
}

function ContactDetails({ site }: { site: Site }) {
  const { email, phone } = site.contact ?? {}
  const formattedAddress = formatSiteAddress(site.contact)
  const hasDetails = hasSiteContactDetails(site.contact)

  if (!hasDetails) {
    return (
      <p className="text-sm text-muted-foreground">
        Les coordonnées du restaurant seront bientôt disponibles ici.
      </p>
    )
  }

  return (
    <ul className="space-y-4 text-sm">
      {formattedAddress ? (
        <li className="flex gap-3">
          <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="whitespace-pre-line">{formattedAddress}</span>
        </li>
      ) : null}
      {phone ? (
        <li className="flex gap-3">
          <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:underline">
            {phone}
          </a>
        </li>
      ) : null}
      {email ? (
        <li className="flex gap-3">
          <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <a href={`mailto:${email}`} className="hover:underline">
            {email}
          </a>
        </li>
      ) : null}
    </ul>
  )
}

function SubmittedPreview({ values, onReset }: { values: ContactFormValues; onReset: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Message envoyé (aperçu)</CardTitle>
        <CardDescription>
          L&apos;envoi par email sera branché plus tard. Voici ce qui a été saisi :
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-medium text-muted-foreground">Nom</dt>
            <dd className="mt-1">{values.name}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">Email</dt>
            <dd className="mt-1">
              <a href={`mailto:${values.email}`} className="hover:underline">
                {values.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">Message</dt>
            <dd className="mt-1 whitespace-pre-wrap">{values.message}</dd>
          </div>
        </dl>
        <Button type="button" variant="outline" onClick={onReset}>
          Envoyer un autre message
        </Button>
      </CardContent>
    </Card>
  )
}

export function ContactView({ site }: Props) {
  const [submitted, setSubmitted] = useState<ContactFormValues | null>(null)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
  })

  const handleSubmit = (values: ContactFormValues) => {
    setSubmitted(values)
  }

  const handleReset = () => {
    setSubmitted(null)
    form.reset(defaultValues)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <p className="text-sm text-neutral-600">{site.name}</p>
      <h1 className="text-4xl font-semibold tracking-tight">Contact</h1>
      <p className="mt-2 max-w-2xl text-neutral-600">
        Une question, une réservation ou un renseignement ? Écrivez-nous.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-12">
        <section aria-labelledby="contact-details-heading">
          <h2 id="contact-details-heading" className="text-lg font-semibold">
            Nos coordonnées
          </h2>
          <div className="mt-4">
            <ContactDetails site={site} />
          </div>
        </section>

        <section aria-labelledby="contact-form-heading">
          <h2 id="contact-form-heading" className="text-lg font-semibold">
            Nous écrire
          </h2>

          <div className="mt-4">
            {submitted ? (
              <SubmittedPreview values={submitted} onReset={handleReset} />
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
                              <Input
                                className="py-6"
                                autoComplete="name"
                                placeholder="Votre nom"
                                {...field}
                              />
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
                                className="py-6"
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
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={6}
                                placeholder="Votre message…"
                                className="min-h-32"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full sm:w-auto">
                        Envoyer
                      </Button>
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
