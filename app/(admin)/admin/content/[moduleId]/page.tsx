import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import ModuleEditForm from './ModuleEditForm'
import LessonRow from './LessonRow'
import CreateLessonButton from './CreateLessonButton'

export default async function ModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params
  const supabase = createServiceClient()

  const [{ data: mod }, { data: lessons }] = await Promise.all([
    supabase.from('modules').select('*').eq('id', moduleId).single(),
    supabase.from('lessons').select('*').eq('module_id', moduleId).order('order_index'),
  ])

  if (!mod) notFound()
  const allLessons = lessons ?? []

  return (
    <div className="px-8 py-10">
      <div className="mb-6">
        <Link href="/admin/content" className="text-xs text-gray-400 hover:text-gray-600 mb-4 inline-block">
          ← Course Content
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">{mod.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lessons list */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Lessons <span className="text-gray-400 font-normal">({allLessons.length})</span></h2>
            <CreateLessonButton moduleId={moduleId} nextIndex={allLessons.length + 1} />
          </div>

          <div className="space-y-2">
            {allLessons.map((lesson, idx) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                moduleId={moduleId}
                isFirst={idx === 0}
                isLast={idx === allLessons.length - 1}
              />
            ))}
            {allLessons.length === 0 && (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 py-12 text-center">
                <p className="text-gray-400 text-sm">No lessons yet</p>
                <p className="text-gray-300 text-xs mt-1">Click &quot;Add Lesson&quot; to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Module settings */}
        <div>
          <ModuleEditForm mod={mod} />
        </div>
      </div>
    </div>
  )
}
