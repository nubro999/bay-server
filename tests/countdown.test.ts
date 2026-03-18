import { describe, it, expect, vi, afterEach } from 'vitest'

describe('computeDelta', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns correct d/h/m/s breakdown for a future date', async () => {
    const { computeDelta } = await import('@/app/ui/public/Countdown')
    vi.useFakeTimers()
    const now = new Date('2026-04-01T00:00:00Z')
    vi.setSystemTime(now)
    // 2 days in the future
    const future = new Date('2026-04-03T00:00:00Z')
    const result = computeDelta(future)
    expect(result).toEqual({ d: 2, h: 0, m: 0, s: 0 })
  })

  it('returns null for a past date', async () => {
    const { computeDelta } = await import('@/app/ui/public/Countdown')
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-01T00:00:00Z'))
    const past = new Date('2026-03-31T00:00:00Z')
    expect(computeDelta(past)).toBeNull()
  })

  it('returns null for exactly now (0 seconds remaining)', async () => {
    const { computeDelta } = await import('@/app/ui/public/Countdown')
    vi.useFakeTimers()
    const now = new Date('2026-04-01T00:00:00Z')
    vi.setSystemTime(now)
    expect(computeDelta(now)).toBeNull()
  })

  it('returns { d: 1, h: 2, m: 3, s: 4 } for exactly 1d 2h 3m 4s from now', async () => {
    const { computeDelta } = await import('@/app/ui/public/Countdown')
    vi.useFakeTimers()
    const now = new Date('2026-04-01T00:00:00Z')
    vi.setSystemTime(now)
    // 1 day = 86400s, 2 hours = 7200s, 3 min = 180s, 4 sec = 4s => total 93784s
    const delta = (1 * 86400 + 2 * 3600 + 3 * 60 + 4) * 1000
    const future = new Date(now.getTime() + delta)
    expect(computeDelta(future)).toEqual({ d: 1, h: 2, m: 3, s: 4 })
  })
})
