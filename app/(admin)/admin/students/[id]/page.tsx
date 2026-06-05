export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import type { DbUser, DbModule, DbLesson, DbProgress } from '@/types'
import StudentAccessForm from './StudentAccessForm'

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data: student } = (await supabase.from('users').select('*').eq('id', id).single()) as { data: DbUser | null }
  const { data: modules } = (await supabase.from('modules').select('*').eq('is_published', true).order('order_index')) as { data: DbModule[] | null }
  const { data: lessons } = (await supabase.from('lessons').select('*').eq('is_published', true).order('order_index')) as { data: DbLesson[] | null }
  const { data: progress } = (await supabase.from('student_progress').select('*').eq('user_id', id)) as { data: DbProgress[] | null }

  if (!student) notFound()

  const progressMap = Object.fromEntries((progress ?? []).map(p => [p.lesson_id, p]))
  const allLessons = lessons ?? []
  const totalLessons = allLessons.length
  const completed = allLessons.filter(l => progressMap[l.id]?.status === 'complete').length
  const overallPct = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0

  return (
    <div className="px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <a href="/admin/students" className="text-xs text-gray-400 hover:text-gray-600 mb-4 inline-block">
          ← All Students
        </a>
        <div className="flex items-start gap-5 mt-2">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-semibold">
            {student.full_name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{student.full_name || 'Unnamed Student'}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{student.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-gray-400">
                Enrolled {student.enrolled_at ? new Date(student.enrolled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-xs font-semibold text-indigo-600">{overallPct}% complete</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress by module */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Progress by Module</h2>
          {(modules ?? []).map(mod => {
            const modLessons = allLessons.filter(l => l.module_id === mod.id)
            const modCompleted = modLessons.filter(l => progressMap[l.id]?.status === 'complete').length
            const modPct = modLessons.length > 0 ? Math.round((modCompleted / modLessons.length) * 100) : 0
            const isComplete = modCompleted === modLessons.length && modLessons.length > 0

            return (
              <div key={mod.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-gray-900 text-sm">{mod.title}</p>
                      {isComplete && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">Complete</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${modPct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 tabular-nums">{modCompleted}/{modLessons.length}</span>
                    </div>
                  </div>
                </div>

                {/* Lesson breakdown */}
                <div className="border-t border-gray-100 divide-y divide-gray-100">
                  {modLessons.map(lesson => {
                    const p = progressMap[lesson.id]
                    const status = p?.status ?? 'not_started'
                    return (
                      <div key={lesson.id} className="px-6 py-2.5 flex items-center gap-3 bg-gray-50">
                        <span className="flex-shrink-0">
                          {status === 'complete' ? (
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                            </svg>
                          ) : status === 'in_progress' ? (
                            <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-300" />
                          )}
                        </span>
                        <span className="text-xs text-gray-600 flex-1">{lesson.title}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          lesson.type === 'video' ? 'bg-purple-50 text-purple-600' :
                          lesson.type === 'quiz' ? 'bg-amber-50 text-amber-600' :
                          lesson.type === 'download' ? 'bg-blue-50 text-blue-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {lesson.type}
                        </span>
                        {p?.completed_at && (
                          <span className="text-xs text-gray-400">
                            {new Date(p.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Access management */}
        <div>
          <StudentAccessForm student={student} />
        </div>
      </div>
    </div>
  )
}
