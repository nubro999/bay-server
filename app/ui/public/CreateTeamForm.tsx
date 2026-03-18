'use client'
import { useActionState } from 'react'
import { createTeam } from '@/app/actions/teams'

interface CreateTeamFormProps {
  hackathonId: string
  cohortSlug: string
  hackathonSlug: string
}

export function CreateTeamForm({ hackathonId, cohortSlug, hackathonSlug }: CreateTeamFormProps) {
  const boundAction = createTeam.bind(null, { hackathonId, cohortSlug, hackathonSlug })
  const [state, formAction, isPending] = useActionState(boundAction, null)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">
          Team Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g. Team Nebula"
          className="border border-zinc-200 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        {state?.errors?.name && (
          <p className="text-red-600 text-sm mt-1">{state.errors.name[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Creating...' : 'Create Team'}
      </button>
    </form>
  )
}
