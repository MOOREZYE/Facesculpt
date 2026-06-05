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

  // Resolve the role robustly: cookie client (RLS, own row) first, then
  // service client by id, then by email — covers grant/RLS/id-mismatch edge cases.
  const { data: cookieById } = (await supabase
    .from('users').select('id, email, role').eq('id', authId).maybeSingle()) as { data: Row }

  let profile = cookieById
  if (profile?.role !== 'admin') {
    const admin = createServiceClient()
    const { data: svcById } = (await admin
      .from('users').select('id, email, role').eq('id', authId).maybeSingle()) as { data: Row }
    profile = svcById ?? profile
    if (profile?.role !== 'admin' && authEmail) {
      const { data: svcByEmail } = (await admin
        .from('users').select('id, email, role').eq('email', authEmail).maybeSingle()) as { data: Row }
      profile = svcByEmail ?? profile
    }
  }

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNav />
      <main className="flex-1 ml-60">{children}</main>
    </div>
  )
}
