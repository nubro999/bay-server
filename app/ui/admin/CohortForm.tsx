'use client'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type CohortFormProps = {
  action: (state: unknown, formData: FormData) => Promise<unknown>
  defaultName?: string
  submitLabel?: string
}

export function CohortForm({ action, defaultName = '', submitLabel = 'Save' }: CohortFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="space-y-4 max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="name">Cohort Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultName}
          placeholder="e.g. 17th BAY"
          required
        />
        {(state as any)?.errors?.name && (
          <p className="text-sm text-red-600">{(state as any).errors.name[0]}</p>
        )}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
