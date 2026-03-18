import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/db', () => ({
  prisma: {
    $transaction: vi.fn(),
    team: { create: vi.fn() },
    update: { create: vi.fn() },
    submission: { upsert: vi.fn().mockResolvedValue({ id: 's1', githubUrl: 'https://github.com/test', teamId: 't1' }) },
  },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

describe('Submission actions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('upsertSubmission calls prisma.submission.upsert with correct data', async () => {
    const { upsertSubmission } = await import('@/app/actions/submissions')
    const { prisma } = await import('@/app/lib/db')
    const context = { teamId: 't1', cohortSlug: '17th-bay', hackathonSlug: 'solana-track' }
    const formData = new FormData()
    formData.set('githubUrl', 'https://github.com/test/repo')
    formData.set('writeup', 'Our project writeup here.')
    await upsertSubmission(context, undefined, formData)
    expect(prisma.submission.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { teamId: 't1' },
        create: expect.objectContaining({ teamId: 't1', githubUrl: 'https://github.com/test/repo' }),
        update: expect.objectContaining({ githubUrl: 'https://github.com/test/repo' }),
      })
    )
  })

  it('upsertSubmission returns validation errors for invalid githubUrl', async () => {
    const { upsertSubmission } = await import('@/app/actions/submissions')
    const context = { teamId: 't1', cohortSlug: '17th-bay', hackathonSlug: 'solana-track' }
    const formData = new FormData()
    formData.set('githubUrl', 'not-a-url')
    formData.set('writeup', 'Our writeup.')
    const result = await upsertSubmission(context, undefined, formData)
    expect(result).toMatchObject({ errors: { githubUrl: expect.any(Array) } })
  })

  it('upsertSubmission returns validation errors for empty writeup', async () => {
    const { upsertSubmission } = await import('@/app/actions/submissions')
    const context = { teamId: 't1', cohortSlug: '17th-bay', hackathonSlug: 'solana-track' }
    const formData = new FormData()
    formData.set('githubUrl', 'https://github.com/test/repo')
    formData.set('writeup', '')
    const result = await upsertSubmission(context, undefined, formData)
    expect(result).toMatchObject({ errors: { writeup: expect.any(Array) } })
  })
})
