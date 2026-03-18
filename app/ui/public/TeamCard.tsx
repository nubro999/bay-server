import Link from 'next/link'

interface TeamCardProps {
  team: {
    id: string
    name: string
    _count: { members: number }
    submission: { id: string } | null
  }
  cohortSlug: string
  hackathonSlug: string
}

const MAX_MEMBERS = 5

export function TeamCard({ team, cohortSlug, hackathonSlug }: TeamCardProps) {
  const memberCount = team._count.members
  const isFull = memberCount >= MAX_MEMBERS
  const openSpots = MAX_MEMBERS - memberCount

  return (
    <Link
      href={`/${cohortSlug}/${hackathonSlug}/teams/${team.id}`}
      className="block rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-300 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-zinc-900">{team.name}</h3>
        <div className="flex items-center gap-1.5 shrink-0">
          {team.submission !== null && (
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
              Submitted
            </span>
          )}
          {isFull ? (
            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
              Full
            </span>
          ) : (
            <span className="text-xs font-medium text-zinc-500 bg-zinc-50 px-2 py-0.5 rounded">
              {openSpots} spot{openSpots !== 1 ? 's' : ''} open
            </span>
          )}
        </div>
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        {memberCount}/{MAX_MEMBERS} members
      </p>
    </Link>
  )
}
