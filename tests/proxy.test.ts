import { describe, it, expect } from 'vitest'

describe('Admin route guard (proxy.ts)', () => {
  it.todo('redirects unauthenticated request to /admin/login')
  it.todo('allows through request with valid session cookie')
  it.todo('allows /admin/login through without session check')
})
