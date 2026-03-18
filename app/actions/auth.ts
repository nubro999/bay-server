'use server'
import { createSession, deleteSession } from '@/app/lib/session'
import { redirect } from 'next/navigation'

export async function login(state: unknown, formData: FormData) {
  const password = (formData.get('password') as string) ?? ''

  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Invalid password' }
  }

  await createSession()
  redirect('/admin/cohorts')
}

export async function logout() {
  await deleteSession()
  redirect('/admin/login')
}
