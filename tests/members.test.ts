import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockMemberCount = vi.fn()
const mockMemberCreate = vi.fn()
const mockTransaction = vi.fn()

vi.mock('@/app/lib/db', () => ({
  prisma: {
    $transaction: mockTransaction,
    team: { create: vi.fn() },
    update: { create: vi.fn() },
    submission: { upsert: vi.fn() },
  },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

describe('Member actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMemberCount.mockResolvedValue(2)
    mockMemberCreate.mockResolvedValue({ id: 'm1', name: 'Alice', role: 'Frontend', teamId: 't1' })
    mockTransaction.mockImplementation(async (fn) =>
      fn({ member: { count: mockMemberCount, create: mockMemberCreate } })
    )
  })

  it('joinTeam creates member via transaction when count < 5', async () => {
    const { joinTeam } = await import('@/app/actions/members')
    const context = { teamId: 't1', cohortSlug: '17th-bay', hackathonSlug: 'solana-track' }
    const formData = new FormData()
    formData.set('name', 'Alice')
    formData.set('role', 'Frontend')
    await joinTeam(context, undefined, formData)
    expect(mockMemberCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ name: 'Alice', role: 'Frontend', teamId: 't1' }) })
    )
  })

  it('joinTeam returns error when team is full (count >= 5)', async () => {
    mockMemberCount.mockResolvedValue(5)
    mockTransaction.mockImplementation(async (fn) =>
      fn({ member: { count: mockMemberCount, create: mockMemberCreate } })
    )
    const { joinTeam } = await import('@/app/actions/members')
    const context = { teamId: 't1', cohortSlug: '17th-bay', hackathonSlug: 'solana-track' }
    const formData = new FormData()
    formData.set('name', 'Bob')
    formData.set('role', 'Backend')
    const result = await joinTeam(context, undefined, formData)
    expect(result).toMatchObject({ error: 'This team is full (maximum 5 members).' })
  })

  it('joinTeam uses prisma.$transaction (not bare prisma.member.create)', async () => {
    const { joinTeam } = await import('@/app/actions/members')
    const { prisma } = await import('@/app/lib/db')
    const context = { teamId: 't1', cohortSlug: '17th-bay', hackathonSlug: 'solana-track' }
    const formData = new FormData()
    formData.set('name', 'Alice')
    formData.set('role', 'Frontend')
    await joinTeam(context, undefined, formData)
    expect(prisma.$transaction).toHaveBeenCalled()
  })
})
