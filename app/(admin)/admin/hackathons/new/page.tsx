import { verifySession } from '@/app/lib/dal'
import { prisma } from '@/app/lib/db'
import { createHackathon } from '@/app/actions/hackathons'
import { HackathonForm } from '@/app/ui/admin/HackathonForm'
import Link from 'next/link'

export default async function NewHackathonPage() {
  await verifySession()

  const cohorts = await prisma.cohort.findMany({
    orderBy: { orderIndex: 'asc' },
    select: { id: true, name: true },
  })

  return (
    <div className="p-8 space-y-6">
      <div>
        <Link href="/admin/hackathons" className="text-sm text-zinc-500 hover:text-zinc-900">
          &larr; Back to Hackathons
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">New Hackathon</h1>
      </div>
      <HackathonForm action={createHackathon} cohorts={cohorts} submitLabel="Create Hackathon" />
    </div>
  )
}
