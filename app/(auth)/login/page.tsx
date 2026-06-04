import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function LoginPage() {
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
          <h2 className="text-lg font-medium text-zinc-50 mb-6">Sign in to your account</h2>
          <Suspense fallback={<div className="h-48 animate-pulse bg-zinc-950 rounded-lg" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Don&apos;t have an account?{' '}
          <a href="/#enrol" className="text-zinc-400 hover:text-zinc-50 transition-colors">
            Enrol in the course
          </a>
        </p>
      </div>
    </div>
  )
}
