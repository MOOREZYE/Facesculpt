import Link from 'next/link'
import type { DbModule, DbLesson, DbProgress } from '@/types'
import { getModuleProgress, isModuleLocked, isLessonLocked, lessonSlug } from '@/lib'

export default function ModuleCard({
  module,
  lessons,
  progress,
  moduleSlug,
}: {
  module: DbModule
  lessons: DbLesson[]
  progress: Record<string, DbProgress | undefined>
  moduleSlug: string
}) {
  const sortedLessons = lessons.sort((a, b) => a.order_index - b.order_index)
  const moduleProgress = getModuleProgress(module, sortedLessons, progress)
  const isLocked = isModuleLocked(
    module,
    [module], // Simplified check — would need all modules in real app
    sortedLessons,
    progress
  )
  const isComplete = moduleProgress.completed === moduleProgress.total && moduleProgress.total > 0

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:border-stone-300 transition-colors">
      {/* Header */}
      <Link href={`/course/${moduleSlug}`} className="block p-8 hover:bg-stone-50 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-stone-900">{module.title}</h3>
            {module.description && (
              <p className="text-sm text-stone-600 mt-1">{module.description}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-stone-800">
              {moduleProgress.completed}/{moduleProgress.total}
            </div>
            <div className="text-xs text-stone-500">lessons</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-stone-800 transition-all duration-300"
            style={{ width: `${moduleProgress.percentage}%` }}
          />
        </div>
      </Link>

      {/* Lessons list */}
      <div className="border-t border-stone-200 divide-y divide-stone-200">
        {sortedLessons.map(lesson => {
          const lessonProgress = progress[lesson.id]
          const lessonIsLocked = isLessonLocked(lesson, sortedLessons, progress)
          const lessonIsComplete = lessonProgress?.status === 'complete'

          return (
            <div key={lesson.id}>
              {lessonIsLocked ? (
                <div className="px-8 py-4 text-sm text-stone-500 flex items-center gap-3">
                  <span className="text-lg">🔒</span>
                  <span className="flex-1">{lesson.title}</span>
                  <span className="text-xs text-stone-400">Locked</span>
                </div>
              ) : (
                <Link
                  href={`/course/${moduleSlug}/${lessonSlug(module.order_index, lesson.order_index)}`}
                  className="px-8 py-4 text-sm text-stone-900 flex items-center gap-3 hover:bg-stone-50 transition-colors"
                >
                  <span className="text-lg">
                    {lessonIsComplete ? '✅' : '○'}
                  </span>
                  <span className="flex-1">{lesson.title}</span>
                  <span className="text-xs text-stone-400">
                    {lesson.type === 'video' && '🎥'}
                    {lesson.type === 'quiz' && '📝'}
                    {lesson.type === 'download' && '📥'}
                    {lesson.type === 'theory' && '📖'}
                    {lesson.type === 'info' && 'ℹ️'}
                  </span>
                </Link>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      {isLocked && (
        <div className="px-8 py-3 bg-stone-50 text-xs text-stone-600">
          Complete the previous module to unlock
        </div>
      )}
      {isComplete && (
        <div className="px-8 py-3 bg-green-50 text-xs text-green-700 font-semibold">
          ✓ Module complete
        </div>
      )}
    </div>
  )
}
