import { checkSession } from '@/app/lib/dal'
import Link from 'next/link'
import { AdminNav } from './AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAdmin = await checkSession()

  if (!isAdmin) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex-1">{children}</div>
      <aside className="w-56 shrink-0 border-l border-zinc-200 bg-zinc-50">
        <div className="sticky top-0 p-5 space-y-6">
          <Link
            href="/admin/cohorts"
            className="text-lg font-semibold text-zinc-900 hover:text-zinc-700 transition-colors"
          >
            BAY Admin
          </Link>
          <AdminNav />
        </div>
      </aside>
    </div>
  )
}
