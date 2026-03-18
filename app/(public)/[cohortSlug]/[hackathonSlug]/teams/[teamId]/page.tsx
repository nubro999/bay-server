import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { prisma } from '@/app/lib/db'
import { JoinTeamForm } from '@/app/ui/public/JoinTeamForm'
import { UpdateForm } from '@/app/ui/public/UpdateForm'
import { SubmissionForm } from '@/app/ui/public/SubmissionForm'

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ cohortSlug: string; hackathonSlug: string; teamId: string }>
}) {
  const { cohortSlug, hackathonSlug, teamId } = await params

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: { orderBy: { joinedAt: 'asc' } },
      updates: { orderBy: { createdAt: 'asc' } },
      submission: true,
      hackathon: { include: { cohort: true } },
    },
  })

  if (!team) {
    notFound()
  }

  // Verify cohort scope (CHRT-02)
  if (team.hackathon.slug !== hackathonSlug || team.hackathon.cohort.slug !== cohortSlug) {
    notFound()
  }

  const isFull = team.members.length >= 5
  const openSpots = 5 - team.members.length
  const isArchived = !team.hackathon.cohort.isActive

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-6 text-sm text-zinc-500">
        <Link href={`/${cohortSlug}`} className="hover:text-zinc-700 transition-colors">
          {team.hackathon.cohort.name}
        </Link>
        <span className="text-zinc-300">/</span>
        <Link
          href={`/${cohortSlug}/${hackathonSlug}`}
          className="hover:text-zinc-700 transition-colors"
        >
          {team.hackathon.title}
        </Link>
        <span className="text-zinc-300">/</span>
        <span className="text-zinc-700">{team.name}</span>
      </nav>

      {/* Archive notice */}
      {isArchived && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-6">
          <p className="text-sm text-amber-800">
            This cohort has been archived. You are viewing a read-only record.
          </p>
        </div>
      )}

      {/* Team header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">{team.name}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-zinc-500">
            {team.members.length}/5 members
          </span>
          {isFull ? (
            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
              Full
            </span>
          ) : (
            <span className="text-xs font-medium text-zinc-500 bg-zinc-50 px-2 py-0.5 rounded">
              {openSpots} spot{openSpots !== 1 ? 's' : ''} open
            </span>
          )}
          {team.submission ? (
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
              Submitted
            </span>
          ) : (
            <span className="text-xs font-medium text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded">
              Not submitted
            </span>
          )}
        </div>
      </div>

      {/* Members list */}
      <div className="border-t border-zinc-100 pt-6 mt-6">
        <h2 className="text-base font-medium text-zinc-900 mb-4">Members</h2>
        {team.members.length === 0 ? (
          <p className="text-sm text-zinc-500">No members yet.</p>
        ) : (
          <div className="space-y-2">
            {team.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">{member.name}</p>
                  <p className="text-xs text-zinc-500">{member.role}</p>
                </div>
                <p className="text-xs text-zinc-400">
                  {format(member.joinedAt, 'MMM d, yyyy')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Join form — hidden for archived cohorts */}
      {!isArchived && (
        <div className="border-t border-zinc-100 pt-6 mt-6">
          <h2 className="text-base font-medium text-zinc-900 mb-4">Join this Team</h2>
          <div className="max-w-sm">
            <JoinTeamForm
              teamId={teamId}
              cohortSlug={cohortSlug}
              hackathonSlug={hackathonSlug}
              isFull={isFull}
            />
          </div>
        </div>
      )}

      {/* Weekly updates */}
      <div className="border-t border-zinc-100 pt-6 mt-6">
        <h2 className="text-base font-medium text-zinc-900 mb-4">Updates</h2>
        {team.updates.length === 0 ? (
          <p className="text-sm text-zinc-500">No updates yet.</p>
        ) : (
          <div className="space-y-4">
            {team.updates.map((update) => (
              <div
                key={update.id}
                className="rounded-lg border border-zinc-100 bg-zinc-50 p-4"
              >
                <p className="text-sm text-zinc-800 whitespace-pre-wrap mb-2">{update.content}</p>
                {update.link && (
                  <a
                    href={update.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-zinc-500 hover:text-zinc-700 underline break-all transition-colors"
                  >
                    {update.link}
                  </a>
                )}
                <p className="text-xs text-zinc-400 mt-2">
                  {format(update.createdAt, 'MMM d, yyyy')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post an update — hidden for archived cohorts */}
      {!isArchived && (
        <div className="border-t border-zinc-100 pt-6 mt-6">
          <h2 className="text-base font-medium text-zinc-900 mb-4">Post an Update</h2>
          <div className="max-w-sm">
            <UpdateForm
              teamId={teamId}
              cohortSlug={cohortSlug}
              hackathonSlug={hackathonSlug}
            />
          </div>
        </div>
      )}

      {/* Submission */}
      <div className="border-t border-zinc-100 pt-6 mt-6">
        <h2 className="text-base font-medium text-zinc-900 mb-4">Submission</h2>
        {team.submission ? (
          <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4 space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-1">
                GitHub Repository
              </p>
              <a
                href={team.submission.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-800 hover:text-zinc-600 underline break-all transition-colors"
              >
                {team.submission.githubUrl}
              </a>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-1">
                Writeup
              </p>
              <p className="text-sm text-zinc-800 whitespace-pre-wrap">{team.submission.writeup}</p>
            </div>
            <p className="text-xs text-zinc-400">
              Submitted {format(team.submission.submittedAt, 'MMM d, yyyy')}
            </p>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No submission yet.</p>
        )}

        {/* Submission form — hidden for archived cohorts */}
        {!isArchived && (
          <div className="border-t border-zinc-100 pt-6 mt-6">
            <h3 className="text-sm font-medium text-zinc-900 mb-4">
              {team.submission ? 'Update Submission' : 'Submit Project'}
            </h3>
            <div className="max-w-sm">
              <SubmissionForm
                teamId={teamId}
                cohortSlug={cohortSlug}
                hackathonSlug={hackathonSlug}
                existingSubmission={team.submission}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
