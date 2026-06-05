import { redirect } from 'next/navigation'
import Logo from '@/components/Logo'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import OnboardingForm from './OnboardingForm'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const db = createServiceClient()

  // Already onboarded → straight to the course
  const { data: existing } = (await db
    .from('student_onboarding')
    .select('completed_at')
    .eq('user_id', userData.user.id)
    .maybeSingle()) as { data: { completed_at: string } | null }

  if (existing) redirect('/dashboard')

  // Prefill name from auth metadata if present
  const prefillName =
    (userData.user.user_metadata?.full_name as string | undefined) ?? ''

  return (
    <div className="min-h-screen bg-warm-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <Logo className="h-20 w-auto mx-auto" />
          <p className="mt-2 text-xs tracking-[0.2em] uppercase text-warm-600">
            Before we begin
          </p>
        </div>
        <OnboardingForm prefillName={prefillName} />
      </div>
    </div>
  )
}
