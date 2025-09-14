import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// const isProtectedRoute = createRouteMatcher([
//   '/dashboard(.*)',
//   '/profile(.*)',
// ])

const isPublicRoute = createRouteMatcher(["/","/sign-in(.*)","/sign-up(.*)"])

export default clerkMiddleware(async (auth, req) => {
  const user = auth()
  const userId = (await user).userId
  const url = new URL(req.url)

  if(userId && isPublicRoute(req) && url.pathname !== "/"){
      return NextResponse.redirect(new URL("/" , req.url))
  }

  if (!isPublicRoute(req)){
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
