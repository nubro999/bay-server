import Link from 'next/link'
import { checkSession } from '@/app/lib/dal'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAdmin = await checkSession()

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-zinc-100 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-8 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold text-zinc-900 hover:text-zinc-700 transition-colors"
          >
            BAY
          </Link>
          <Link
            href={isAdmin ? '/admin/cohorts' : '/admin/login'}
            className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            {isAdmin ? 'Admin' : 'Login'}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
        {children}
      </main>
    </div>
  )
}
