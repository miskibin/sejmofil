import { Metadata } from 'next'
import { getClubsWithStats, getClubInfluenceScores, getClubDemographics, getClubTopics, ClubDemographics } from '@/lib/queries/clubs'
import { ClubsContent } from './clubs-content'

export const metadata: Metadata = {
  title: 'Kluby Parlamentarne | Sejmofil',
  description: 'Przeglądaj kluby parlamentarne Sejmu RP. Zobacz skład, statystyki, wpływ legislacyjny i główne tematy każdego klubu.',
}

// Enable ISR with revalidation every hour
export const revalidate = 3600

async function getClubsData() {
  const [clubs, influenceScores] = await Promise.all([
    getClubsWithStats(),
    getClubInfluenceScores(),
  ])

  // Get demographics and topics for ALL clubs
  const allDemographicsPromises = clubs.map(async (club) => {
    const demographics = await getClubDemographics(club.id)
    return demographics ? { ...demographics, clubId: club.id } : null
  })
  
  const allTopicsPromises = clubs.map(async (club) => {
    const topics = await getClubTopics(club.id, 15)
    return { clubId: club.id, topics }
  })

  const [allDemographicsResults, allTopicsResults] = await Promise.all([
    Promise.all(allDemographicsPromises),
    Promise.all(allTopicsPromises),
  ])

  const allDemographics = allDemographicsResults.filter(
    (item): item is ClubDemographics & { clubId: string } => item !== null
  )

  return {
    clubs,
    influenceScores,
    allDemographics,
    allTopics: allTopicsResults,
  }
}

export default async function ClubsPage() {
  const data = await getClubsData()

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Kluby Parlamentarne</h1>
        <p className="text-muted-foreground">
          Analiza składu, aktywności i wpływu klubów parlamentarnych w Sejmie RP
        </p>
      </div>

      <ClubsContent {...data} />
    </div>
  )
}

