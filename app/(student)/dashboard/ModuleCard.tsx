import Link from 'next/link'
import type { DbModule, DbLesson, DbProgress } from '@/types'
import { getModuleProgress, isModuleLocked, isLessonLocked } from '@/lib'

const lessonIcons: Record<string, string> = {
  video: '🎬',
  quiz: '✓',
  download: '⬇️',
  theory: '📖',
  info: 'ℹ️',
}

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
    [module],
    sortedLessons,
    progress
  )
  const isComplete = moduleProgress.completed === moduleProgress.total && moduleProgress.total > 0

  if (isLocked) {
    return (
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40 p-8 opacity-60">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-stone-400">{module.title}</h3>
            {module.description && (
              <p className="text-sm text-stone-500 mt-1">{module.description}</p>
            )}
          </div>
          <div className="text-3xl">🔒</div>
        </div>
        <p className="text-sm text-stone-500">Complete the previous module to unlock this content</p>
      </div>
    )
  }

  return (
    <Link href={`/course/${moduleSlug}`}>
      <div className="group relative bg-gradient-to-br from-white to-emerald-50/50 rounded-2xl border border-white/60 p-8 shadow-lg hover:shadow-2xl hover:border-emerald-200/60 transition-all duration-300 overflow-hidden cursor-pointer">
        {/* Decorative accent */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-300"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">{isComplete ? '✨' : '📚'}</div>
                <h3 className="text-2xl font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">
                  {module.title}
                </h3>
              </div>
              {module.description && (
                <p className="text-sm text-stone-600 mt-2">{module.description}</p>
              )}
            </div>
            <div className="text-right ml-4">
              <div className="text-3xl font-bold text-emerald-600">{moduleProgress.percentage}%</div>
              <div className="text-xs text-stone-500">
                {moduleProgress.completed}/{moduleProgress.total}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
              style={{ width: `${moduleProgress.percentage}%` }}
            />
          </div>

          {/* Lessons preview */}
          <div className="space-y-2 mb-4">
            {sortedLessons.slice(0, 3).map(lesson => {
              const lessonProgress = progress[lesson.id]
              const lessonIsLocked = isLessonLocked(lesson, sortedLessons, progress)
              const lessonIsComplete = lessonProgress?.status === 'complete'

              return (
                <div
                  key={lesson.id}
                  className={`flex items-center gap-2 text-sm ${
                    lessonIsLocked
                      ? 'text-stone-400'
                      : lessonIsComplete
                        ? 'text-emerald-600'
                        : 'text-stone-600'
                  }`}
                >
                  <span className="flex-shrink-0 w-5 text-center">
                    {lessonIsLocked ? '🔒' : lessonIsComplete ? '✓' : '○'}
                  </span>
                  <span className="truncate">{lesson.title}</span>
                  <span className="ml-auto text-xs opacity-60">
                    {lessonIcons[lesson.type] || '•'}
                  </span>
                </div>
              )
            })}
            {sortedLessons.length > 3 && (
              <p className="text-xs text-stone-500 italic pt-1">
                +{sortedLessons.length - 3} more lessons
              </p>
            )}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2 text-emerald-600 font-medium group-hover:gap-3 transition-all">
            <span>{isComplete ? 'Review Module' : 'Continue Learning'}</span>
            <span className="text-xl">→</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
