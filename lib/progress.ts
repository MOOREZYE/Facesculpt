import type { DbModule, DbLesson, DbProgress } from '@/types'

// Calculate if a lesson is locked based on previous lessons in its module
export function isLessonLocked(
  lesson: DbLesson,
  lessons: DbLesson[],
  progress: Record<string, DbProgress | undefined>
): boolean {
  // Get all lessons before this one in the same module
  const previousLessons = lessons.filter(
    l => l.module_id === lesson.module_id && l.order_index < lesson.order_index
  )

  // If there are no previous lessons, this lesson is not locked
  if (previousLessons.length === 0) return false

  // All previous lessons must be complete
  return !previousLessons.every(l => progress[l.id]?.status === 'complete')
}

// Calculate if a module is locked based on previous module completion
export function isModuleLocked(
  module: DbModule,
  modules: DbModule[],
  lessons: DbLesson[],
  progress: Record<string, DbProgress | undefined>
): boolean {
  // Get the previous module
  const previousModule = modules.find(m => m.order_index === module.order_index - 1)

  // If there's no previous module, this module is not locked
  if (!previousModule) return false

  // All lessons in the previous module must be complete
  const previousModuleLessons = lessons.filter(l => l.module_id === previousModule.id)
  return !previousModuleLessons.every(l => progress[l.id]?.status === 'complete')
}

// Get completion status for a lesson
export function getLessonStatus(
  lesson: DbLesson,
  prog: DbProgress | undefined
): DbProgress['status'] {
  return prog?.status ?? 'not_started'
}

// Calculate progress percentage for a module
export function getModuleProgress(
  module: DbModule,
  lessons: DbLesson[],
  progress: Record<string, DbProgress | undefined>
): { completed: number; total: number; percentage: number } {
  const moduleLessons = lessons.filter(l => l.module_id === module.id && l.is_published)
  const completed = moduleLessons.filter(l => progress[l.id]?.status === 'complete').length
  const total = moduleLessons.length

  return {
    completed,
    total,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  }
}

// Calculate overall course progress
export function getCourseProgress(
  lessons: DbLesson[],
  progress: Record<string, DbProgress | undefined>
): { completed: number; total: number; percentage: number } {
  const publishedLessons = lessons.filter(l => l.is_published)
  const completed = publishedLessons.filter(l => progress[l.id]?.status === 'complete').length
  const total = publishedLessons.length

  return {
    completed,
    total,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  }
}

// Find the current lesson for "resume" button
// Prefers in_progress, then falls back to first not_started in the active module
export function getNextLesson(
  modules: DbModule[],
  lessons: DbLesson[],
  progress: Record<string, DbProgress | undefined>
): { module: DbModule; lesson: DbLesson } | null {
  const sortedModules = modules.sort((a, b) => a.order_index - b.order_index)

  // First pass: find an in_progress lesson
  for (const mod of sortedModules) {
    if (!mod.is_published) continue
    if (isModuleLocked(mod, modules, lessons, progress)) continue

    const moduleLessons = lessons
      .filter(l => l.module_id === mod.id && l.is_published)
      .sort((a, b) => a.order_index - b.order_index)

    for (const lesson of moduleLessons) {
      if (progress[lesson.id]?.status === 'in_progress') {
        return { module: mod, lesson }
      }
    }
  }

  // Second pass: first not_started lesson in first unlocked incomplete module
  for (const mod of sortedModules) {
    if (!mod.is_published) continue
    if (isModuleLocked(mod, modules, lessons, progress)) continue

    const moduleLessons = lessons
      .filter(l => l.module_id === mod.id && l.is_published)
      .sort((a, b) => a.order_index - b.order_index)

    for (const lesson of moduleLessons) {
      if (progress[lesson.id]?.status !== 'complete') {
        return { module: mod, lesson }
      }
    }
  }

  return null
}

// Check if course is 100% complete
export function isCourseComplete(
  lessons: DbLesson[],
  progress: Record<string, DbProgress | undefined>
): boolean {
  const publishedLessons = lessons.filter(l => l.is_published)
  return publishedLessons.length > 0 && publishedLessons.every(l => progress[l.id]?.status === 'complete')
}
