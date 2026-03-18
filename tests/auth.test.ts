import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies before importing actions
vi.mock('@/app/lib/session', () => ({
  createSession: vi.fn(),
  deleteSession: vi.fn(),
}))

describe('Admin login action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set a bcrypt hash of "testpassword" — pre-computed
    process.env.ADMIN_PASSWORD_HASH = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
  })

  it('returns error for wrong password', async () => {
    const { login } = await import('@/app/actions/auth')
    const formData = new FormData()
    formData.set('password', 'wrongpassword')
    const result = await login(undefined, formData)
    expect(result).toEqual({ error: 'Invalid password' })
  })

  it('calls createSession for correct password (testpassword)', async () => {
    const { createSession } = await import('@/app/lib/session')
    const { login } = await import('@/app/actions/auth')
    const formData = new FormData()
    formData.set('password', 'testpassword')
    try {
      await login(undefined, formData)
    } catch {
      // redirect() throws — expected
    }
    expect(createSession).toHaveBeenCalled()
  })
})
