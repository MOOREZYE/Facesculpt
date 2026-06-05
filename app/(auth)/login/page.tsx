import { Suspense } from 'react'
import Logo from '@/components/Logo'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-warm-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Logo className="h-12 w-auto mx-auto" />
          <p className="mt-1 text-sm text-warm-500">Professional Training Platform</p>
        </div>

        <div className="card p-8">
          <h2 className="serif text-2xl text-warm-50 mb-8">Sign in to your account</h2>
          <Suspense fallback={<div className="h-48 animate-pulse bg-warm-950 rounded-lg" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-warm-500 mt-6">
          Don&apos;t have an account?{' '}
          <a href="/#enrol" className="text-warm-400 hover:text-warm-50 transition-colors">
            Enrol in the course
          </a>
        </p>
      </div>
    </div>
  )
}
