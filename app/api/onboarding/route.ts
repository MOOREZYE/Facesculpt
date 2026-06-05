import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

const FIELDS = [
  'full_name',
  'country',
  'years_experience',
  'offers_facials',
  'primary_goal',
  'work_setting',
  'heard_about',
  'biggest_challenge',
] as const

export async function POST(req: Request) {
  const cookieClient = await createClient()
  const { data: { user } } = await cookieClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as Record<string, string>

  // Build the row from known fields only
  const row: Record<string, string | null> = { user_id: user.id }
  for (const f of FIELDS) row[f] = (body[f] ?? '').trim() || null

  const db = createServiceClient() as unknown as SupabaseClient

  const { error } = await db
    .from('student_onboarding')
    .upsert(row, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Keep the user's display name in sync with their answer
  if (row.full_name) {
    await db.from('users').update({ full_name: row.full_name }).eq('id', user.id)
  }

  return NextResponse.json({ data: { ok: true }, error: null })
}
