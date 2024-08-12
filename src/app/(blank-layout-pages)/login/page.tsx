// Next Imports
import type { Metadata } from 'next'

// Component Imports
import Login from '@views/Login'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account'
}

const LoginPage = () => {
  // Vars
  const mode = 'light'

  return <Login mode={mode} />
}

export default LoginPage
