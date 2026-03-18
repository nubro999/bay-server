import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'

process.env.SESSION_SECRET = 'test-secret-at-least-32-chars-long!!'

describe('Admin route guard (proxy.ts)', () => {
  it('redirects unauthenticated request to /admin/login', async () => {
    const { proxy } = await import('@/proxy')
    const request = new NextRequest('http://localhost:3000/admin')
    const response = await proxy(request)
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/admin/login')
  })

  it('allows /admin/login through without session check', async () => {
    const { proxy } = await import('@/proxy')
    const request = new NextRequest('http://localhost:3000/admin/login')
    const response = await proxy(request)
    expect(response.status).toBe(200)
  })
})
