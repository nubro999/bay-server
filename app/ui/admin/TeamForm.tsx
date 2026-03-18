'use client'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { TeamFormState } from '@/app/lib/definitions'

type TeamFormProps = {
  action: (state: TeamFormState, formData: FormData) => Promise<TeamFormState>
  team?: { name: string }
}

export function TeamForm({ action, team }: TeamFormProps) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">Team Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={team?.name ?? ''}
          required
          placeholder="e.g. Team Solana"
        />
        {state.errors?.name && state.errors.name.map((err, i) => (
          <p key={i} className="text-sm text-red-500">{err}</p>
        ))}
        {state.message && (
          <p className="text-sm text-red-500">{state.message}</p>
        )}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Saving...' : (team ? 'Update Team' : 'Create Team')}
      </Button>
    </form>
  )
}
