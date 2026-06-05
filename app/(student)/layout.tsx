import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const db = createServiceClient()

  // Admins skip onboarding
  const { data: profile } = (await db
    .from('users')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle()) as { data: { role: string } | null }

  if (profile?.role !== 'admin') {
    const { data: onboarding } = (await db
      .from('student_onboarding')
      .select('completed_at')
      .eq('user_id', userData.user.id)
      .maybeSingle()) as { data: { completed_at: string } | null }

    if (!onboarding) redirect('/onboarding')
  }

  return children
}
