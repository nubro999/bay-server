import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/dal', () => ({
  verifySession: vi.fn().mockResolvedValue({ isAdmin: true }),
}))

vi.mock('@/app/lib/db', () => ({
  prisma: {
    cohort: {
      create: vi.fn().mockResolvedValue({ id: 'c1', name: '17th BAY', slug: '17th-bay', orderIndex: 0 }),
      aggregate: vi.fn().mockResolvedValue({ _max: { orderIndex: -1 } }),
      update: vi.fn().mockResolvedValue({ id: 'c1', name: 'Updated', slug: 'updated' }),
    },
  },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

describe('Cohort actions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('createCohort inserts cohort with correct slug from name', async () => {
    const { createCohort } = await import('@/app/actions/cohorts')
    const { prisma } = await import('@/app/lib/db')
    const formData = new FormData()
    formData.set('name', '17th BAY')
    try { await createCohort(undefined, formData) } catch { /* redirect */ }
    expect(prisma.cohort.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ slug: '17th-bay' }) })
    )
  })

  it('createCohort sets orderIndex = max + 1 (0 when empty)', async () => {
    const { createCohort } = await import('@/app/actions/cohorts')
    const { prisma } = await import('@/app/lib/db')
    const formData = new FormData()
    formData.set('name', 'Test Cohort')
    try { await createCohort(undefined, formData) } catch { /* redirect */ }
    expect(prisma.cohort.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ orderIndex: 0 }) })
    )
  })

  it('createCohort rejects empty name', async () => {
    const { createCohort } = await import('@/app/actions/cohorts')
    const formData = new FormData()
    formData.set('name', '')
    const result = await createCohort(undefined, formData)
    expect(result).toMatchObject({ errors: { name: expect.any(Array) } })
  })

  it('createCohort calls verifySession', async () => {
    const { verifySession } = await import('@/app/lib/dal')
    const { createCohort } = await import('@/app/actions/cohorts')
    const formData = new FormData()
    formData.set('name', 'Test')
    try { await createCohort(undefined, formData) } catch { /* redirect */ }
    expect(verifySession).toHaveBeenCalled()
  })
})
