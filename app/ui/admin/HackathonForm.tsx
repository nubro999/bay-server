'use client'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type HackathonFormProps = {
  action: (state: unknown, formData: FormData) => Promise<unknown>
  cohorts: { id: string; name: string }[]
  defaultValues?: {
    cohortId?: string
    title?: string
    description?: string
    startsAt?: string   // ISO date string YYYY-MM-DD for input[type=date]
    endsAt?: string
    externalUrl?: string
    coverImageUrl?: string
    track?: string
  }
  submitLabel?: string
}

export function HackathonForm({
  action,
  cohorts,
  defaultValues = {},
  submitLabel = 'Save',
}: HackathonFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined)
  const errors = (state as any)?.errors ?? {}

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      {/* Cohort selector */}
      <div className="space-y-2">
        <Label htmlFor="cohortId">Cohort</Label>
        <select
          id="cohortId"
          name="cohortId"
          defaultValue={defaultValues.cohortId ?? ''}
          required
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="" disabled>Select a cohort</option>
          {cohorts.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {errors.cohortId && <p className="text-sm text-red-600">{errors.cohortId[0]}</p>}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={defaultValues.title} required placeholder="e.g. Solana Track" />
        {errors.title && <p className="text-sm text-red-600">{errors.title[0]}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={defaultValues.description} rows={4} placeholder="A few sentences about this hackathon track..." />
        {errors.description && <p className="text-sm text-red-600">{errors.description[0]}</p>}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startsAt">Start Date</Label>
          <Input id="startsAt" name="startsAt" type="date" defaultValue={defaultValues.startsAt} required />
          {errors.startsAt && <p className="text-sm text-red-600">{errors.startsAt[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endsAt">End Date</Label>
          <Input id="endsAt" name="endsAt" type="date" defaultValue={defaultValues.endsAt} required />
          {errors.endsAt && <p className="text-sm text-red-600">{errors.endsAt[0]}</p>}
        </div>
      </div>

      {/* External URL */}
      <div className="space-y-2">
        <Label htmlFor="externalUrl">External Platform URL</Label>
        <Input id="externalUrl" name="externalUrl" type="url" defaultValue={defaultValues.externalUrl} required placeholder="https://colosseum.com/" />
        {errors.externalUrl && <p className="text-sm text-red-600">{errors.externalUrl[0]}</p>}
      </div>

      {/* Cover Image URL (optional) */}
      <div className="space-y-2">
        <Label htmlFor="coverImageUrl">Cover Image URL <span className="text-zinc-400">(optional)</span></Label>
        <Input id="coverImageUrl" name="coverImageUrl" type="url" defaultValue={defaultValues.coverImageUrl ?? ''} placeholder="https://..." />
        {errors.coverImageUrl && <p className="text-sm text-red-600">{errors.coverImageUrl[0]}</p>}
      </div>

      {/* Track */}
      <div className="space-y-2">
        <Label htmlFor="track">Track</Label>
        <Input id="track" name="track" defaultValue={defaultValues.track} required placeholder="e.g. EVM, Solana, Grants" />
        {errors.track && <p className="text-sm text-red-600">{errors.track[0]}</p>}
      </div>

      {(state as any)?.message && (
        <p className="text-sm text-red-600">{(state as any).message}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? 'Saving...' : submitLabel}
      </Button>
    </form>
  )
}
