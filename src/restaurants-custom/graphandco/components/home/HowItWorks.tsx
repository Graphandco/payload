type Step = {
  num: string
  title: string
  description: string
}

const steps: readonly Step[] = [
  {
    num: '01',
    title: 'On configure votre site',
    description:
      'Nom, domaine, carte, horaires et créneaux — nous adaptons la plateforme à votre établissement.',
  },
  {
    num: '02',
    title: 'Vos clients commandent',
    description:
      'Ils parcourent la carte, ajoutent au panier et choisissent leur créneau de retrait.',
  },
  {
    num: '03',
    title: 'Vous préparez sereinement',
    description:
      'Les commandes arrivent dans votre espace. Vous cuisinez au rythme des créneaux réservés.',
  },
]

export default function HowItWorks() {
  return (
    <section className="border-y border-border bg-white px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Comment ça marche</h2>
        <ol className="mt-10 grid gap-10 sm:grid-cols-3">
          {steps.map((step) => (
            <li key={step.num}>
              <p className="text-3xl font-bold text-(--graphandco-accent-start)">{step.num}</p>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
