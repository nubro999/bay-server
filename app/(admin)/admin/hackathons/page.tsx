import { verifySession } from '@/app/lib/dal'
import { prisma } from '@/app/lib/db'
import { deleteHackathon } from '@/app/actions/hackathons'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default async function AdminHackathonsPage() {
  await verifySession()

  // Fetch hackathons grouped under their cohorts — always cohort-scoped (CHRT-02)
  // ordered by cohort display order, then hackathon creation date
  const cohorts = await prisma.cohort.findMany({
    orderBy: { orderIndex: 'asc' },
    include: {
      hackathons: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  const totalHackathons = cohorts.reduce((sum, c) => sum + c.hackathons.length, 0)

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Hackathons</h1>
        <Link
          href="/admin/hackathons/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-2.5 h-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          New Hackathon
        </Link>
      </div>

      {totalHackathons === 0 ? (
        <p className="text-zinc-500 text-sm">No hackathons yet. Create a cohort first, then add hackathons.</p>
      ) : (
        <div className="space-y-8">
          {cohorts.filter((c) => c.hackathons.length > 0).map((cohort) => (
            <div key={cohort.id}>
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">{cohort.name}</h2>
              <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-lg">
                {cohort.hackathons.map((h) => (
                  <div key={h.id} className="flex items-center justify-between px-4 py-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{h.title}</span>
                        <Badge variant="outline" className="text-xs">{h.track}</Badge>
                      </div>
                      <p className="text-xs text-zinc-400">
                        {format(h.startsAt, 'MMM d, yyyy')} – {format(h.endsAt, 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/hackathons/${h.id}/edit`}
                        className="inline-flex items-center justify-center rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 h-7 text-[0.8rem] font-medium transition-colors hover:bg-muted hover:text-foreground"
                      >
                        Edit
                      </Link>
                      <form action={deleteHackathon.bind(null, h.id) as (formData: FormData) => Promise<void>}>
                        <Button variant="destructive" size="sm" type="submit">Delete</Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
