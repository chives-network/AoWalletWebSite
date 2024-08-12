
// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'
import NotFound from '@views/NotFound'

// Util Imports
import { getSystemMode, getServerMode } from '@core/utils/serverHelpers'

export async function generateStaticParams() {
  return [{}]
}

const NotFoundPage = () => {
  // Vars
  const direction = 'ltr'
  const systemMode = getSystemMode()
  const mode = getServerMode()

  return (
    <Providers direction={direction}>
      <BlankLayout systemMode={systemMode}>
        <NotFound mode={mode} />
      </BlankLayout>
    </Providers>
  )
}

export default NotFoundPage
