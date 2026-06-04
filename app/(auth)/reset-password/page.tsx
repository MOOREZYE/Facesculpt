import { Suspense } from 'react'
import Link from 'next/link'
import ResetPasswordForm from './ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold tracking-wide text-zinc-50">
            FaceSculpt<span className="text-xs align-super">™</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Professional Training Platform</p>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
          <h2 className="text-lg font-medium text-zinc-50 mb-6">Create new password</h2>

          <Suspense fallback={<div className="h-40 animate-pulse bg-zinc-950 rounded-lg" />}>
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-zinc-50 transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
