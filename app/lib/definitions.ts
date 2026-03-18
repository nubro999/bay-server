import 'server-only'
import { z } from 'zod'

export const CohortSchema = z.object({
  name: z.string().min(1).max(100).trim(),
})

export const HackathonSchema = z.object({
  cohortId:      z.string().cuid(),
  title:         z.string().min(1).max(200).trim(),
  description:   z.string().min(1).max(2000).trim(),
  startsAt:      z.coerce.date(),
  endsAt:        z.coerce.date(),
  externalUrl:   z.string().url(),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  track:         z.string().min(1).max(100).trim(),
})

export type CohortFormState = {
  errors?: { name?: string[] }
  message?: string
}

export type HackathonFormState = {
  errors?: Partial<Record<keyof z.infer<typeof HackathonSchema>, string[]>>
  message?: string
}
