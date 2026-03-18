'use server'
import { verifySession } from '@/app/lib/dal'
import { prisma } from '@/app/lib/db'
import { TeamSchema } from '@/app/lib/definitions'
import type { TeamFormState } from '@/app/lib/definitions'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateTeam(id: string, state: unknown, formData: FormData): Promise<TeamFormState> {
  await verifySession()

  const validated = TeamSchema.safeParse({ name: formData.get('name') })
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  try {
    await prisma.team.update({
      where: { id },
      data: { name: validated.data.name },
    })
  } catch {
    return { message: 'Team not found' }
  }

  revalidatePath('/admin/teams')
  redirect('/admin/teams')
}

export async function deleteTeam(id: string): Promise<{ message: string } | undefined> {
  await verifySession()

  try {
    await prisma.team.delete({ where: { id } })
  } catch {
    return { message: 'Team not found' }
  }

  revalidatePath('/admin/teams')
}

export async function removeMember(memberId: string, teamId: string): Promise<{ message: string } | undefined> {
  await verifySession()

  try {
    await prisma.member.delete({ where: { id: memberId } })
  } catch {
    return { message: 'Member not found' }
  }

  revalidatePath('/admin/teams')
}
