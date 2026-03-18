import { describe, it, expect, vi, beforeEach } from 'vitest'

// Set SESSION_SECRET before importing session module
process.env.SESSION_SECRET = 'test-secret-at-least-32-chars-long!!'

describe('Session encryption', () => {
  it('encrypt() produces a non-empty string', async () => {
    const { encrypt } = await import('@/app/lib/session')
    const token = await encrypt({ isAdmin: true, expiresAt: new Date(Date.now() + 3600000) })
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(10)
  })

  it('decrypt() returns isAdmin payload for valid token', async () => {
    const { encrypt, decrypt } = await import('@/app/lib/session')
    const token = await encrypt({ isAdmin: true, expiresAt: new Date(Date.now() + 3600000) })
    const payload = await decrypt(token)
    expect(payload?.isAdmin).toBe(true)
  })

  it('decrypt() returns null for invalid token', async () => {
    const { decrypt } = await import('@/app/lib/session')
    const payload = await decrypt('invalid.token.string')
    expect(payload).toBeNull()
  })

  it('decrypt() returns null for empty string', async () => {
    const { decrypt } = await import('@/app/lib/session')
    const payload = await decrypt('')
    expect(payload).toBeNull()
  })
})
