import { describe, it, expect } from 'vitest'

describe('Session encryption', () => {
  it.todo('encrypt() produces a JWT string')
  it.todo('decrypt() returns payload for valid token')
  it.todo('decrypt() returns null for invalid token')
  it.todo('createSession() calls cookies().set with httpOnly flag')
  it.todo('deleteSession() calls cookies().delete')
})
