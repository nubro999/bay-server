import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { prisma } from '@/app/lib/db'
import { Countdown } from '@/app/ui/public/Countdown'
import { TeamCard } from '@/app/ui/public/TeamCard'

export default async function HackathonPage({
  params,
}: {
  params: Promise<{ cohortSlug: string; hackathonSlug: string }>
}) {
  const { cohortSlug, hackathonSlug } = await params

  // Always scope hackathon lookup by cohort (CHRT-02 architectural pattern)
  const cohort = await prisma.cohort.findUnique({
    where: { slug: cohortSlug },
  })

  if (!cohort) {
    notFound()
  }

  const hackathon = await prisma.hackathon.findFirst({
    where: {
      slug: hackathonSlug,
      cohortId: cohort.id,
    },
    include: {
      teams: {
        include: {
          _count: { select: { members: true } },
          submission: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!hackathon) {
    notFound()
  }

  return (
    <div>
      {/* Cover Image */}
      {hackathon.coverImageUrl && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <img
            src={hackathon.coverImageUrl}
            alt={hackathon.title}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href={`/${cohortSlug}`}
            className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            {cohort.name}
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
            {hackathon.track}
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">{hackathon.title}</h1>
        <p className="text-sm text-zinc-600 mb-3 whitespace-pre-line">{hackathon.description}</p>
        <p className="text-xs text-zinc-400 mb-4">
          {format(hackathon.startsAt, 'MMM d, yyyy')} — {format(hackathon.endsAt, 'MMM d, yyyy')}
        </p>

        {/* External platform link — prominent CTA */}
        <a
          href={hackathon.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-md hover:bg-zinc-800 text-sm font-medium transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Apply on Platform
        </a>
      </div>

      {/* Countdown */}
      <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4 mb-8">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-1">
          Deadline countdown
        </p>
        <Countdown endsAt={hackathon.endsAt} />
      </div>

      {/* Archive notice */}
      {!cohort.isActive && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-6">
          <p className="text-sm text-amber-800">
            This cohort has been archived. You are viewing a read-only record.
          </p>
        </div>
      )}

      {/* Team browser */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-zinc-900">
            Teams{' '}
            <span className="text-sm font-normal text-zinc-500">
              ({hackathon.teams.length})
            </span>
          </h2>
          {cohort.isActive && (
            <Link
              href={`/${cohortSlug}/${hackathonSlug}/teams/new`}
              className="text-sm text-zinc-600 border border-zinc-200 px-3 py-1.5 rounded-md hover:border-zinc-300 hover:text-zinc-900 transition-colors"
            >
              Create a Team
            </Link>
          )}
        </div>

        {hackathon.teams.length === 0 ? (
          <div className="text-center py-12 border border-zinc-100 rounded-lg">
            <p className="text-sm text-zinc-500 mb-3">
              No teams yet. Be the first to create one!
            </p>
            {cohort.isActive && (
              <Link
                href={`/${cohortSlug}/${hackathonSlug}/teams/new`}
                className="inline-flex items-center text-sm text-zinc-600 border border-zinc-200 px-4 py-2 rounded-md hover:border-zinc-300 hover:text-zinc-900 transition-colors"
              >
                Create a Team
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {hackathon.teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                cohortSlug={cohortSlug}
                hackathonSlug={hackathonSlug}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
