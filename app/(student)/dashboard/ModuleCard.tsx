import Link from 'next/link'
import type { DbModule, DbLesson, DbProgress } from '@/types'
import { getModuleProgress, isModuleLocked } from '@/lib'

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
  const isLocked = isModuleLocked(module, [module], sortedLessons, progress)
  const isComplete = moduleProgress.completed === moduleProgress.total && moduleProgress.total > 0

  return (
    <Link href={`/course/${moduleSlug}`}>
      <div
        className={`rounded-2xl p-6 border transition-all cursor-pointer ${
          isLocked
            ? 'bg-stone-50 border-stone-200 opacity-60'
            : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-md'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="font-bold text-stone-900 text-lg">{module.title}</h4>
            {module.description && <p className="text-sm text-stone-600 mt-1">{module.description}</p>}
          </div>
          <div className="text-right ml-4">
            <div className="text-sm font-semibold text-stone-800">
              {moduleProgress.completed}/{moduleProgress.total}
            </div>
            <div className="text-xs text-stone-500">lessons</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all duration-300"
            style={{ width: `${moduleProgress.percentage}%` }}
          />
        </div>

        {isLocked && (
          <div className="mt-3 text-xs text-stone-500">Complete previous module to unlock</div>
        )}
        {isComplete && (
          <div className="mt-3 text-xs font-semibold text-emerald-700">✓ Module complete</div>
        )}
      </div>
    </Link>
  )
}
