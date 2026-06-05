import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import type { DbLesson, DbModule } from '@/types'
import LessonEditorForm from './LessonEditorForm'
import QuizBuilder from './QuizBuilder'

export default async function LessonEditorPage({
  params,
}: {
  params: Promise<{ moduleId: string; lessonId: string }>
}) {
  const { moduleId, lessonId } = await params
  const supabase = createServiceClient()

  const [{ data: lesson }, { data: mod }, { data: quiz }] = (await Promise.all([
    supabase.from('lessons').select('*').eq('id', lessonId).single(),
    supabase.from('modules').select('id, title').eq('id', moduleId).single(),
    supabase
      .from('quizzes')
      .select('id, pass_mark, quiz_questions(id, question_text, order_index, quiz_options(id, option_text, is_correct, order_index))')
      .eq('lesson_id', lessonId)
      .maybeSingle(),
  ])) as [
    { data: DbLesson | null },
    { data: Pick<DbModule, 'id' | 'title'> | null },
    { data: unknown },
  ]

  if (!lesson || !mod) notFound()

  return (
    <div className="px-8 py-10">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs text-gray-400">
        <Link href="/admin/content" className="hover:text-gray-600">Content</Link>
        <span>/</span>
        <Link href={`/admin/content/${moduleId}`} className="hover:text-gray-600">{mod.title}</Link>
        <span>/</span>
        <span className="text-gray-700">{lesson.title}</span>
      </div>

      <div className="flex items-start gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{lesson.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
              lesson.type === 'video' ? 'bg-purple-50 text-purple-700' :
              lesson.type === 'quiz' ? 'bg-amber-50 text-amber-700' :
              lesson.type === 'download' ? 'bg-teal-50 text-teal-700' :
              'bg-blue-50 text-blue-700'
            }`}>{lesson.type}</span>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
              lesson.is_published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>{lesson.is_published ? 'Published' : 'Draft'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Main editor */}
        <div className="xl:col-span-3">
          <LessonEditorForm lesson={lesson} moduleId={moduleId} />

          {/* Quiz builder — only for quiz type */}
          {lesson.type === 'quiz' && (
            <div className="mt-8">
              <QuizBuilder
                lessonId={lessonId}
                existingQuiz={quiz as never}
              />
            </div>
          )}
        </div>

        {/* Sidebar hints */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Lesson Type</h3>
            <p className="text-sm text-gray-600">
              {lesson.type === 'video' && 'Paste the Vimeo video URL or ID. The player will track 80% watch time before marking complete.'}
              {lesson.type === 'theory' && 'Write or paste HTML content. Students mark complete by scrolling to the bottom or clicking "Mark complete".'}
              {lesson.type === 'quiz' && 'Build your quiz below. Students must score 80%+ to pass. Retakes are unlimited.'}
              {lesson.type === 'download' && 'Add downloadable resources via lesson_resources in Supabase. Students download files directly.'}
              {lesson.type === 'info' && 'An information-only page. Students click "Mark complete" to continue.'}
            </p>
          </div>

          {lesson.type === 'video' && (
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-5">
              <h3 className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">Video Format</h3>
              <p className="text-xs text-purple-600 leading-relaxed">
                Enter the full Vimeo URL (e.g. <code className="font-mono bg-purple-100 px-1 rounded">https://vimeo.com/123456789</code>) or just the numeric video ID.
                Set the video to domain-restricted in Vimeo settings for privacy.
              </p>
            </div>
          )}

          {lesson.type === 'quiz' && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
              <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Quiz Rules</h3>
              <ul className="text-xs text-amber-600 leading-relaxed space-y-1">
                <li>• Default pass mark: 80%</li>
                <li>• Unlimited retakes</li>
                <li>• Each question needs exactly one correct answer</li>
                <li>• Students see correct/incorrect feedback after submitting</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
