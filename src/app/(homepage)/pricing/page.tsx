// Component Imports
import PricingWrapper from '@/views/home/pricing'

export async function generateStaticParams() {
  return [{}]
}

const PricingPage = async () => {
  // Vars
  const data: any[] = []

  return <PricingWrapper data={data} />
}

export default PricingPage
