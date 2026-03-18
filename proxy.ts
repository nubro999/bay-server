import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/app/lib/session'

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Allow /admin/login through without session check
  if (path.startsWith('/admin/login')) {
    return NextResponse.next()
  }

  // Guard all other /admin/** routes
  if (path.startsWith('/admin')) {
    const cookie = request.cookies.get('admin_session')?.value
    const session = await decrypt(cookie)

    if (!session?.isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
