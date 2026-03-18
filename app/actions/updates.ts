'use server'
import 'server-only'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/app/lib/db'
import { UpdateSchema } from '@/app/lib/definitions'
import type { UpdateFormState } from '@/app/lib/definitions'

export async function createUpdate(
  context: { teamId: string; cohortSlug: string; hackathonSlug: string },
  state: unknown,
  formData: FormData,
): Promise<UpdateFormState> {
  const raw = {
    content: formData.get('content'),
    link: formData.get('link') || undefined,
  }

  const parsed = UpdateSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { content, link } = parsed.data
  const linkValue = link === '' ? undefined : link

  await prisma.update.create({
    data: {
      teamId: context.teamId,
      content,
      link: linkValue,
    },
  })

  revalidatePath(`/${context.cohortSlug}/${context.hackathonSlug}`)
  return { message: 'Update posted.' }
}
