import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware ensures that navigation works properly with the query parameters
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  
  // If someone tries to access /prompt directly (which doesn't exist as a real route)
  // redirect them to /?view=prompt
  if (url.pathname === '/prompt') {
    url.pathname = '/'
    url.searchParams.set('view', 'prompt')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Configure middleware to run on specific paths
export const config = {
  matcher: ['/prompt'],
} 