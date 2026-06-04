import { Suspense } from 'react'
import Link from 'next/link'
import ForgotPasswordForm from './ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold tracking-wide text-stone-800">
            FaceSculpt<span className="text-xs align-super">™</span>
          </h1>
          <p className="mt-1 text-sm text-stone-500">Professional Training Platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          <h2 className="text-lg font-medium text-stone-800 mb-6">Reset your password</h2>
          <p className="text-sm text-stone-600 mb-6">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          <Suspense fallback={<div className="h-32 animate-pulse bg-stone-50 rounded-lg" />}>
            <ForgotPasswordForm />
          </Suspense>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-stone-600 hover:text-stone-800 transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
