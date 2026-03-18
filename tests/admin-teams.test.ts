import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/dal', () => ({
  verifySession: vi.fn().mockResolvedValue({ isAdmin: true }),
}))

vi.mock('@/app/lib/db', () => ({
  prisma: {
    team: {
      update: vi.fn().mockResolvedValue({ id: 't1', name: 'Updated Team' }),
      delete: vi.fn().mockResolvedValue({ id: 't1' }),
    },
    member: {
      delete: vi.fn().mockResolvedValue({ id: 'm1' }),
    },
  },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

describe('Admin team actions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('updateTeam calls verifySession before any DB operation', async () => {
    const { verifySession } = await import('@/app/lib/dal')
    const { prisma } = await import('@/app/lib/db')
    const { updateTeam } = await import('@/app/actions/admin-teams')
    const formData = new FormData()
    formData.set('name', 'My Team')
    try { await updateTeam('t1', undefined, formData) } catch { /* redirect */ }
    const verifyOrder = (verifySession as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0]
    const updateOrder = (prisma.team.update as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0]
    expect(verifyOrder).toBeLessThan(updateOrder)
  })

  it('updateTeam returns validation error for empty team name', async () => {
    const { updateTeam } = await import('@/app/actions/admin-teams')
    const formData = new FormData()
    formData.set('name', '')
    const result = await updateTeam('t1', undefined, formData)
    expect(result).toMatchObject({ errors: { name: expect.any(Array) } })
  })

  it('updateTeam calls prisma.team.update with correct id and name', async () => {
    const { prisma } = await import('@/app/lib/db')
    const { updateTeam } = await import('@/app/actions/admin-teams')
    const formData = new FormData()
    formData.set('name', 'My Team')
    try { await updateTeam('t1', undefined, formData) } catch { /* redirect */ }
    expect(prisma.team.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 't1' },
        data: expect.objectContaining({ name: 'My Team' }),
      })
    )
  })

  it('deleteTeam calls verifySession before any DB operation', async () => {
    const { verifySession } = await import('@/app/lib/dal')
    const { prisma } = await import('@/app/lib/db')
    const { deleteTeam } = await import('@/app/actions/admin-teams')
    await deleteTeam('t1')
    const verifyOrder = (verifySession as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0]
    const deleteOrder = (prisma.team.delete as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0]
    expect(verifyOrder).toBeLessThan(deleteOrder)
  })

  it('deleteTeam calls prisma.team.delete with correct id', async () => {
    const { prisma } = await import('@/app/lib/db')
    const { deleteTeam } = await import('@/app/actions/admin-teams')
    await deleteTeam('t1')
    expect(prisma.team.delete).toHaveBeenCalledWith({ where: { id: 't1' } })
  })

  it('removeMember calls verifySession before any DB operation', async () => {
    const { verifySession } = await import('@/app/lib/dal')
    const { prisma } = await import('@/app/lib/db')
    const { removeMember } = await import('@/app/actions/admin-teams')
    await removeMember('m1', 't1')
    const verifyOrder = (verifySession as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0]
    const deleteOrder = (prisma.member.delete as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0]
    expect(verifyOrder).toBeLessThan(deleteOrder)
  })

  it('removeMember calls prisma.member.delete with correct id', async () => {
    const { prisma } = await import('@/app/lib/db')
    const { removeMember } = await import('@/app/actions/admin-teams')
    await removeMember('m1', 't1')
    expect(prisma.member.delete).toHaveBeenCalledWith({ where: { id: 'm1' } })
  })
})
