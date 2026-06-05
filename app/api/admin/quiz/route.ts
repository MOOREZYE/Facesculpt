import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase.from('users').select('role').eq('id', user.id).single() as { data: { role: string } | null }
  return data?.role === 'admin'
}

export async function POST(req: Request) {
  if (!(await assertAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { lesson_id, quiz_id, pass_mark, questions } = body
  const supabase = createServiceClient() as unknown as SupabaseClient

  let quizId = quiz_id

  // Upsert quiz
  if (quizId) {
    await supabase.from('quizzes').update({ pass_mark }).eq('id', quizId)
  } else {
    const { data: newQuiz, error } = await supabase
      .from('quizzes')
      .insert({ lesson_id, pass_mark })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    quizId = newQuiz.id
  }

  // Delete existing questions (cascade deletes options)
  await supabase.from('quiz_questions').delete().eq('quiz_id', quizId)

  // Re-insert questions + options
  for (const q of questions) {
    const { data: newQ, error: qErr } = await supabase
      .from('quiz_questions')
      .insert({ quiz_id: quizId, question_text: q.question_text, order_index: q.order_index })
      .select()
      .single()

    if (qErr || !newQ) continue

    if (q.quiz_options?.length) {
      await supabase.from('quiz_options').insert(
        q.quiz_options.map((o: { option_text: string; is_correct: boolean; order_index: number }) => ({
          question_id: newQ.id,
          option_text: o.option_text,
          is_correct: o.is_correct,
          order_index: o.order_index,
        }))
      )
    }
  }

  return NextResponse.json({ ok: true, quiz_id: quizId })
}
