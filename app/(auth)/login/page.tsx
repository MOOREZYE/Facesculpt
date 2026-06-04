import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function LoginPage() {
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
          <h2 className="text-lg font-medium text-stone-800 mb-6">Sign in to your account</h2>
          <Suspense fallback={<div className="h-48 animate-pulse bg-stone-50 rounded-lg" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Don&apos;t have an account?{' '}
          <a href="/#enrol" className="text-stone-600 hover:text-stone-800 transition-colors">
            Enrol in the course
          </a>
        </p>
      </div>
    </div>
  )
}
