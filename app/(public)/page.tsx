import Link from 'next/link'
import { prisma } from '@/app/lib/db'

export default async function CohortsPage() {
  const cohorts = await prisma.cohort.findMany({
    orderBy: [{ isActive: 'desc' }, { orderIndex: 'desc' }],
    include: { hackathons: true },
  })

  const activeCohorts = cohorts.filter((c) => c.isActive)
  const archivedCohorts = cohorts.filter((c) => !c.isActive)

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-12">
        <img src="/bay-logo.png" alt="BAY" className="h-20 w-20 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">BAY Hackathon</h1>
        <p className="text-zinc-500">
          Build And Yield — Yonsei Blockchain hackathon platform for builders.
        </p>
      </div>

      {/* Active Cohorts */}
      {cohorts.length === 0 ? (
        <div className="text-center py-12 border border-zinc-100 rounded-lg">
          <p className="text-zinc-500 text-sm">No cohorts yet. Check back soon!</p>
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {activeCohorts.map((cohort) => (
              <li key={cohort.id}>
                <Link
                  href={`/${cohort.slug}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 bg-white p-4 hover:border-zinc-300 transition-colors"
                >
                  <span className="text-lg font-medium text-zinc-900">{cohort.name}</span>
                  <span className="text-sm text-zinc-500">
                    {cohort.hackathons.length} hackathon
                    {cohort.hackathons.length !== 1 ? 's' : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {archivedCohorts.length > 0 && (
            <>
              <p className="text-xs text-zinc-400 uppercase tracking-wide mt-8 mb-3">
                Past Cohorts
              </p>
              <ul className="space-y-2">
                {archivedCohorts.map((cohort) => (
                  <li key={cohort.id} className="opacity-60">
                    <Link
                      href={`/${cohort.slug}`}
                      className="flex items-center justify-between rounded-lg border border-zinc-100 bg-white p-4 hover:border-zinc-300 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-medium text-zinc-900">{cohort.name}</span>
                        <span className="text-xs text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
                          Archived
                        </span>
                      </div>
                      <span className="text-sm text-zinc-500">
                        {cohort.hackathons.length} hackathon
                        {cohort.hackathons.length !== 1 ? 's' : ''}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  )
}
