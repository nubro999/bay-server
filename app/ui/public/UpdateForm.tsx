'use client'
import { useActionState } from 'react'
import { createUpdate } from '@/app/actions/updates'

interface UpdateFormProps {
  teamId: string
  cohortSlug: string
  hackathonSlug: string
}

export function UpdateForm({ teamId, cohortSlug, hackathonSlug }: UpdateFormProps) {
  const boundAction = createUpdate.bind(null, { teamId, cohortSlug, hackathonSlug })
  const [state, formAction, isPending] = useActionState(boundAction, null)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-zinc-700 mb-1">
          What did your team accomplish this week?
        </label>
        <textarea
          id="content"
          name="content"
          required
          placeholder="What did your team accomplish this week?"
          disabled={isPending}
          className="border border-zinc-200 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed min-h-[100px] resize-y"
        />
        {state?.errors?.content && (
          <p className="text-red-600 text-sm mt-1">{state.errors.content[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="link" className="block text-sm font-medium text-zinc-700 mb-1">
          Link{' '}
          <span className="text-zinc-400 font-normal">(optional)</span>
        </label>
        <input
          id="link"
          name="link"
          type="text"
          placeholder="https://... (optional link)"
          disabled={isPending}
          className="border border-zinc-200 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {state?.errors?.link && (
          <p className="text-red-600 text-sm mt-1">{state.errors.link[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Posting...' : 'Post Update'}
      </button>
    </form>
  )
}
