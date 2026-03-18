import { verifySession } from '@/app/lib/dal'
import { prisma } from '@/app/lib/db'
import Link from 'next/link'

export default async function AdminCohortsPage() {
  await verifySession()

  const cohorts = await prisma.cohort.findMany({
    orderBy: { orderIndex: 'asc' },
    include: { _count: { select: { hackathons: true } } },
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cohorts</h1>
        <Link
          href="/admin/cohorts/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-2.5 h-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          New Cohort
        </Link>
      </div>

      {cohorts.length === 0 ? (
        <p className="text-zinc-500 text-sm">No cohorts yet. Create the first one.</p>
      ) : (
        <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-lg">
          {cohorts.map((cohort) => (
            <div key={cohort.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="font-medium">{cohort.name}</span>
                <span className="ml-2 text-xs text-zinc-400">/{cohort.slug}</span>
                <span className="ml-3 text-xs text-zinc-500">
                  {cohort._count.hackathons} hackathon{cohort._count.hackathons !== 1 ? 's' : ''}
                </span>
              </div>
              <Link
                href={`/admin/cohorts/${cohort.id}/edit`}
                className="inline-flex items-center justify-center rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 h-7 text-[0.8rem] font-medium transition-colors hover:bg-muted hover:text-foreground"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
