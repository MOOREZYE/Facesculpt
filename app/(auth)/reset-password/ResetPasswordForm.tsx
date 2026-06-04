'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [invalidCode, setInvalidCode] = useState(false)

  useEffect(() => {
    // Verify the reset code is valid by checking session
    async function verifyCode() {
      if (!code) {
        setInvalidCode(true)
        return
      }

      const supabase = createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error || !data.session) {
        setInvalidCode(true)
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

    setLoading(true)

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError('Failed to update password. Please try again.')
      setLoading(false)
      return
    }

    // Success — redirect to login
    router.push('/login?passwordReset=true')
  }

  if (invalidCode) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
        <p className="text-sm text-red-300">
          This reset link is invalid or has expired. Please request a new one.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1">
          New password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-zinc-700"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-zinc-300 mb-1">
          Confirm password
        </label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-zinc-700"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-500 text-zinc-950 rounded-lg py-2.5 text-sm font-semibold hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Updating…' : 'Update password'}
      </button>
    </form>
  )
}
