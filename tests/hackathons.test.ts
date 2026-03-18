import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/dal', () => ({
  verifySession: vi.fn().mockResolvedValue({ isAdmin: true }),
}))

vi.mock('@/app/lib/db', () => ({
  prisma: {
    hackathon: {
      create: vi.fn().mockResolvedValue({ id: 'h1', title: 'Solana Track', slug: 'solana-track' }),
      update: vi.fn().mockResolvedValue({ id: 'h1', title: 'Updated', slug: 'updated' }),
      delete: vi.fn().mockResolvedValue({ id: 'h1' }),
    },
  },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

function makeHackathonFormData(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    cohortId: 'clxxxxxxxxxxxxxxxxxxx',
    title: 'Solana Track',
    description: 'Build on Solana with XRPL',
    startsAt: '2026-04-01',
    endsAt: '2026-04-30',
    externalUrl: 'https://colosseum.com/',
    coverImageUrl: '',
    track: 'Solana',
  }
  const data = new FormData()
  Object.entries({ ...defaults, ...overrides }).forEach(([k, v]) => data.set(k, v))
  return data
}

describe('Hackathon actions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('createHackathon stores cohortId FK correctly (cohort scope)', async () => {
    const { createHackathon } = await import('@/app/actions/hackathons')
    const { prisma } = await import('@/app/lib/db')
    const formData = makeHackathonFormData({ cohortId: 'clxxxxxxxxxxxxxxxxxxx' })
    try { await createHackathon(undefined, formData) } catch { /* redirect */ }
    expect(prisma.hackathon.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ cohortId: 'clxxxxxxxxxxxxxxxxxxx' }),
      })
    )
  })

  it('createHackathon generates slug from title', async () => {
    const { createHackathon } = await import('@/app/actions/hackathons')
    const { prisma } = await import('@/app/lib/db')
    const formData = makeHackathonFormData({ title: 'Solana Track 2026' })
    try { await createHackathon(undefined, formData) } catch { /* redirect */ }
    expect(prisma.hackathon.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: 'solana-track-2026' }),
      })
    )
  })

  it('createHackathon validates all required fields via Zod', async () => {
    const { createHackathon } = await import('@/app/actions/hackathons')
    const formData = makeHackathonFormData({ title: '' })
    const result = await createHackathon(undefined, formData)
    expect(result).toMatchObject({ errors: { title: expect.any(Array) } })
  })

  it('createHackathon rejects invalid externalUrl', async () => {
    const { createHackathon } = await import('@/app/actions/hackathons')
    const formData = makeHackathonFormData({ externalUrl: 'not-a-url' })
    const result = await createHackathon(undefined, formData)
    expect(result).toMatchObject({ errors: { externalUrl: expect.any(Array) } })
  })

  it('createHackathon calls verifySession', async () => {
    const { verifySession } = await import('@/app/lib/dal')
    const { createHackathon } = await import('@/app/actions/hackathons')
    try { await createHackathon(undefined, makeHackathonFormData()) } catch { /* redirect */ }
    expect(verifySession).toHaveBeenCalled()
  })

  it('deleteHackathon removes hackathon record', async () => {
    const { deleteHackathon } = await import('@/app/actions/hackathons')
    const { prisma } = await import('@/app/lib/db')
    await deleteHackathon('h1')
    expect(prisma.hackathon.delete).toHaveBeenCalledWith({ where: { id: 'h1' } })
  })

  it('updateHackathon updates mutable fields', async () => {
    const { updateHackathon } = await import('@/app/actions/hackathons')
    const { prisma } = await import('@/app/lib/db')
    const formData = makeHackathonFormData({ title: 'Updated Title' })
    try { await updateHackathon('h1', undefined, formData) } catch { /* redirect */ }
    expect(prisma.hackathon.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'h1' } })
    )
  })
})
