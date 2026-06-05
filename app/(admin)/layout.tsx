import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import AdminNav from './AdminNav'

type Row = { id: string; email: string; role: string } | null

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const authId = userData.user.id
  const authEmail = userData.user.email ?? ''

  // Path A — cookie client (respects RLS, reads the user's own row)
  const { data: cookieById, error: cookieErr } = (await supabase
    .from('users')
    .select('id, email, role')
    .eq('id', authId)
    .maybeSingle()) as { data: Row; error: { message: string } | null }

  // Path B / C — service client (bypasses RLS; null if the service key is bad)
  const admin = createServiceClient()
  const { data: svcById, error: svcErr } = (await admin
    .from('users')
    .select('id, email, role')
    .eq('id', authId)
    .maybeSingle()) as { data: Row; error: { message: string } | null }
  const { data: svcByEmail } = (await admin
    .from('users')
    .select('id, email, role')
    .eq('email', authEmail)
    .maybeSingle()) as { data: Row; error: { message: string } | null }

  const profile = cookieById ?? svcById ?? svcByEmail
  const isAdmin = profile?.role === 'admin'

  if (!isAdmin) {
    const rows: [string, string][] = [
      ['auth id', authId],
      ['auth email', authEmail || '—'],
      ['cookie-client by id', cookieById ? `role=${cookieById.role}` : `not found${cookieErr ? ` (err: ${cookieErr.message})` : ''}`],
      ['service by id', svcById ? `role=${svcById.role}` : `not found${svcErr ? ` (err: ${svcErr.message})` : ''}`],
      ['service by email', svcByEmail ? `role=${svcByEmail.role}` : 'not found'],
    ]
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-xl w-full">
          <h1 className="text-lg font-semibold text-gray-900 mb-1">Admin access check</h1>
          <p className="text-sm text-gray-500 mb-6">Admin role could not be confirmed. Details:</p>
          <dl className="text-xs space-y-2 font-mono bg-gray-50 rounded-lg p-4 border border-gray-100">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6">
                <dt className="text-gray-500 whitespace-nowrap">{k}</dt>
                <dd className="text-gray-900 text-right break-all">{v}</dd>
              </div>
            ))}
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
