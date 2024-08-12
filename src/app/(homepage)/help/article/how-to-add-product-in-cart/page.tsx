// Component Imports
import Questions from '@/views/home/help-center/Questions'

export async function generateStaticParams() {
  return [{}]
}

const Article = () => {
  return <Questions />
}

export default Article
