import TermsPage from './terms-client'

// Static page - cache for 1 day
export const revalidate = 86400

export default function Terms() {
  return <TermsPage />
}
