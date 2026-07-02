/**
 * Vitrine click & collect Graph & Co — démo live pour prospects restaurateurs.
 */
import type { Site } from '@/payload-types'
import GraphandcoHero from './components/home/Hero'
import GraphandcoFeatures from './components/home/Features'
import HowItWorks from './components/home/HowItWorks'
import StaffSpaces from './components/home/StaffSpaces'
import Audiences from './components/home/Audiences'
import DemoCTA from './components/home/DemoCTA'

type Props = {
  site: Site
}

export default function GraphandcoHomePage({ site }: Props) {
  return (
    <div className="graphandco-landing">
      <GraphandcoHero site={site} />
      <GraphandcoFeatures />
      <HowItWorks />
      <StaffSpaces />
      <Audiences />
      <DemoCTA />
    </div>
  )
}
