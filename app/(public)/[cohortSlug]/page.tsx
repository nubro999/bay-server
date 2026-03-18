import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { prisma } from '@/app/lib/db'

export default async function CohortPage({
  params,
}: {
  params: Promise<{ cohortSlug: string }>
}) {
  const { cohortSlug } = await params

  const cohort = await prisma.cohort.findUnique({
    where: { slug: cohortSlug },
    include: {
      hackathons: {
        orderBy: { startsAt: 'asc' },
      },
    },
  })

  if (!cohort) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 mb-1">{cohort.name}</h1>
        <p className="text-sm text-zinc-500">
          {cohort.hackathons.length} hackathon
          {cohort.hackathons.length !== 1 ? ' tracks' : ' track'}
        </p>
      </div>

      {!cohort.isActive && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-6">
          <p className="text-sm text-amber-800">
            This cohort has been archived. You are viewing a read-only record.
          </p>
        </div>
      )}

      {cohort.hackathons.length === 0 ? (
        <p className="text-zinc-500 text-sm">No hackathon tracks yet.</p>
      ) : (
        <div className="space-y-4">
          {cohort.hackathons.map((hackathon) => (
            <Link
              key={hackathon.id}
              href={`/${cohortSlug}/${hackathon.slug}`}
              className="block rounded-lg border border-zinc-100 bg-white p-4 hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                      {hackathon.track}
                    </span>
                  </div>
                  <h2 className="text-base font-medium text-zinc-900 mb-1">{hackathon.title}</h2>
                  <p className="text-sm text-zinc-600 line-clamp-2 mb-2">{hackathon.description}</p>
                  <p className="text-xs text-zinc-400">
                    {format(hackathon.startsAt, 'MMM d, yyyy')} — {format(hackathon.endsAt, 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="shrink-0">
                  <a
                    href={hackathon.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-10 inline-flex items-center gap-1.5 bg-zinc-900 text-white text-xs px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Apply
                  </a>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
