'use client'
import { useActionState } from 'react'
import { joinTeam } from '@/app/actions/members'

interface JoinTeamFormProps {
  teamId: string
  cohortSlug: string
  hackathonSlug: string
  isFull: boolean
}

export function JoinTeamForm({ teamId, cohortSlug, hackathonSlug, isFull }: JoinTeamFormProps) {
  const boundAction = joinTeam.bind(null, { teamId, cohortSlug, hackathonSlug })
  const [state, formAction, isPending] = useActionState(boundAction, null)

  if (isFull) {
    return (
      <p className="text-sm text-zinc-500 italic">This team is full (maximum 5 members).</p>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="text-red-600 text-sm">{state.error}</p>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">
          Your Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g. Jane Smith"
          disabled={isPending}
          className="border border-zinc-200 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {state?.errors?.name && (
          <p className="text-red-600 text-sm mt-1">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-zinc-700 mb-1">
          Your Role
        </label>
        <input
          id="role"
          name="role"
          type="text"
          required
          placeholder="e.g. Frontend Developer"
          disabled={isPending}
          className="border border-zinc-200 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {state?.errors?.role && (
          <p className="text-red-600 text-sm mt-1">{state.errors.role[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Joining...' : 'Join Team'}
      </button>
    </form>
  )
}
