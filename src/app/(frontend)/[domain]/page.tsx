type Props = {
  params: Promise<{ domain: string }>
}

export default async function TenantHomePage({ params }: Props) {
  const { domain } = await params

  return (
    <main>
      <h1>Domaine détecté : {domain}</h1>
    </main>
  )
}
