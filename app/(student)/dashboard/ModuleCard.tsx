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
            ? 'bg-warm-900/40 border-warm-800/60 opacity-60'
            : 'bg-warm-900 border-warm-700 hover:border-warm-600'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isLocked && (
                <svg className="w-4 h-4 text-warm-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
              )}
              <h4 className={`font-semibold text-lg ${isLocked ? 'text-warm-400' : 'text-warm-50'}`}>
                {module.title}
              </h4>
            </div>
            {module.description && <p className="text-sm text-warm-500 mt-1">{module.description}</p>}
          </div>
          <div className="text-right ml-4">
            <div className="text-sm font-semibold text-warm-300 tabular-nums">
              {moduleProgress.completed}/{moduleProgress.total}
            </div>
            <div className="text-xs text-warm-500">lessons</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-warm-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold-500 transition-all duration-300"
            style={{ width: `${moduleProgress.percentage}%` }}
          />
        </div>

        {isLocked && (
          <div className="mt-3 text-xs text-warm-500">Complete previous module to unlock</div>
        )}
        {isComplete && (
          <div className="mt-3 text-xs font-semibold text-gold-500 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            Module complete
          </div>
        )}
      </div>
    </Link>
  )
}
