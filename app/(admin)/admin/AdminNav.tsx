'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin/cohorts', label: 'Cohorts' },
  { href: '/admin/hackathons', label: 'Hackathons' },
  { href: '/admin/teams', label: 'Teams' },
  { href: '/admin/submissions', label: 'Submissions' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-zinc-200 text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            {item.label}
          </Link>
        )
      })}

      <div className="border-t border-zinc-200 mt-4 pt-4">
        <Link
          href="/"
          className="px-3 py-2 rounded-md text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors block"
        >
          View Site
        </Link>
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </form>
      </div>
    </nav>
  )
}
