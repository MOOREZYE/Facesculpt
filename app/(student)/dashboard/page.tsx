import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCourseProgress, getNextLesson, moduleSlug, lessonSlug } from '@/lib'
import type { DbProgress, DbUser, DbModule, DbLesson } from '@/types'
import ExpiryBanner from './ExpiryBanner'
import ModuleCard from './ModuleCard'
import ResumeButton from './ResumeButton'
import ProgressBar from './ProgressBar'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch user
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const userId = userData.user.id

  // Fetch user profile (for full_name, access_expires_at)
  const { data: userProfile } = (await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()) as { data: DbUser | null }

  // Fetch all published modules in order
  const { data: modules } = (await supabase
    .from('modules')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true })) as { data: DbModule[] | null }

  console.log('Dashboard fetch:', { userId, modules: modules?.length, lessonsCount: 0 })

  // Fetch all published lessons
  const { data: lessons } = (await supabase
    .from('lessons')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true })) as { data: DbLesson[] | null }

  // Fetch user's progress for all lessons
  const { data: progressData } = (await supabase
    .from('student_progress')
    .select('*')
    .eq('user_id', userId)) as { data: DbProgress[] | null }

  // Map progress by lesson_id for easy lookup
  const progress: Record<string, DbProgress | undefined> = Object.fromEntries(
    (progressData ?? []).map(p => [p.lesson_id, p])
  )

  // Calculate overall progress
  const courseProgress = getCourseProgress(lessons ?? [], progress)

  // Find next lesson to resume
  const nextLesson = getNextLesson(modules ?? [], lessons ?? [], progress)

  // Check access expiry
  const expiresAt = userProfile?.access_expires_at
    ? new Date(userProfile.access_expires_at)
    : null
  const isExpired = expiresAt && expiresAt < new Date()
  const daysUntilExpiry = expiresAt
    ? Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  if (isExpired) redirect('/expired')

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-stone-800">
            FaceSculpt<span className="text-xs align-super">™</span>
          </h1>
          <div className="text-sm text-stone-600">
            {userProfile?.full_name && <span>{userProfile.full_name}</span>}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Expiry warning */}
        {expiresAt && daysUntilExpiry !== null && (
          <ExpiryBanner
            expiresAt={expiresAt}
            daysUntilExpiry={daysUntilExpiry}
            isExpired={false}
          />
        )}

        {/* Welcome + Overall progress */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-stone-900 mb-2">Welcome back!</h2>
          <p className="text-stone-600 mb-8">
            You&apos;re {courseProgress.percentage}% through the course.
          </p>

          <div className="bg-white rounded-2xl border border-stone-200 p-8 mb-8">
            <div className="flex items-end justify-between mb-3">
              <h3 className="text-lg font-semibold text-stone-800">Your Progress</h3>
              <span className="text-sm text-stone-500">
                {courseProgress.completed} of {courseProgress.total} lessons
              </span>
            </div>
            <ProgressBar percentage={courseProgress.percentage} />
          </div>
        </div>

        {/* Resume button */}
        {nextLesson && (
          <ResumeButton
            module={nextLesson.module}
            lesson={nextLesson.lesson}
            moduleSlug={moduleSlug(nextLesson.module.order_index)}
            lessonSlug={lessonSlug(nextLesson.module.order_index, nextLesson.lesson.order_index)}
          />
        )}

        {/* Modules */}
        <div>
          <h3 className="text-2xl font-bold text-stone-900 mb-6">Modules</h3>
          <div className="grid gap-6">
            {(modules ?? []).map(module => (
              <ModuleCard
                key={module.id}
                module={module}
                lessons={(lessons ?? []).filter(l => l.module_id === module.id)}
                progress={progress}
                moduleSlug={moduleSlug(module.order_index)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
