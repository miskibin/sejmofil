import { getProceedingDates } from '@/lib/queries/proceeding'
import { getNextProceedingDate, getTimeUntilNextProceeding } from '@/lib/utils'

export async function DeliberationsRemain() {
  const proceedings = await getProceedingDates()
  const nextDate = getNextProceedingDate(proceedings)
  const timeUntil = getTimeUntilNextProceeding(nextDate)

  return (
    <div className="mb-4 mt-16 sm:mb-8">
      <h1 className="px-2 text-2xl font-semibold">
        {nextDate ? (
          <>
            {timeUntil === '0' ? (
              'Obrady trwają'
            ) : (
              <>
                Do następnych Obrad zostało{' '}
                <span className="text-primary">{timeUntil}</span>
              </>
            )}
          </>
        ) : (
          <span>Brak zaplanowanych obrad</span>
        )}
      </h1>
    </div>
  )
}
