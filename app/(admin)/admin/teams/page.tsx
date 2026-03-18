import { verifySession } from '@/app/lib/dal'
import { prisma } from '@/app/lib/db'
import { deleteTeam, removeMember } from '@/app/actions/admin-teams'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default async function AdminTeamsPage() {
  await verifySession()

  const cohorts = await prisma.cohort.findMany({
    orderBy: { orderIndex: 'asc' },
    include: {
      hackathons: {
        orderBy: { createdAt: 'asc' },
        include: {
          teams: {
            orderBy: { createdAt: 'asc' },
            include: {
              members: { orderBy: { joinedAt: 'asc' } },
              _count: { select: { updates: true } },
              submission: { select: { id: true } },
            },
          },
        },
      },
    },
  })

  const totalTeams = cohorts.reduce(
    (sum, c) => sum + c.hackathons.reduce((s, h) => s + h.teams.length, 0),
    0
  )

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Teams</h1>
      </div>

      {totalTeams === 0 ? (
        <p className="text-zinc-500 text-sm">No teams yet.</p>
      ) : (
        <div className="space-y-8">
          {cohorts
            .filter((c) => c.hackathons.some((h) => h.teams.length > 0))
            .map((cohort) => (
              <div key={cohort.id}>
                <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
                  {cohort.name}
                </h2>
                <div className="space-y-6">
                  {cohort.hackathons
                    .filter((h) => h.teams.length > 0)
                    .map((hackathon) => (
                      <div key={hackathon.id}>
                        <h3 className="text-base font-medium text-zinc-700 mb-2">{hackathon.title}</h3>
                        <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-lg">
                          {hackathon.teams.map((team) => (
                            <div key={team.id} className="px-4 py-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{team.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {team.members.length}/5 members
                                  </Badge>
                                  {team.submission ? (
                                    <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                                      Submitted
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs text-zinc-400">
                                      No submission
                                    </Badge>
                                  )}
                                  <span className="text-xs text-zinc-400">
                                    {team._count.updates} update{team._count.updates !== 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/admin/teams/${team.id}/edit`}
                                    className="inline-flex items-center justify-center rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 h-7 text-[0.8rem] font-medium transition-colors hover:bg-muted hover:text-foreground"
                                  >
                                    Edit
                                  </Link>
                                  <form
                                    action={deleteTeam.bind(null, team.id) as (formData: FormData) => Promise<void>}
                                  >
                                    <Button variant="destructive" size="sm" type="submit">Delete</Button>
                                  </form>
                                </div>
                              </div>

                              {team.members.length > 0 && (
                                <div className="mt-2 divide-y divide-zinc-50 border border-zinc-100 rounded-md">
                                  {team.members.map((m) => (
                                    <div key={m.id} className="flex items-center justify-between px-3 py-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm">{m.name}</span>
                                        <Badge variant="outline" className="text-xs">{m.role}</Badge>
                                        <span className="text-xs text-zinc-400">
                                          joined {format(m.joinedAt, 'MMM d')}
                                        </span>
                                      </div>
                                      <form
                                        action={
                                          removeMember.bind(null, m.id, team.id) as (
                                            formData: FormData
                                          ) => Promise<void>
                                        }
                                      >
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-500 hover:text-red-700"
                                          type="submit"
                                        >
                                          Remove
                                        </Button>
                                      </form>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
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
