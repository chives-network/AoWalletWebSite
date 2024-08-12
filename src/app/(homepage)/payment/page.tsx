// Component Imports
import Payment from '@views/home/Payment'

export async function generateStaticParams() {
  return [{}]
}

const PaymentPage = async () => {
  // Vars
  const data: any[] = []

  return <Payment data={data} />
}

export default PaymentPage
