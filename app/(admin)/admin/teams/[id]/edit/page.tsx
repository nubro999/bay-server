import { verifySession } from '@/app/lib/dal'
import { prisma } from '@/app/lib/db'
import { updateTeam } from '@/app/actions/admin-teams'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TeamForm } from '@/app/ui/admin/TeamForm'

export default async function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
  await verifySession()
  const { id } = await params

  const team = await prisma.team.findUnique({ where: { id } })
  if (!team) notFound()

  const action = updateTeam.bind(null, team.id)

  return (
    <div className="p-8 space-y-6">
      <div>
        <Link href="/admin/teams" className="text-sm text-zinc-500 hover:text-zinc-900">
          &larr; Back to Teams
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Edit Team</h1>
      </div>
      <TeamForm action={action} team={team} />
    </div>
  )
}
