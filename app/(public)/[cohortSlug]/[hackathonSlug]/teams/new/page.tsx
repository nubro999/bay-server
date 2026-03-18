import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/app/lib/db'
import { CreateTeamForm } from '@/app/ui/public/CreateTeamForm'

export default async function CreateTeamPage({
  params,
}: {
  params: Promise<{ cohortSlug: string; hackathonSlug: string }>
}) {
  const { cohortSlug, hackathonSlug } = await params

  const cohort = await prisma.cohort.findUnique({
    where: { slug: cohortSlug },
  })

  if (!cohort) {
    notFound()
  }

  if (!cohort.isActive) {
    notFound()
  }

  const hackathon = await prisma.hackathon.findFirst({
    where: {
      slug: hackathonSlug,
      cohortId: cohort.id,
    },
  })

  if (!hackathon) {
    notFound()
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            href={`/${cohortSlug}/${hackathonSlug}`}
            className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            &larr; Back to {hackathon.title}
          </Link>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-zinc-900 mb-1">Create a Team</h1>
          <p className="text-sm text-zinc-500 mb-6">
            Enter a team name to get started. You&apos;ll be taken to your team page after creation.
          </p>

          <CreateTeamForm
            hackathonId={hackathon.id}
            cohortSlug={cohortSlug}
            hackathonSlug={hackathonSlug}
          />
        </div>
      </div>
    </div>
  )
}
