'use client'

import { useAuth, useUser, SignOutButton, SignedIn } from '@clerk/nextjs'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function Dashboard() {
  const { isSignedIn, getToken } = useAuth()
  const { user } = useUser()

  if (!isSignedIn) {
    return (
      <div className={cn('min-h-dvh flex items-center justify-center px-4 pt-16') }>
        <div className={cn('rounded-2xl border bg-card text-card-foreground shadow p-6 md:p-8 max-w-md w-full text-center') }>
          <div className={cn('text-sm text-muted-foreground') }>Please sign in to access your dashboard.</div>
          <Link href="/sign-in" className={cn('mt-4 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium px-4 py-2 hover:opacity-90') }>
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  const callBackendAPI = async () => {
    const token = await getToken()
    const response = await fetch('http://localhost:3001/api/protected', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json()
    console.log(data)
  }

  return (
    <div className={cn('min-h-dvh flex flex-col') }>
      <main className={cn('flex-1 pt-16') }>
        <div className={cn('mx-auto max-w-6xl px-4 md:px-6 grid lg:grid-cols-3 gap-6') }>
          <div className={cn('lg:col-span-2 rounded-2xl border bg-card text-card-foreground shadow p-6') }>
            <h1 className={cn('text-xl md:text-2xl font-semibold') }>Welcome, {user?.firstName}!</h1>
            <div className={cn('mt-4 grid sm:grid-cols-2 gap-4') }>
              <div className={cn('rounded-xl border p-4') }>
                <div className={cn('text-sm text-muted-foreground') }>Next steps</div>
                <div className={cn('mt-2 flex flex-wrap gap-2') }>
                  <Link href="/upload/resume" className={cn('inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium px-4 py-2 hover:opacity-90') }>
                    Upload resume
                  </Link>
                  <Link href="/interview" className={cn('inline-flex items-center justify-center rounded-md border text-sm font-medium px-4 py-2 hover:bg-accent') }>
                    Start interview
                  </Link>
                </div>
              </div>
              <div className={cn('rounded-xl border p-4') }>
                <div className={cn('text-sm text-muted-foreground') }>Quick stats</div>
                <div className={cn('mt-2 text-sm') }>
                  <div>Interviews taken: 4</div>
                  <div>Avg score: 78</div>
                </div>
              </div>
            </div>
          </div>
          <aside className={cn('lg:col-span-1 space-y-6') }>
            <div className={cn('rounded-2xl border bg-card text-card-foreground shadow p-6') }>
              <div className={cn('text-sm text-muted-foreground') }>Shortcuts</div>
              <div className={cn('mt-2 flex flex-col gap-2 text-sm') }>
                <Link href="/history" className={cn('rounded-md border px-3 py-2 hover:bg-accent') }>View history</Link>
                <Link href="/results" className={cn('rounded-md border px-3 py-2 hover:bg-accent') }>Latest results</Link>
              </div>
            </div>
            <SignedIn>
              <SignOutButton>
                <button className={cn('w-full rounded-md border px-3 py-2 text-sm hover:bg-accent') }>Sign out</button>
              </SignOutButton>
            </SignedIn>
          </aside>
        </div>
      </main>
    </div>
  )
}
