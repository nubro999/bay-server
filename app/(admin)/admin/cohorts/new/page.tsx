import { verifySession } from '@/app/lib/dal'
import { createCohort } from '@/app/actions/cohorts'
import { CohortForm } from '@/app/ui/admin/CohortForm'
import Link from 'next/link'

export default async function NewCohortPage() {
  await verifySession()

  return (
    <div className="p-8 space-y-6">
      <div>
        <Link href="/admin/cohorts" className="text-sm text-zinc-500 hover:text-zinc-900">
          ← Back to Cohorts
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">New Cohort</h1>
      </div>
      <CohortForm action={createCohort} submitLabel="Create Cohort" />
    </div>
  )
}
