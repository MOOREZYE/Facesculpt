'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ExpiredPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string>('')

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUserEmail(data.user.email || '')
      }
    }
    getUser()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-wide text-stone-800">
            FaceSculpt<span className="text-xs align-super">™</span>
          </h1>
          <p className="mt-1 text-sm text-stone-500">Professional Training Platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          <div className="mb-6 text-5xl">⏰</div>

          <h2 className="text-2xl font-bold text-stone-800 mb-3">Access Expired</h2>

          <p className="text-stone-600 mb-6">
            Your course access ended on{' '}
            <span className="font-medium">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            .
          </p>

          <p className="text-sm text-stone-500 mb-8">
            {userEmail && (
              <>
                Signed in as <span className="font-medium">{userEmail}</span>
              </>
            )}
          </p>

          <button
            onClick={handleLogout}
            className="w-full bg-stone-800 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-stone-700 transition-colors mb-3"
          >
            Sign out
          </button>

          <Link
            href="/"
            className="block text-sm text-stone-600 hover:text-stone-800 transition-colors"
          >
            Back to home
          </Link>
        </div>

        <p className="text-xs text-stone-400 mt-6">
          To renew your access, please contact support.
        </p>
      </div>
    </div>
  )
}
