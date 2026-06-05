export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import type { DbModule, DbLesson } from '@/types'
import CreateModuleButton from './CreateModuleButton'
import ModuleReorderRow from './ModuleReorderRow'

export default async function ContentPage() {
  const supabase = createServiceClient()

  const { data: modules } = (await supabase.from('modules').select('*').order('order_index')) as { data: DbModule[] | null }
  const { data: lessons } = (await supabase.from('lessons').select('id, module_id, title, type, order_index, is_published').order('order_index')) as { data: DbLesson[] | null }

  const allModules = modules ?? []
  const allLessons = lessons ?? []

  return (
    <div className="px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Course Content</h1>
          <p className="text-sm text-gray-500 mt-1">{allModules.length} modules · {allLessons.length} lessons</p>
        </div>
        <CreateModuleButton nextIndex={allModules.length + 1} />
      </div>

      <div className="space-y-3">
        {allModules.map(mod => {
          const modLessons = allLessons.filter(l => l.module_id === mod.id)
          return (
            <div key={mod.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Module header */}
              <div className="px-6 py-4 flex items-center gap-4">
                <ModuleReorderRow module={mod} totalModules={allModules.length} />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-400">{String(mod.order_index).padStart(2, '0')}</span>
                    <h3 className="font-medium text-gray-900">{mod.title}</h3>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      mod.is_published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {mod.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  {mod.description && (
                    <p className="text-xs text-gray-400 mt-1 ml-8">{mod.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{modLessons.length} lessons</span>
                  <Link
                    href={`/admin/content/${mod.id}`}
                    className="ml-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Edit →
                  </Link>
                </div>
              </div>

              {/* Lessons preview */}
              {modLessons.length > 0 && (
                <div className="border-t border-gray-100 divide-y divide-gray-100">
                  {modLessons.slice(0, 4).map(lesson => (
                    <div key={lesson.id} className="px-6 py-2.5 flex items-center gap-3 bg-gray-50">
                      <span className="text-xs font-mono text-gray-300 w-6">
                        {String(lesson.order_index).padStart(2, '0')}
                      </span>
                      <span className="text-xs text-gray-600 flex-1">{lesson.title}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        lesson.type === 'video' ? 'bg-purple-50 text-purple-600' :
                        lesson.type === 'quiz' ? 'bg-amber-50 text-amber-600' :
                        lesson.type === 'download' ? 'bg-blue-50 text-blue-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>{lesson.type}</span>
                      {!lesson.is_published && (
                        <span className="text-xs text-gray-400">Draft</span>
                      )}
                      <Link
                        href={`/admin/content/${mod.id}/${lesson.id}`}
                        className="text-xs text-indigo-500 hover:text-indigo-700"
                      >
                        Edit
                      </Link>
                    </div>
                  ))}
                  {modLessons.length > 4 && (
                    <div className="px-6 py-2 bg-gray-50">
                      <Link
                        href={`/admin/content/${mod.id}`}
                        className="text-xs text-gray-400 hover:text-indigo-600"
                      >
                        +{modLessons.length - 4} more lessons — view all
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {allModules.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 py-16 text-center">
            <p className="text-gray-400 text-sm">No modules yet</p>
            <p className="text-gray-300 text-xs mt-1">Click &quot;Add Module&quot; to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
