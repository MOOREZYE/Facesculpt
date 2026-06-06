import { redirect } from 'next/navigation'
import Logo from '@/components/Logo'
import { createClient } from '@/lib/supabase/server'
import { getCourseProgress, getNextLesson, moduleSlug, lessonSlug } from '@/lib'
import type { DbProgress, DbUser, DbModule, DbLesson } from '@/types'


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

  const firstName = userProfile?.full_name?.split(' ')[0] || 'Student'

  return (
    <div className="min-h-screen bg-warm-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 h-screen z-40 p-8" style={{background:'linear-gradient(180deg,#111009 0%,#0D0B09 100%)',borderRight:'1px solid #2A2420'}}>
        <div className="mb-14">
          <Logo className="w-full h-auto mb-3" />
          <p className="text-xs tracking-[0.18em] uppercase text-warm-600">Professional Training</p>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { href: '/dashboard', label: 'Dashboard', active: true },
            { href: '/course', label: 'Course', active: false },
            { href: '#', label: 'Profile', active: false },
          ].map(item => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                item.active
                  ? 'text-gold-500 bg-gold-500/8'
                  : 'text-warm-500 hover:text-warm-200 hover:bg-warm-800/30'
              }`}
            >
              {item.active && <span className="w-1 h-4 rounded-full bg-gold-500 mr-1" />}
              {item.label}
            </a>
          ))}
        </nav>

        <div className="pt-6 border-t border-warm-800 space-y-3">
          <button className="w-full px-4 py-2.5 border border-gold-500/40 text-gold-500 rounded-lg text-sm hover:bg-gold-500/8 transition-colors tracking-wide">
            Get Support
          </button>
          <button className="w-full px-4 py-2 text-warm-600 hover:text-warm-400 text-sm transition-colors tracking-wide">
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-12 md:pt-16 px-6 md:px-14 pb-24">
        {/* Header */}
        <div className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-warm-500 mb-4">Welcome back</p>
            <h1 className="serif text-5xl md:text-6xl text-warm-50 mb-4 leading-none">
              {firstName}.
            </h1>
            <p className="text-warm-500 text-base">
              {courseProgress.percentage}% through your FaceSculpt™ certification.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-4 mt-6 md:mt-0 py-2.5 px-5 rounded-full border border-warm-700/60" style={{background:'linear-gradient(135deg,#1A1612 0%,#141110 100%)'}}>
            <div className="text-right">
              <div className="text-sm font-medium text-warm-200">{nextLesson?.module.title || 'Modules'}</div>
              <div className="text-xs text-warm-500">Module {modules?.length || 0} of 8</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500 text-sm font-semibold">
              F
            </div>
          </div>
        </div>

        {/* Expiry Warning */}
        {expiresAt && daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
          <div className="mb-8 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
            <p className="text-sm text-amber-300">
              <span className="font-semibold">Access expiring soon:</span> Your course access expires in{' '}
              <span className="font-semibold">{daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}</span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* CURRENT LESSON Card */}
            {nextLesson && (
              <div className="card relative overflow-hidden p-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/3 rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                  <div className="flex-1">
                    <p className="text-xs tracking-[0.2em] uppercase text-gold-500 mb-2">Current Lesson</p>
                    <p className="text-xs text-warm-600 mb-4">{nextLesson.module.title}</p>
                    <h3 className="serif text-3xl text-warm-50 mb-3 leading-snug">{nextLesson.lesson.title}</h3>
                    <p className="text-warm-500 text-sm capitalize">{nextLesson.lesson.type}</p>
                  </div>
                  <a
                    href={`/course/${moduleSlug(nextLesson.module.order_index)}/${lessonSlug(
                      nextLesson.module.order_index,
                      nextLesson.lesson.order_index
                    )}`}
                    className="px-7 py-3 bg-gold-500 text-warm-950 rounded-lg font-semibold text-sm hover:bg-gold-400 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    Resume
                  </a>
                </div>
              </div>
            )}

            {/* Overall Progress */}
            <div className="card p-10">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h3 className="serif text-2xl text-warm-50 mb-1">Your Progress</h3>
                  <p className="text-sm text-warm-500">FaceSculpt™ Certification</p>
                </div>
                <span className="text-5xl font-light text-gold-500 tabular-nums tracking-tight">{courseProgress.percentage}%</span>
              </div>
              <div className="w-full h-px bg-warm-700 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full bg-gold-500 transition-all duration-700"
                  style={{ width: `${courseProgress.percentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-5 text-xs text-warm-500 tracking-wide">
                <span>{courseProgress.completed} of {courseProgress.total} lessons completed</span>
                <span>Est. {Math.max(1, Math.ceil((courseProgress.total - courseProgress.completed) * 0.5))} hours remaining</span>
              </div>
            </div>

            {/* Next Module — the locked module after the current one */}
            {(() => {
              const sortedModules = (modules ?? []).sort((a, b) => a.order_index - b.order_index)
              // Current module = first with any incomplete lessons
              const currentModuleIdx = sortedModules.findIndex(m => {
                const mLessons = (lessons ?? []).filter(l => l.module_id === m.id && l.is_published)
                return mLessons.some(l => progress[l.id]?.status !== 'complete')
              })
              const currentModule = currentModuleIdx >= 0 ? sortedModules[currentModuleIdx] : null
              // Next locked module = the one right after current
              const lockedModule = currentModule ? sortedModules[currentModuleIdx + 1] : null

              if (!lockedModule && !currentModule) return null
              if (!lockedModule) return null

              const lessonCount = (lessons ?? []).filter(l => l.module_id === lockedModule.id).length

              return (
                <div>
                  <p className="text-xs tracking-[0.2em] uppercase text-warm-500 mb-5">Your Next Module</p>
                  <div className="card overflow-hidden opacity-80">
                    <div className="p-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <h4 className="serif text-2xl text-warm-400 mb-2">{lockedModule.title}</h4>
                          {lockedModule.description && (
                            <p className="text-sm text-warm-600">{lockedModule.description}</p>
                          )}
                        </div>
                        <div className="ml-6 flex-shrink-0">
                          <svg className="w-6 h-6 text-warm-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-xs text-warm-600 tracking-wide">
                        {lessonCount} lessons · Complete <span className="text-warm-500">{currentModule?.title}</span> to unlock
                      </p>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Completion */}
            <div className="card p-8">
              <p className="text-xs tracking-[0.18em] uppercase text-warm-500 mb-5">Completion</p>
              <div className="text-6xl font-light text-gold-500 tabular-nums tracking-tight mb-1">{courseProgress.percentage}%</div>
              <p className="text-xs text-warm-500 tracking-wide">course progress</p>
            </div>

            {/* Lessons */}
            <div className="card p-8">
              <p className="text-xs tracking-[0.18em] uppercase text-warm-500 mb-5">Lessons</p>
              <div className="text-6xl font-light text-warm-100 tabular-nums tracking-tight mb-1">{courseProgress.completed}</div>
              <p className="text-xs text-warm-500 tracking-wide">of {courseProgress.total} completed</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
