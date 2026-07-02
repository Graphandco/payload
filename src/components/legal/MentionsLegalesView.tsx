import {
  LegalLabelValue,
  LegalPageLayout,
  LegalParagraph,
  LegalSection,
} from '@/components/legal/LegalPageLayout'
import { getSiteLegalContext } from '@/lib/legal/getSiteLegalContext'
import { PLATFORM_DEVELOPER, PLATFORM_HOSTING } from '@/lib/legal/platformLegal'
import type { Site } from '@/payload-types'

type Props = {
  site: Site
}

export function MentionsLegalesView({ site }: Props) {
  const legal = getSiteLegalContext(site)

  return (
    <LegalPageLayout title="Mentions légales">
      <LegalSection title="Ce site web est édité par :">
        <LegalLabelValue label="Représentant légal" value={legal.legalRepresentative} />
        <LegalLabelValue label="Directeur de la publication" value={legal.publicationDirector} />
        <LegalLabelValue label="Raison sociale" value={legal.companyName} />
        <LegalLabelValue label="Adresse" value={legal.addressLine} />
        <LegalLabelValue label="Mail" value={legal.email} />
        <LegalLabelValue label="Téléphone" value={legal.phone} />
        {legal.siret ? <LegalLabelValue label="SIRET" value={legal.siret} /> : null}
      </LegalSection>

      <LegalSection title="Ce site web a été développé par :">
        <LegalParagraph>
          <strong className="font-medium text-foreground">{PLATFORM_DEVELOPER.name}</strong>
        </LegalParagraph>
        <LegalLabelValue label="Adresse" value={`${PLATFORM_DEVELOPER.street}, ${PLATFORM_DEVELOPER.cityLine}`} />
        <LegalLabelValue label="Mail" value={PLATFORM_DEVELOPER.email} />
        <LegalLabelValue label="Téléphone" value={PLATFORM_DEVELOPER.phone} />
        <LegalLabelValue label="SIRET" value={PLATFORM_DEVELOPER.siret} />
      </LegalSection>

      <LegalSection title="Ce site web est hébergé par :">
        <LegalParagraph>
          {PLATFORM_HOSTING.name}, dont le siège social est : {PLATFORM_HOSTING.headquarters}
        </LegalParagraph>
      </LegalSection>
    </LegalPageLayout>
  )
}
