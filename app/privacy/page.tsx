import PrivacyPage from './privacy-client'

// Static page - cache for 1 day
export const revalidate = 86400

export default function Privacy() {
  return <PrivacyPage />
}
