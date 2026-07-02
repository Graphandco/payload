import {
  LegalLabelValue,
  LegalList,
  LegalPageLayout,
  LegalParagraph,
  LegalSection,
} from '@/components/legal/LegalPageLayout'
import { formatLegalLastUpdated, getSiteLegalContext } from '@/lib/legal/getSiteLegalContext'
import type { Site } from '@/payload-types'

type Props = {
  site: Site
}

export function PrivacyPolicyView({ site }: Props) {
  const legal = getSiteLegalContext(site)
  const privacyEmail = legal.privacyContactEmail ?? legal.email

  return (
    <LegalPageLayout title="Politique de confidentialité">
      <LegalSection title="1. Introduction">
        <LegalParagraph>
          Dans le cadre de son activité, {legal.companyName} est amené à collecter et traiter des
          données personnelles dans le cadre du service de click &amp; collect proposé sur ce site.
          Nous nous engageons à respecter votre vie privée et à protéger les informations
          personnelles que vous nous fournissez. Cette politique de confidentialité vous informe sur
          la manière dont nous recueillons, utilisons et protégeons vos données.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="2. Responsable du traitement">
        <LegalLabelValue label="Responsable éditorial" value={legal.legalRepresentative} />
        <LegalLabelValue label="Raison sociale" value={legal.companyName} />
        <LegalLabelValue label="Téléphone" value={legal.phone} />
        <LegalLabelValue label="Email" value={privacyEmail} />
      </LegalSection>

      <LegalSection title="3. Données collectées">
        <LegalParagraph>
          Nous ne collectons que les données strictement nécessaires au bon fonctionnement du site,
          à la prise de commande en ligne et à la réponse à vos demandes.
        </LegalParagraph>

        <div className="space-y-2">
          <h3 className="text-base font-medium text-foreground">a. Commande click &amp; collect</h3>
          <LegalParagraph>
            Lorsque vous passez commande sur notre site, nous collectons les informations suivantes
            :
          </LegalParagraph>
          <LegalList
            items={[
              'Nom et prénom',
              'Adresse e-mail',
              'Numéro de téléphone',
              'Créneau de retrait choisi',
              'Détail de la commande (articles, quantités, montants)',
            ]}
          />
          <LegalParagraph>
            Ces données sont utilisées pour préparer votre commande, vous envoyer la confirmation et
            assurer le suivi de votre retrait. Elles ne sont pas vendues à des tiers.
          </LegalParagraph>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-medium text-foreground">b. Paiement en ligne</h3>
          <LegalParagraph>
            Le paiement est traité par notre prestataire Mollie. Nous ne conservons pas vos
            coordonnées bancaires complètes sur nos serveurs. Mollie peut collecter des données
            nécessaires à la transaction et à la lutte contre la fraude, conformément à sa propre
            politique de confidentialité.
          </LegalParagraph>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-medium text-foreground">c. E-mails transactionnels</h3>
          <LegalParagraph>
            Après validation du paiement, un e-mail de confirmation peut vous être envoyé via notre
            prestataire d&apos;envoi d&apos;e-mails (Brevo), contenant le récapitulatif de votre
            commande et les informations de retrait.
          </LegalParagraph>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-medium text-foreground">d. Formulaire de contact</h3>
          <LegalParagraph>
            Si vous utilisez notre formulaire de contact, nous collectons les informations que vous
            y renseignez (nom, e-mail, téléphone le cas échéant, contenu du message). Ces données
            sont utilisées uniquement pour vous répondre.
          </LegalParagraph>
        </div>

        {privacyEmail ? (
          <LegalParagraph>
            Vous disposez à tout moment d&apos;un droit d&apos;accès, de modification, de
            rectification et de suppression des données personnelles recueillies sur notre site.
            Vous disposez également d&apos;un droit de limitation et d&apos;opposition au
            traitement de vos données personnelles. Vous pouvez exercer l&apos;ensemble de ces
            droits en nous contactant : {privacyEmail}
          </LegalParagraph>
        ) : null}
      </LegalSection>

      <LegalSection title="4. Base légale du traitement">
        <LegalParagraph>Les traitements sont fondés sur :</LegalParagraph>
        <LegalList
          items={[
            "L'exécution du contrat (traitement et préparation de votre commande)",
            'Votre consentement (formulaire de contact)',
            "Notre intérêt légitime à assurer le bon fonctionnement du service de click & collect",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Durée de conservation">
        <LegalList
          items={[
            'Les données liées aux commandes sont conservées pendant la durée nécessaire à la gestion de la relation commerciale et aux obligations comptables et légales.',
            'Les données issues du formulaire de contact sont conservées 12 mois maximum à compter du dernier échange.',
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Vos droits">
        <LegalParagraph>Conformément au RGPD, vous disposez des droits suivants :</LegalParagraph>
        <LegalList
          items={[
            "Droit d'accès",
            'Droit de rectification',
            "Droit à l'effacement",
            'Droit à la limitation du traitement',
            "Droit d'opposition",
            'Droit à la portabilité',
          ]}
        />
        {privacyEmail ? (
          <LegalParagraph>Pour exercer vos droits, contactez-nous à : {privacyEmail}</LegalParagraph>
        ) : null}
      </LegalSection>

      <LegalSection title="7. Cookies">
        <LegalParagraph>Lors de votre navigation, des cookies peuvent être déposés :</LegalParagraph>
        <LegalList
          items={[
            'Cookies fonctionnels : nécessaires au fonctionnement du site et du panier',
            'Cookies de session : pour maintenir votre navigation et votre authentification staff le cas échéant',
          ]}
        />
      </LegalSection>

      <LegalSection title="8. Sécurité">
        <LegalParagraph>
          Nous mettons en œuvre toutes les mesures techniques et organisationnelles nécessaires pour
          assurer la sécurité de vos données personnelles.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="9. Modifications">
        <LegalParagraph>
          Cette politique peut être mise à jour à tout moment. Dernière mise à jour :{' '}
          {formatLegalLastUpdated()}
        </LegalParagraph>
      </LegalSection>
    </LegalPageLayout>
  )
}
