import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

// Mark a lesson complete (or update status) for the current student.
// Used by the video player (80% watched) and theory "Mark complete".
export async function POST(req: Request) {
  const cookieClient = await createClient()
  const { data: { user } } = await cookieClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as { lessonId: string; status?: 'in_progress' | 'complete'; reset?: boolean }
  const { lessonId, reset } = body
  const status = body.status ?? 'complete'
  if (!lessonId) return NextResponse.json({ error: 'Missing lessonId' }, { status: 400 })

  const db = createServiceClient() as unknown as SupabaseClient

  // Debug/testing: remove the progress row so the lesson returns to not_started
  if (reset) {
    const { error } = await db
      .from('student_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: { status: 'not_started' }, error: null })
  }

  // Confirm the lesson exists and is published (don't let arbitrary ids be marked)
  const { data: lesson } = (await db
    .from('lessons')
    .select('id, is_published')
    .eq('id', lessonId)
    .maybeSingle()) as { data: { id: string; is_published: boolean } | null }

  if (!lesson || !lesson.is_published) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
  }

  const { error } = await db.from('student_progress').upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      status,
      completed_at: status === 'complete' ? new Date().toISOString() : null,
    },
    { onConflict: 'user_id,lesson_id' }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: { status }, error: null })
}
