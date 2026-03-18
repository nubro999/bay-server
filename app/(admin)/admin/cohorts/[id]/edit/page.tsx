import { verifySession } from '@/app/lib/dal'
import { updateCohort } from '@/app/actions/cohorts'
import { prisma } from '@/app/lib/db'
import { CohortForm } from '@/app/ui/admin/CohortForm'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function EditCohortPage({ params }: { params: Promise<{ id: string }> }) {
  await verifySession()
  const { id } = await params  // Next.js 16: params is a Promise

  const cohort = await prisma.cohort.findUnique({ where: { id } })
  if (!cohort) notFound()

  const updateWithId = updateCohort.bind(null, cohort.id)

  return (
    <div className="p-8 space-y-6">
      <div>
        <Link href="/admin/cohorts" className="text-sm text-zinc-500 hover:text-zinc-900">
          ← Back to Cohorts
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Edit Cohort</h1>
      </div>
      <CohortForm action={updateWithId} defaultName={cohort.name} submitLabel="Save Changes" />
    </div>
  )
}
