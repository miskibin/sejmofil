import SejmGame from './game-client'

// Static page - cache for 1 day
export const revalidate = 86400

export default function GamePage() {
  return <SejmGame />
}
