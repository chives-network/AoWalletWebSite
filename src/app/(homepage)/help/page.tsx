// Component Imports
import HelpCenterWrapper from '@/views/home/help-center'

export async function generateStaticParams() {
  return [{}]
}

function HelpCenterPage() {
  return <HelpCenterWrapper />
}

export default HelpCenterPage
