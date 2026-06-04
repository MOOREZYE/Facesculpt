import type { Database } from './database'

// ── Raw DB row types ──────────────────────────────────────────
export type DbUser           = Database['public']['Tables']['users']['Row']
export type DbModule         = Database['public']['Tables']['modules']['Row']
export type DbLesson         = Database['public']['Tables']['lessons']['Row']
export type DbLessonResource = Database['public']['Tables']['lesson_resources']['Row']
export type DbQuiz           = Database['public']['Tables']['quizzes']['Row']
export type DbQuizQuestion   = Database['public']['Tables']['quiz_questions']['Row']
export type DbQuizOption     = Database['public']['Tables']['quiz_options']['Row']
export type DbProgress       = Database['public']['Tables']['student_progress']['Row']
export type DbCertificate    = Database['public']['Tables']['certificates']['Row']
export type DbLessonNote     = Database['public']['Tables']['lesson_notes']['Row']

// ── Lesson types & status ─────────────────────────────────────
export type LessonType   = DbLesson['type']
export type LessonStatus = DbProgress['status']
export type UserRole     = DbUser['role']

// ── Enriched domain types (used across UI) ────────────────────

export type LessonWithProgress = DbLesson & {
  progress: DbProgress | null
  resources: DbLessonResource[]
  isLocked: boolean
}

export type ModuleWithLessons = DbModule & {
  lessons: LessonWithProgress[]
  completedCount: number
  totalCount: number
  isLocked: boolean
  isComplete: boolean
}

export type QuizWithQuestions = DbQuiz & {
  questions: (DbQuizQuestion & {
    options: DbQuizOption[]
  })[]
}

// ── Slug helpers ──────────────────────────────────────────────
// Slugs are derived from order_index, not title, so they're stable.
// e.g. module order 1 → "module-01", lesson order 3 in module 1 → "lesson-01-03"

export function moduleSlug(orderIndex: number): string {
  return `module-${String(orderIndex).padStart(2, '0')}`
}

export function lessonSlug(moduleIndex: number, lessonIndex: number): string {
  return `lesson-${String(moduleIndex).padStart(2, '0')}-${String(lessonIndex).padStart(2, '0')}`
}

export function parseModuleSlug(slug: string): number {
  return parseInt(slug.replace('module-', ''), 10)
}

export function parseLessonSlug(slug: string): { moduleIndex: number; lessonIndex: number } {
  const [, m, l] = slug.split('-')
  return { moduleIndex: parseInt(m, 10), lessonIndex: parseInt(l, 10) }
}

// ── Quiz submission ───────────────────────────────────────────
export type QuizAnswer = {
  questionId: string
  selectedOptionId: string
}

export type QuizResult = {
  passed: boolean
  score: number        // 0–100
  passMark: number
  answers: {
    questionId: string
    selectedOptionId: string
    correctOptionId: string
    isCorrect: boolean
  }[]
}

// ── API response shapes ───────────────────────────────────────
export type ApiSuccess<T> = { data: T; error: null }
export type ApiError      = { data: null; error: string }
export type ApiResponse<T> = ApiSuccess<T> | ApiError
