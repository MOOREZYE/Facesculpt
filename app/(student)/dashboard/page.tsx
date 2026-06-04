import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCourseProgress, getNextLesson, moduleSlug, lessonSlug } from '@/lib'
import type { DbProgress, DbUser, DbModule, DbLesson } from '@/types'
import ExpiryBanner from './ExpiryBanner'
import ModuleCard from './ModuleCard'
import ResumeButton from './ResumeButton'
import HeroSection from './HeroSection'
import DashboardLayout from './DashboardLayout'

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
  const modulesResponse = await supabase
    .from('modules')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true })

  const modules = modulesResponse.data as DbModule[] | null

  console.log('Modules response:', {
    data: modules?.length,
    error: modulesResponse.error,
    status: modulesResponse.status
  })

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
    <DashboardLayout userName={userProfile?.full_name}>
      {/* Expiry warning */}
      {expiresAt && daysUntilExpiry !== null && (
        <ExpiryBanner
          expiresAt={expiresAt}
          daysUntilExpiry={daysUntilExpiry}
          isExpired={false}
        />
      )}

      {/* Hero Section */}
      <HeroSection
        userName={userProfile?.full_name || 'Student'}
        progressPercent={courseProgress.percentage}
      />

      {/* Resume Button */}
      {nextLesson && (
        <div className="mb-12">
          <ResumeButton
            module={nextLesson.module}
            lesson={nextLesson.lesson}
            moduleSlug={moduleSlug(nextLesson.module.order_index)}
            lessonSlug={lessonSlug(nextLesson.module.order_index, nextLesson.lesson.order_index)}
          />
        </div>
      )}

      {/* Modules Grid */}
      <div>
        <h2 className="text-3xl font-bold text-stone-900 mb-8">Your Learning Path</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
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
    </DashboardLayout>
  )
}
