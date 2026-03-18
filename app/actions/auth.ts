'use server'
import bcrypt from 'bcryptjs'
import { createSession, deleteSession } from '@/app/lib/session'
import { redirect } from 'next/navigation'

export async function login(state: unknown, formData: FormData) {
  const password = (formData.get('password') as string) ?? ''

  const hash = process.env.ADMIN_PASSWORD_HASH!
  const match = await bcrypt.compare(password, hash)

  if (!match) {
    return { error: 'Invalid password' }
  }

  await createSession()
  redirect('/admin')
}

export async function logout() {
  await deleteSession()
  redirect('/admin/login')
}
