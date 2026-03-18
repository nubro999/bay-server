'use server'
import { verifySession } from '@/app/lib/dal'
import { prisma } from '@/app/lib/db'
import { CohortSchema } from '@/app/lib/definitions'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export async function createCohort(state: unknown, formData: FormData) {
  await verifySession()

  const validated = CohortSchema.safeParse({ name: formData.get('name') })
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { name } = validated.data
  const slug = toSlug(name)

  const maxOrder = await prisma.cohort.aggregate({ _max: { orderIndex: true } })
  const orderIndex = (maxOrder._max.orderIndex ?? -1) + 1

  await prisma.cohort.create({
    data: { name, slug, orderIndex },
  })

  revalidatePath('/admin/cohorts')
  redirect('/admin/cohorts')
}

export async function toggleCohortArchive(id: string) {
  await verifySession()

  const cohort = await prisma.cohort.findUnique({ where: { id } })
  if (!cohort) {
    return { error: 'Cohort not found' }
  }

  await prisma.cohort.update({
    where: { id },
    data: { isActive: !cohort.isActive },
  })

  revalidatePath('/admin/cohorts')
  revalidatePath('/')
}

export async function updateCohort(id: string, state: unknown, formData: FormData) {
  await verifySession()

  const validated = CohortSchema.safeParse({ name: formData.get('name') })
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { name } = validated.data
  const slug = toSlug(name)

  try {
    await prisma.cohort.update({
      where: { id },
      data: { name, slug },
    })
  } catch {
    return { message: 'Cohort not found' }
  }

  revalidatePath('/admin/cohorts')
  redirect('/admin/cohorts')
}
