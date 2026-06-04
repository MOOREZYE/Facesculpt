import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCourseProgress, getNextLesson, moduleSlug, lessonSlug } from '@/lib'
import type { DbProgress, DbUser, DbModule, DbLesson } from '@/types'
import ModuleCard from './ModuleCard'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const userId = userData.user.id

  const { data: userProfile } = (await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()) as { data: DbUser | null }

  const modulesResponse = await supabase
    .from('modules')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true })

  const modules = modulesResponse.data as DbModule[] | null

  const lessonsResponse = await supabase
    .from('lessons')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true })

  const lessons = lessonsResponse.data as DbLesson[] | null

  const progressResponse = (await supabase
    .from('student_progress')
    .select('*')
    .eq('user_id', userId)) as { data: DbProgress[] | null }

  const progress: Record<string, DbProgress | undefined> = Object.fromEntries(
    ((progressResponse.data as DbProgress[] | null) ?? []).map(p => [p.lesson_id, p])
  )

  const courseProgress = getCourseProgress(lessons ?? [], progress)
  const nextLesson = getNextLesson(modules ?? [], lessons ?? [], progress)

  const expiresAt = userProfile?.access_expires_at
    ? new Date(userProfile.access_expires_at)
    : null
  const isExpired = expiresAt && expiresAt < new Date()
  const daysUntilExpiry = expiresAt
    ? Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  if (isExpired) redirect('/expired')

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-stone-200 fixed left-0 top-0 h-screen p-6 z-40">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold">
            FS
          </div>
          <div>
            <h1 className="font-bold text-sm text-stone-900">FaceSculpt™</h1>
            <p className="text-xs text-stone-500">Training</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-stone-100 text-stone-900 font-medium text-sm"
          >
            <span className="text-lg">📊</span>
            Dashboard
          </a>
          <a
            href="/course"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-stone-600 hover:bg-stone-50 font-medium text-sm"
          >
            <span className="text-lg">📚</span>
            Courses
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-stone-600 hover:bg-stone-50 font-medium text-sm"
          >
            <span className="text-lg">👤</span>
            Profile
          </a>
        </nav>

        <div className="space-y-3 pt-6 border-t border-stone-200">
          <button className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 transition-colors">
            Get Support
          </button>
          <button className="w-full px-4 py-2.5 text-stone-600 hover:bg-stone-50 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 justify-center">
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-6 md:pt-8 px-4 md:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-2">
              Welcome back, {userProfile?.full_name?.split(' ')[0] || 'Student'}.
            </h1>
            <p className="text-stone-600">
              You&apos;re {courseProgress.percentage}% through your FaceSculpt™ certification. Keep it up!
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-4 mt-4 md:mt-0 bg-white p-3 px-4 rounded-full border border-stone-200 shadow-sm">
            <div className="text-right">
              <div className="text-sm font-semibold text-stone-900">{nextLesson?.module.title || 'Modules'}</div>
              <div className="text-xs text-stone-500">Module {modules?.length || 0} of 8</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              F
            </div>
          </div>
        </div>

        {/* Expiry Warning */}
        {expiresAt && daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <p className="text-sm text-amber-900">
              <span className="font-semibold">Access expiring soon:</span> Your course access expires in{' '}
              <span className="font-semibold">{daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}</span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* UP NEXT Card */}
            {nextLesson && (
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-xs font-bold uppercase tracking-wide text-emerald-200 mb-2">UP NEXT</div>
                    <h3 className="text-2xl font-bold mb-2">{nextLesson.lesson.title}</h3>
                    <p className="text-emerald-100">
                      {nextLesson.lesson.type === 'video' && '🎬 Video'}
                      {nextLesson.lesson.type === 'theory' && '📖 Theory'}
                      {nextLesson.lesson.type === 'quiz' && '✓ Quiz'}
                      {nextLesson.lesson.type === 'download' && '📥 Download'}
                    </p>
                  </div>
                  <a
                    href={`/course/${moduleSlug(nextLesson.module.order_index)}/${lessonSlug(
                      nextLesson.module.order_index,
                      nextLesson.lesson.order_index
                    )}`}
                    className="px-6 py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>▶</span>
                    Resume Learning
                  </a>
                </div>
              </div>
            )}

            {/* Overall Progress */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-stone-900">Your Progress</h3>
                  <p className="text-sm text-stone-600 mt-1">FaceSculpt™ Certification</p>
                </div>
                <span className="text-4xl font-bold text-emerald-600">{courseProgress.percentage}%</span>
              </div>
              <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                  style={{ width: `${courseProgress.percentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-4 text-sm text-stone-600">
                <span>{courseProgress.completed} of {courseProgress.total} lessons completed</span>
                <span>Est. {Math.max(1, Math.ceil((courseProgress.total - courseProgress.completed) * 0.5))} hours left</span>
              </div>
            </div>

            {/* Modules Grid */}
            <div>
              <h3 className="text-2xl font-bold text-stone-900 mb-6">Your Modules</h3>
              <div className="space-y-4">
                {(modules ?? []).slice(0, 4).map(module => {
                  const moduleLessons = (lessons ?? []).filter(l => l.module_id === module.id)
                  return (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      lessons={moduleLessons}
                      progress={progress}
                      moduleSlug={moduleSlug(module.order_index)}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Cards */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-sm opacity-90 mb-2">Completion Rate</div>
              <div className="text-5xl font-bold">{courseProgress.percentage}%</div>
              <div className="text-sm opacity-75 mt-2">Course Progress</div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <div className="text-sm text-stone-600 mb-2">Lessons Completed</div>
              <div className="text-5xl font-bold text-stone-900">{courseProgress.completed}</div>
              <div className="text-sm text-stone-500 mt-2">out of {courseProgress.total}</div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <h4 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                <span className="text-lg">⏰</span>
                Access Expiry
              </h4>
              {expiresAt ? (
                <div className="text-center">
                  <div className="text-3xl font-bold text-stone-900">
                    {daysUntilExpiry !== null && daysUntilExpiry > 0 ? daysUntilExpiry : 'Expired'}
                  </div>
                  <div className="text-sm text-stone-600 mt-2">
                    {expiresAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-stone-600">Lifetime access</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
