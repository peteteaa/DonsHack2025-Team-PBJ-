import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"

export async function middleware(request: NextRequest) {
  // Don't protect these paths
  if (
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/authenticate') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/status`, {
      headers: {
        Cookie: request.headers.get('cookie') || '',
      },
    })

    const data = await response.json()

    if (!data.authenticated) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    // If there's an error checking authentication, redirect to login
    return NextResponse.redirect(new URL('/auth', request.url))
  }
}
