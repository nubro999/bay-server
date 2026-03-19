import { verifySession } from '@/app/lib/dal'
import { prisma } from '@/app/lib/db'
import { toggleCohortArchive, deleteCohort } from '@/app/actions/cohorts'
import Link from 'next/link'
import { DeleteCohortButton } from '@/app/ui/admin/DeleteCohortButton'

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
                {!cohort.isActive && (
                  <span className="text-xs text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded ml-2">
                    Archived
                  </span>
                )}
                <span className="ml-2 text-xs text-zinc-400">/{cohort.slug}</span>
                <span className="ml-3 text-xs text-zinc-500">
                  {cohort._count.hackathons} hackathon{cohort._count.hackathons !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <form action={toggleCohortArchive.bind(null, cohort.id) as unknown as () => void}>
                  <button
                    type="submit"
                    className={
                      cohort.isActive
                        ? 'text-sm text-zinc-500 hover:text-zinc-900'
                        : 'text-sm text-green-600 hover:text-green-800'
                    }
                  >
                    {cohort.isActive ? 'Archive' : 'Unarchive'}
                  </button>
                </form>
                <Link
                  href={`/admin/cohorts/${cohort.id}/edit`}
                  className="inline-flex items-center justify-center rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 h-7 text-[0.8rem] font-medium transition-colors hover:bg-muted hover:text-foreground"
                >
                  Edit
                </Link>
                <DeleteCohortButton
                  cohortId={cohort.id}
                  cohortName={cohort.name}
                  hackathonCount={cohort._count.hackathons}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
