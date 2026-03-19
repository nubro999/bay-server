import 'server-only'
import { cookies } from 'next/headers'
import { decrypt } from '@/app/lib/session'
import { redirect } from 'next/navigation'
import { cache } from 'react'

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get('admin_session')?.value
  const session = await decrypt(cookie)

  if (!session?.isAdmin) {
    redirect('/admin/login')
  }

  return { isAdmin: true as const }
})

export const checkSession = cache(async () => {
  const cookie = (await cookies()).get('admin_session')?.value
  const session = await decrypt(cookie)
  return !!session?.isAdmin
})
