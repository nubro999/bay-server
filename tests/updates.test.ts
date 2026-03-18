import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/db', () => ({
  prisma: {
    $transaction: vi.fn(),
    team: { create: vi.fn() },
    update: { create: vi.fn().mockResolvedValue({ id: 'u1', content: 'Week 1 progress', teamId: 't1' }) },
    submission: { upsert: vi.fn() },
  },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

describe('Update actions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('createUpdate inserts update with teamId and content', async () => {
    const { createUpdate } = await import('@/app/actions/updates')
    const { prisma } = await import('@/app/lib/db')
    const context = { teamId: 't1', cohortSlug: '17th-bay', hackathonSlug: 'solana-track' }
    const formData = new FormData()
    formData.set('content', 'Week 1 progress')
    await createUpdate(context, undefined, formData)
    expect(prisma.update.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ content: 'Week 1 progress', teamId: 't1' }) })
    )
  })

  it('createUpdate returns validation errors for empty content', async () => {
    const { createUpdate } = await import('@/app/actions/updates')
    const context = { teamId: 't1', cohortSlug: '17th-bay', hackathonSlug: 'solana-track' }
    const formData = new FormData()
    formData.set('content', '')
    const result = await createUpdate(context, undefined, formData)
    expect(result).toMatchObject({ errors: { content: expect.any(Array) } })
  })

  it('createUpdate accepts optional valid link', async () => {
    const { createUpdate } = await import('@/app/actions/updates')
    const { prisma } = await import('@/app/lib/db')
    const context = { teamId: 't1', cohortSlug: '17th-bay', hackathonSlug: 'solana-track' }
    const formData = new FormData()
    formData.set('content', 'Progress update')
    formData.set('link', 'https://github.com/test')
    await createUpdate(context, undefined, formData)
    expect(prisma.update.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ link: 'https://github.com/test' }) })
    )
  })

  it('createUpdate accepts empty link field (converts to undefined)', async () => {
    const { createUpdate } = await import('@/app/actions/updates')
    const { prisma } = await import('@/app/lib/db')
    const context = { teamId: 't1', cohortSlug: '17th-bay', hackathonSlug: 'solana-track' }
    const formData = new FormData()
    formData.set('content', 'Progress update')
    formData.set('link', '')
    await createUpdate(context, undefined, formData)
    expect(prisma.update.create).toHaveBeenCalled()
  })
})
