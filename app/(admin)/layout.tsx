import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import AdminNav from './AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Identify the logged-in user from their session cookie
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const authId = userData.user.id
  const authEmail = userData.user.email ?? ''

  // Read role from the database with the service client (bypasses RLS).
  // Match on id first, then fall back to email in case public.users.id
  // is not the same UUID as the auth user id.
  const admin = createServiceClient()

  const { data: byId } = (await admin
    .from('users')
    .select('id, email, role')
    .eq('id', authId)
    .maybeSingle()) as { data: { id: string; email: string; role: string } | null }

  let profile = byId
  if (!profile && authEmail) {
    const { data: byEmail } = (await admin
      .from('users')
      .select('id, email, role')
      .eq('email', authEmail)
      .maybeSingle()) as { data: { id: string; email: string; role: string } | null }
    profile = byEmail
  }

  const isAdmin = profile?.role === 'admin'

  if (!isAdmin) {
    // Diagnostic panel — shows exactly what the check saw, instead of a
    // silent redirect. Remove this block once admin access is confirmed.
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-lg w-full">
          <h1 className="text-lg font-semibold text-gray-900 mb-1">Admin access check</h1>
          <p className="text-sm text-gray-500 mb-6">
            You are signed in, but the admin role could not be confirmed. Details below:
          </p>
          <dl className="text-sm space-y-2 font-mono bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">auth id</dt>
              <dd className="text-gray-900 truncate">{authId}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">auth email</dt>
              <dd className="text-gray-900 truncate">{authEmail || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">profile found</dt>
              <dd className="text-gray-900">{profile ? 'yes' : 'no'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">profile.id</dt>
              <dd className="text-gray-900 truncate">{profile?.id ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">profile.role</dt>
              <dd className="text-gray-900">{profile?.role ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">id matches</dt>
              <dd className="text-gray-900">{profile?.id === authId ? 'yes' : 'no'}</dd>
            </div>
          </dl>
          <a href="/dashboard" className="inline-block mt-6 text-sm text-indigo-600 hover:text-indigo-700">
            ← Back to dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNav />
      <main className="flex-1 ml-60">{children}</main>
    </div>
  )
}
