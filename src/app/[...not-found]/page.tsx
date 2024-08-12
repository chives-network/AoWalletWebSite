
// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'
import NotFound from '@views/NotFound'

const NotFoundPage = () => {
  // Vars
  const direction = 'ltr'
  const systemMode = 'light'
  const mode = 'light'

  return (
    <Providers direction={direction}>
      <BlankLayout systemMode={systemMode}>
        <NotFound mode={mode} />
      </BlankLayout>
    </Providers>
  )
}

export default NotFoundPage
