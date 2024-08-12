'use client'

// Component Imports
import LandingPageWrapper from '@/views/home/landing-page'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const LandingPage = () => {
  // Vars
  const mode = getServerMode()

  return <LandingPageWrapper mode={mode} />
}

export default LandingPage
