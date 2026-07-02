import type { ReactNode } from 'react'

type Props = {
  title: string
  children: ReactNode
}

export function LegalPageLayout({ title, children }: Props) {
  return (
    <article className="cms-page mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1>{title}</h1>
      <div className="cms-content legal-content">{children}</div>
    </article>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  )
}

export function LegalParagraph({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export function LegalLabelValue({ label, value }: { label: string; value: string | null }) {
  if (!value) {
    return null
  }

  return (
    <p className="text-sm leading-relaxed text-muted-foreground">
      <strong className="font-medium text-foreground">{label}</strong> : {value}
    </p>
  )
}
