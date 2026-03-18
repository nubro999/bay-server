import { deleteSession } from '@/app/lib/session'
import { redirect } from 'next/navigation'

export async function POST() {
  await deleteSession()
  redirect('/admin/login')
}
