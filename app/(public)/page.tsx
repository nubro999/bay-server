import Link from 'next/link'
import { prisma } from '@/app/lib/db'

export default async function CohortsPage() {
  const cohorts = await prisma.cohort.findMany({
    orderBy: { orderIndex: 'desc' },
    include: { hackathons: true },
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 mb-1">BAY Cohorts</h1>
      <p className="text-sm text-zinc-500 mb-8">Browse hackathon tracks by cohort</p>

      {cohorts.length === 0 ? (
        <p className="text-zinc-500 text-sm">No cohorts yet.</p>
      ) : (
        <ul className="space-y-2">
          {cohorts.map((cohort) => (
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
      )}
    </div>
  )
}
