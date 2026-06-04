'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [invalidCode, setInvalidCode] = useState(false)

  useEffect(() => {
    // Verify the signup code is valid
    async function verifyCode() {
      if (!code) {
        setInvalidCode(true)
        return
      }

      const supabase = createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error || !data.session) {
        setInvalidCode(true)
        return
      }

      // Pre-fill full name from user metadata if available
      const user = data.session.user
      if (user.user_metadata?.full_name) {
        setFullName(user.user_metadata.full_name)
      }
    }

    verifyCode()
  }, [code])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (!fullName.trim()) {
      setError('Full name is required.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { full_name: fullName },
    })

    if (updateError) {
      setError('Failed to create account. Please try again.')
      setLoading(false)
      return
    }

    // Success — redirect to dashboard
    router.push('/dashboard')
    router.refresh()
  }

  if (invalidCode) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
        <p className="text-sm text-red-300">
          This sign-up link is invalid or has expired. Please contact support.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-warm-300 mb-1">
          Full name
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          required
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          className="w-full rounded-lg border border-warm-700 bg-warm-950 px-3.5 py-2.5 text-sm text-warm-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-warm-600"
          placeholder="Jane Doe"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-warm-300 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full rounded-lg border border-warm-700 bg-warm-950 px-3.5 py-2.5 text-sm text-warm-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-warm-600"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-warm-300 mb-1">
          Confirm password
        </label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className="w-full rounded-lg border border-warm-700 bg-warm-950 px-3.5 py-2.5 text-sm text-warm-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-warm-600"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || invalidCode}
        className="w-full bg-gold-500 text-warm-950 rounded-lg py-2.5 text-sm font-semibold hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating account…' : 'Complete sign up'}
      </button>
    </form>
  )
}
