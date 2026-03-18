import { verifySession } from '@/app/lib/dal'
import { prisma } from '@/app/lib/db'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default async function AdminSubmissionsPage() {
  await verifySession()

  const submissions = await prisma.submission.findMany({
    orderBy: { submittedAt: 'desc' },
    include: {
      team: {
        include: {
          hackathon: {
            include: {
              cohort: { select: { name: true, slug: true } },
            },
          },
        },
      },
    },
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Submissions</h1>
        <Badge variant="outline">{submissions.length}</Badge>
      </div>

      {submissions.length === 0 ? (
        <p className="text-zinc-500 text-sm">No submissions yet.</p>
      ) : (
        <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-lg">
          {submissions.map((s) => (
            <div key={s.id} className="px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href="/admin/teams"
                      className="font-medium hover:underline"
                    >
                      {s.team.name}
                    </Link>
                    <Badge variant="outline" className="text-xs">
                      {s.team.hackathon.title}
                    </Badge>
                    <span className="text-xs text-zinc-400">
                      {s.team.hackathon.cohort.name}
                    </span>
                  </div>
                  <div>
                    <a
                      href={s.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {s.githubUrl}
                    </a>
                  </div>
                  <p className="text-sm text-zinc-600">
                    {s.writeup.length > 150 ? s.writeup.slice(0, 150) + '...' : s.writeup}
                  </p>
                </div>
                <div className="text-xs text-zinc-400 whitespace-nowrap shrink-0">
                  {format(s.submittedAt, 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
