'use client'
import { useActionState } from 'react'
import { upsertSubmission } from '@/app/actions/submissions'

interface SubmissionFormProps {
  teamId: string
  cohortSlug: string
  hackathonSlug: string
  existingSubmission?: { githubUrl: string; writeup: string } | null
}

export function SubmissionForm({
  teamId,
  cohortSlug,
  hackathonSlug,
  existingSubmission,
}: SubmissionFormProps) {
  const boundAction = upsertSubmission.bind(null, { teamId, cohortSlug, hackathonSlug })
  const [state, formAction, isPending] = useActionState(boundAction, null)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="githubUrl" className="block text-sm font-medium text-zinc-700 mb-1">
          GitHub Repository
        </label>
        <input
          id="githubUrl"
          name="githubUrl"
          type="text"
          required
          placeholder="https://github.com/your-repo"
          defaultValue={existingSubmission?.githubUrl ?? ''}
          disabled={isPending}
          className="border border-zinc-200 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {state?.errors?.githubUrl && (
          <p className="text-red-600 text-sm mt-1">{state.errors.githubUrl[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="writeup" className="block text-sm font-medium text-zinc-700 mb-1">
          Project Writeup
        </label>
        <textarea
          id="writeup"
          name="writeup"
          required
          placeholder="Describe your project, what you built, and key features..."
          defaultValue={existingSubmission?.writeup ?? ''}
          disabled={isPending}
          className="border border-zinc-200 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed min-h-[120px] resize-y"
        />
        {state?.errors?.writeup && (
          <p className="text-red-600 text-sm mt-1">{state.errors.writeup[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending
          ? existingSubmission
            ? 'Updating...'
            : 'Submitting...'
          : existingSubmission
            ? 'Update Submission'
            : 'Submit Project'}
      </button>
    </form>
  )
}
