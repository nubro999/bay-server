import Link from 'next/link'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-zinc-100 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-8">
          <Link
            href="/"
            className="text-lg font-semibold text-zinc-900 hover:text-zinc-700 transition-colors"
          >
            BAY
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
        {children}
      </main>
    </div>
  )
}
