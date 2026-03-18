// Vitest global setup
// Mock 'server-only' so it does not throw in test environment
vi.mock('server-only', () => ({}))

// Mock next/headers (cookies()) for unit tests
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}))

// Mock next/navigation (redirect) — prevent throws in action tests
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))
