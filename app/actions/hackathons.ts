'use server'
import { verifySession } from '@/app/lib/dal'
import { prisma } from '@/app/lib/db'
import { HackathonSchema } from '@/app/lib/definitions'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function toSlug(title: string): string {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export async function createHackathon(state: unknown, formData: FormData) {
  await verifySession()

  const validated = HackathonSchema.safeParse(Object.fromEntries(formData))
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const data = validated.data
  const slug = toSlug(data.title)

  await prisma.hackathon.create({
    data: {
      ...data,
      slug,
      coverImageUrl: data.coverImageUrl || null,
    },
  })

  revalidatePath('/admin/hackathons')
  redirect('/admin/hackathons')
}

export async function updateHackathon(id: string, state: unknown, formData: FormData) {
  await verifySession()

  const validated = HackathonSchema.safeParse(Object.fromEntries(formData))
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const data = validated.data
  const slug = toSlug(data.title)

  try {
    await prisma.hackathon.update({
      where: { id },
      data: {
        ...data,
        slug,
        coverImageUrl: data.coverImageUrl || null,
      },
    })
  } catch {
    return { message: 'Hackathon not found' }
  }

  revalidatePath('/admin/hackathons')
  redirect('/admin/hackathons')
}

export async function deleteHackathon(id: string) {
  await verifySession()

  try {
    await prisma.hackathon.delete({ where: { id } })
  } catch {
    return { message: 'Hackathon not found' }
  }

  revalidatePath('/admin/hackathons')
}
