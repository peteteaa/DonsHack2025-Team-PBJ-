import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log(`[Route] ${request.method} ${request.nextUrl.pathname}`)

  // Don't protect these paths
  if (
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/authenticate') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api')  
  ) {
    console.log(`[Auth] Allowing public access to ${request.nextUrl.pathname}`)
    return NextResponse.next()
  }

  try {
    console.log(`[Auth] Checking authentication for ${request.nextUrl.pathname}`)
    const response = await fetch(`${request.nextUrl.origin}/api/auth/status`, {
      credentials: "include",
      headers: {
        Cookie: request.headers.get('cookie') || ''
      }
    })

    const data = await response.json()
    console.log(`[Auth] Status response:`, data)

    if (!data.authenticated) {
      console.log(`[Auth] Not authenticated, redirecting to /auth`)
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    console.log(`[Auth] Authenticated, allowing access to ${request.nextUrl.pathname}`)
    return NextResponse.next()
  } catch (error) {
    console.error(`[Auth] Error checking authentication:`, error)
    // If there's an error checking authentication, redirect to login
    return NextResponse.redirect(new URL('/auth', request.url))
  }
}
