'use server'
import 'server-only'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/app/lib/db'
import { MemberSchema } from '@/app/lib/definitions'
import type { MemberFormState } from '@/app/lib/definitions'

export async function joinTeam(
  context: { teamId: string; cohortSlug: string; hackathonSlug: string },
  state: unknown,
  formData: FormData,
): Promise<MemberFormState> {
  const raw = {
    name: formData.get('name'),
    role: formData.get('role'),
  }

  const parsed = MemberSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { name, role } = parsed.data

  try {
    await prisma.$transaction(async (tx) => {
      const team = await tx.team.findUniqueOrThrow({
        where: { id: context.teamId },
        select: { hackathon: { select: { maxMembers: true } } },
      })
      const maxMembers = team.hackathon.maxMembers
      const count = await tx.member.count({ where: { teamId: context.teamId } })
      if (count >= maxMembers) {
        throw new Error('TEAM_FULL')
      }
      await tx.member.create({
        data: {
          teamId: context.teamId,
          name,
          role,
        },
      })
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'TEAM_FULL') {
      return { error: 'This team is full.' }
    }
    return { error: 'Could not join team. Please try again.' }
  }

  revalidatePath(`/${context.cohortSlug}/${context.hackathonSlug}`)
  return { message: 'Successfully joined team.' }
}
