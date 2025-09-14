'use client'

import { useAuth, useUser, SignOutButton, SignedIn, SignedOut } from '@clerk/nextjs'

export default function Dashboard() {
  const { isSignedIn, getToken } = useAuth()
  const { user } = useUser()

  if (!isSignedIn) {
    return <div>Please sign in to access this page</div>
  }

  const callBackendAPI = async () => {
    const token = await getToken()
    
    const response = await fetch('http://localhost:3001/api/protected', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    const data = await response.json()
    console.log(data)
  }

  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <SignedIn>
        <SignOutButton>
          <button>Sign Out</button>
        </SignOutButton>
      </SignedIn>
      <button onClick={callBackendAPI}>Call Protected API</button>
    </div>
  )
}
