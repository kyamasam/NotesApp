'use client'

import { useSession } from 'next-auth/react'
import GoogleLoginButton from './components/GoogleLoginButton'
import NotesApp from './components/NotesApp'

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Always show the notes app - authentication is optional
  // Notes will be saved to localStorage when not logged in

  return <NotesApp user={session?.user} />
}
