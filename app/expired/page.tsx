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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-wide text-zinc-50">
            FaceSculpt<span className="text-xs align-super">™</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Professional Training Platform</p>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-zinc-50 mb-3">Access Expired</h2>

          <p className="text-zinc-400 mb-6">
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

          <p className="text-sm text-zinc-500 mb-8">
            {userEmail && (
              <>
                Signed in as <span className="font-medium">{userEmail}</span>
              </>
            )}
          </p>

          <button
            onClick={handleLogout}
            className="w-full bg-emerald-500 text-zinc-950 rounded-lg py-2.5 text-sm font-semibold hover:bg-emerald-400 transition-colors mb-3"
          >
            Sign out
          </button>

          <Link
            href="/"
            className="block text-sm text-zinc-400 hover:text-zinc-50 transition-colors"
          >
            Back to home
          </Link>
        </div>

        <p className="text-xs text-zinc-500 mt-6">
          To renew your access, please contact support.
        </p>
      </div>
    </div>
  )
}
