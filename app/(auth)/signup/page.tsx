import { Suspense } from 'react'
import Logo from '@/components/Logo'
import Link from 'next/link'
import SignupForm from './SignupForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-warm-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Logo className="h-24 w-auto mx-auto" />
          <p className="mt-1 text-sm text-warm-500">Professional Training Platform</p>
        </div>

        <div className="card p-8">
          <h2 className="text-lg font-medium text-warm-50 mb-2">Welcome!</h2>
          <p className="text-sm text-warm-400 mb-6">
            Set a password to complete your account setup.
          </p>

          <Suspense fallback={<div className="h-40 animate-pulse bg-warm-950 rounded-lg" />}>
            <SignupForm />
          </Suspense>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-warm-400 hover:text-warm-50 transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
