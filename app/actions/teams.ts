'use server'
import 'server-only'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/app/lib/db'
import { TeamSchema } from '@/app/lib/definitions'
import type { TeamFormState } from '@/app/lib/definitions'

export async function createTeam(
  context: { hackathonId: string; cohortSlug: string; hackathonSlug: string },
  state: unknown,
  formData: FormData,
): Promise<TeamFormState> {
  const raw = {
    name: formData.get('name'),
  }

  const parsed = TeamSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const team = await prisma.team.create({
    data: {
      hackathonId: context.hackathonId,
      name: parsed.data.name,
    },
  })

  revalidatePath(`/${context.cohortSlug}/${context.hackathonSlug}`)
  redirect(`/${context.cohortSlug}/${context.hackathonSlug}/teams/${team.id}`)
}
