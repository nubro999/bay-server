import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/db', () => ({
  prisma: {
    $transaction: vi.fn().mockImplementation(async (fn) => fn({
      member: {
        count: vi.fn().mockResolvedValue(2),
        create: vi.fn().mockResolvedValue({ id: 'm1', name: 'Alice', role: 'Frontend', teamId: 't1' }),
      },
    })),
    team: { create: vi.fn().mockResolvedValue({ id: 't1', name: 'Test Team', hackathonId: 'h1' }) },
    update: { create: vi.fn().mockResolvedValue({ id: 'u1', content: 'Week 1 progress', teamId: 't1' }) },
    submission: { upsert: vi.fn().mockResolvedValue({ id: 's1', githubUrl: 'https://github.com/test', teamId: 't1' }) },
  },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

describe('Team actions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('createTeam inserts team with hackathonId and name', async () => {
    const { createTeam } = await import('@/app/actions/teams')
    const { prisma } = await import('@/app/lib/db')
    const context = { hackathonId: 'h1', cohortSlug: '17th-bay', hackathonSlug: 'solana-track' }
    const formData = new FormData()
    formData.set('name', 'Test Team')
    try { await createTeam(context, undefined, formData) } catch { /* redirect */ }
    expect(prisma.team.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ name: 'Test Team', hackathonId: 'h1' }) })
    )
  })

  it('createTeam returns errors for empty name', async () => {
    const { createTeam } = await import('@/app/actions/teams')
    const context = { hackathonId: 'h1', cohortSlug: '17th-bay', hackathonSlug: 'solana-track' }
    const formData = new FormData()
    formData.set('name', '')
    const result = await createTeam(context, undefined, formData)
    expect(result).toMatchObject({ errors: { name: expect.any(Array) } })
  })
})
