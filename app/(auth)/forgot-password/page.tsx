import { Suspense } from 'react'
import Link from 'next/link'
import ForgotPasswordForm from './ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-warm-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="serif text-3xl text-warm-50">
            FaceSculpt<span className="text-xs align-super not-italic">™</span>
          </h1>
          <p className="mt-1 text-sm text-warm-500">Professional Training Platform</p>
        </div>

        <div className="card p-8">
          <h2 className="serif text-2xl text-warm-50 mb-8">Reset your password</h2>
          <p className="text-sm text-warm-400 mb-6">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          <Suspense fallback={<div className="h-32 animate-pulse bg-warm-950 rounded-lg" />}>
            <ForgotPasswordForm />
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
