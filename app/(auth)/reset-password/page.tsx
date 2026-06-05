import { Suspense } from 'react'
import Logo from '@/components/Logo'
import Link from 'next/link'
import ResetPasswordForm from './ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-warm-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Logo className="h-12 w-auto mx-auto" />
          <p className="mt-1 text-sm text-warm-500">Professional Training Platform</p>
        </div>

        <div className="card p-8">
          <h2 className="serif text-2xl text-warm-50 mb-8">Create new password</h2>

          <Suspense fallback={<div className="h-40 animate-pulse bg-warm-950 rounded-lg" />}>
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-warm-400 hover:text-warm-50 transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
