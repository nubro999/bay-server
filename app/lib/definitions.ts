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
  maxMembers:    z.coerce.number().int().min(1).max(100).default(5),
})

export type CohortFormState = {
  errors?: { name?: string[] }
  message?: string
}

export type HackathonFormState = {
  errors?: Partial<Record<keyof z.infer<typeof HackathonSchema>, string[]>>
  message?: string
}

export const TeamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100).trim(),
})

export const MemberSchema = z.object({
  name: z.string().min(1, 'Your name is required').max(100).trim(),
  role: z.string().min(1, 'Your role is required').max(100).trim(),
})

export const UpdateSchema = z.object({
  content: z.string().min(1, 'Update content is required').max(2000).trim(),
  link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

export const SubmissionSchema = z.object({
  githubUrl: z.string().url('Must be a valid GitHub URL'),
  writeup: z.string().min(1, 'Writeup is required').max(5000).trim(),
})

export type TeamFormState = {
  errors?: { name?: string[] }
  message?: string
}

export type MemberFormState = {
  errors?: { name?: string[]; role?: string[] }
  error?: string
  message?: string
}

export type UpdateFormState = {
  errors?: { content?: string[]; link?: string[] }
  message?: string
}

export type SubmissionFormState = {
  errors?: { githubUrl?: string[]; writeup?: string[] }
  message?: string
}
