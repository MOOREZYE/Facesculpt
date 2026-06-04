import { Suspense } from 'react'
import Link from 'next/link'
import SignupForm from './SignupForm'

export default function SignupPage() {
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
          <h2 className="text-lg font-medium text-stone-800 mb-2">Welcome!</h2>
          <p className="text-sm text-stone-600 mb-6">
            Set a password to complete your account setup.
          </p>

          <Suspense fallback={<div className="h-40 animate-pulse bg-stone-50 rounded-lg" />}>
            <SignupForm />
          </Suspense>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-stone-600 hover:text-stone-800 transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
