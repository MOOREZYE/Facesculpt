import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import AdminNav from './AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Identify the logged-in user from their session cookie
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  // Read role from the database using the service client (bypasses RLS,
  // so a missing/strict RLS policy can never hide the admin role)
  const admin = createServiceClient()
  const { data: profile } = (await admin
    .from('users')
    .select('role')
    .eq('id', userData.user.id)
    .single()) as { data: { role: string } | null }

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNav />
      <main className="flex-1 ml-60">{children}</main>
    </div>
  )
}
