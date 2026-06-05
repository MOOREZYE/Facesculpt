import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { QuizAnswer, QuizResult } from '@/types'

export async function POST(req: Request) {
  // Authenticate the student
  const cookieClient = await createClient()
  const { data: { user } } = await cookieClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as { lessonId: string; answers: QuizAnswer[] }
  const { lessonId, answers } = body
  if (!lessonId || !Array.isArray(answers)) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  const db = createServiceClient() as unknown as SupabaseClient

  // Load the quiz for this lesson
  const { data: quiz } = (await db
    .from('quizzes')
    .select('id, pass_mark')
    .eq('lesson_id', lessonId)
    .maybeSingle()) as { data: { id: string; pass_mark: number } | null }

  if (!quiz) return NextResponse.json({ error: 'No quiz for this lesson' }, { status: 404 })

  // Load questions + correct options (server-side only — never sent to client)
  const { data: questions } = (await db
    .from('quiz_questions')
    .select('id')
    .eq('quiz_id', quiz.id)) as { data: { id: string }[] | null }

  const { data: options } = (await db
    .from('quiz_options')
    .select('id, question_id, is_correct')
    .in('question_id', (questions ?? []).map(q => q.id))) as {
    data: { id: string; question_id: string; is_correct: boolean }[] | null
  }

  const allQuestions = questions ?? []
  const allOptions = options ?? []
  const totalQuestions = allQuestions.length

  if (totalQuestions === 0) {
    return NextResponse.json({ error: 'Quiz has no questions' }, { status: 400 })
  }

  // Grade each question
  const answerMap = new Map(answers.map(a => [a.questionId, a.selectedOptionId]))
  let correctCount = 0
  const gradedAnswers: QuizResult['answers'] = allQuestions.map(q => {
    const correctOption = allOptions.find(o => o.question_id === q.id && o.is_correct)
    const selectedOptionId = answerMap.get(q.id) ?? ''
    const isCorrect = !!correctOption && selectedOptionId === correctOption.id
    if (isCorrect) correctCount++
    return {
      questionId: q.id,
      selectedOptionId,
      correctOptionId: correctOption?.id ?? '',
      isCorrect,
    }
  })

  const score = Math.round((correctCount / totalQuestions) * 100)
  const passed = score >= quiz.pass_mark

  // Record the attempt. Always increment attempts; mark complete only on pass.
  const { data: existing } = (await db
    .from('student_progress')
    .select('id, quiz_attempts')
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId)
    .maybeSingle()) as { data: { id: string; quiz_attempts: number } | null }

  const attempts = (existing?.quiz_attempts ?? 0) + 1

  await db.from('student_progress').upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      status: passed ? 'complete' : 'in_progress',
      quiz_attempts: attempts,
      quiz_passed: passed,
      completed_at: passed ? new Date().toISOString() : null,
    },
    { onConflict: 'user_id,lesson_id' }
  )

  const result: QuizResult = {
    passed,
    score,
    passMark: quiz.pass_mark,
    answers: gradedAnswers,
  }

  return NextResponse.json({ data: result, error: null })
}
