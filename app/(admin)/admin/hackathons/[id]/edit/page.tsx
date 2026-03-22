import { verifySession } from '@/app/lib/dal'
import { prisma } from '@/app/lib/db'
import { updateHackathon } from '@/app/actions/hackathons'
import { HackathonForm } from '@/app/ui/admin/HackathonForm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function EditHackathonPage({ params }: { params: Promise<{ id: string }> }) {
  await verifySession()
  const { id } = await params  // Next.js 16: params is a Promise

  const [hackathon, cohorts] = await Promise.all([
    prisma.hackathon.findUnique({ where: { id } }),
    prisma.cohort.findMany({
      orderBy: { orderIndex: 'asc' },
      select: { id: true, name: true },
    }),
  ])

  if (!hackathon) notFound()

  const updateWithId = updateHackathon.bind(null, hackathon.id)

  return (
    <div className="p-8 space-y-6">
      <div>
        <Link href="/admin/hackathons" className="text-sm text-zinc-500 hover:text-zinc-900">
          &larr; Back to Hackathons
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Edit Hackathon</h1>
      </div>
      <HackathonForm
        action={updateWithId}
        cohorts={cohorts}
        defaultValues={{
          cohortId: hackathon.cohortId,
          title: hackathon.title,
          description: hackathon.description,
          startsAt: format(hackathon.startsAt, 'yyyy-MM-dd'),
          endsAt: format(hackathon.endsAt, 'yyyy-MM-dd'),
          externalUrl: hackathon.externalUrl,
          coverImageUrl: hackathon.coverImageUrl ?? '',
          track: hackathon.track,
          maxMembers: hackathon.maxMembers,
        }}
        submitLabel="Save Changes"
      />
    </div>
  )
}
