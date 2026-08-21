/**
 * Affichage client de /contact : coordonnées du site et formulaire (envoi via Brevo).
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
import type { Site } from '@/payload-types'
import { SiteContactDetails } from '@/components/contact/SiteContactDetails'
import { zodResolver } from '@hookform/resolvers/zod'
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

type SubmitState = 'idle' | 'loading' | 'success' | 'error'

export function ContactView({ site }: Props) {
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
  })

  const handleSubmit = async (values: ContactFormValues) => {
    setSubmitState('loading')
    setErrorMessage(null)

    const website =
      document.querySelector<HTMLInputElement>('input[name="contact-website"]')?.value ?? ''

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          website,
        }),
      })

      const data = (await response.json().catch(() => null)) as {
        message?: string
        error?: string
      } | null

      if (!response.ok) {
        setSubmitState('error')
        setErrorMessage(data?.message ?? "Impossible d'envoyer le message. Réessayez plus tard.")
        return
      }

      setSubmitState('success')
      form.reset(defaultValues)
    } catch {
      setSubmitState('error')
      setErrorMessage("Impossible d'envoyer le message. Vérifiez votre connexion et réessayez.")
    }
  }

  const handleReset = () => {
    setSubmitState('idle')
    setErrorMessage(null)
    form.reset(defaultValues)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <p className="text-sm text-neutral-600">{site.name}</p>
      <h1 className="text-4xl font-semibold tracking-tight">Contact</h1>
      <p className="mt-2 max-w-2xl text-neutral-600">
        Vous avez des questions, des suggestions ou des demandes de service ? Écrivez-nous.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-12">
        <section aria-labelledby="contact-details-heading">
          <h2 id="contact-details-heading" className="text-lg font-semibold">
            Nos coordonnées
          </h2>
          <div className="mt-4">
            <SiteContactDetails site={site} />
          </div>
        </section>

        <section aria-labelledby="contact-form-heading">
          <h2 id="contact-form-heading" className="text-lg font-semibold">
            Nous écrire
          </h2>

          <div className="mt-4">
            {submitState === 'success' ? (
              <Card>
                <CardHeader>
                  <CardTitle>Message envoyé</CardTitle>
                  <CardDescription>
                    Merci, votre message a bien été transmis. Nous vous répondrons dès que possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Envoyer un autre message
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <input
                        type="text"
                        name="contact-website"
                        tabIndex={-1}
                        autoComplete="off"
                        className="hidden"
                        aria-hidden
                      />

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
                                disabled={submitState === 'loading'}
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
                                disabled={submitState === 'loading'}
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
                                disabled={submitState === 'loading'}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {submitState === 'error' && errorMessage ? (
                        <p className="text-sm text-destructive" role="alert">
                          {errorMessage}
                        </p>
                      ) : null}

                      <Button
                        type="submit"
                        className="w-full sm:w-auto"
                        disabled={submitState === 'loading'}
                      >
                        {submitState === 'loading' ? 'Envoi en cours…' : 'Envoyer'}
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
