'use server'
import 'server-only'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/app/lib/db'
import { SubmissionSchema } from '@/app/lib/definitions'
import type { SubmissionFormState } from '@/app/lib/definitions'

export async function upsertSubmission(
  context: { teamId: string; cohortSlug: string; hackathonSlug: string },
  state: unknown,
  formData: FormData,
): Promise<SubmissionFormState> {
  const raw = {
    githubUrl: formData.get('githubUrl'),
    writeup: formData.get('writeup'),
  }

  const parsed = SubmissionSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { githubUrl, writeup } = parsed.data

  await prisma.submission.upsert({
    where: { teamId: context.teamId },
    create: {
      teamId: context.teamId,
      githubUrl,
      writeup,
    },
    update: {
      githubUrl,
      writeup,
    },
  })

  revalidatePath(`/${context.cohortSlug}/${context.hackathonSlug}`)
  return { message: 'Submission saved.' }
}
