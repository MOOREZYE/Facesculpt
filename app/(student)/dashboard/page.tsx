import { redirect } from 'next/navigation'
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
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-900/50 border-r border-zinc-800 fixed left-0 top-0 h-screen p-6 z-40">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
            FS
          </div>
          <div>
            <h1 className="font-semibold text-sm text-zinc-50">FaceSculpt™</h1>
            <p className="text-xs text-zinc-500">Training Platform</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-zinc-800 text-zinc-50 font-medium text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
            Dashboard
          </a>
          <a
            href="/course"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 font-medium text-sm transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
            Course
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 font-medium text-sm transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
            Profile
          </a>
        </nav>

        <div className="space-y-2 pt-6 border-t border-zinc-800">
          <button className="w-full px-4 py-2.5 bg-emerald-500 text-zinc-950 rounded-lg font-semibold text-sm hover:bg-emerald-400 transition-colors">
            Get Support
          </button>
          <button className="w-full px-4 py-2.5 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-8 md:pt-12 px-4 md:px-10 pb-16">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-50 mb-3 tracking-tight">
              Welcome back, {firstName}.
            </h1>
            <p className="text-zinc-400 text-lg">
              You&apos;re {courseProgress.percentage}% through your FaceSculpt™ certification.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-4 mt-4 md:mt-0 bg-zinc-900 py-2.5 px-4 rounded-full border border-zinc-800">
            <div className="text-right">
              <div className="text-sm font-medium text-zinc-100">{nextLesson?.module.title || 'Modules'}</div>
              <div className="text-xs text-zinc-500">Module {modules?.length || 0} of 8</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* UP NEXT Card */}
            {nextLesson && (
              <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="text-xs font-semibold uppercase tracking-[0.1em] text-emerald-400 mb-3">
                      Up Next
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-50 mb-2">{nextLesson.lesson.title}</h3>
                    <p className="text-zinc-400 text-sm capitalize">
                      {nextLesson.lesson.type} lesson
                    </p>
                  </div>
                  <a
                    href={`/course/${moduleSlug(nextLesson.module.order_index)}/${lessonSlug(
                      nextLesson.module.order_index,
                      nextLesson.lesson.order_index
                    )}`}
                    className="px-6 py-3 bg-emerald-500 text-zinc-950 rounded-xl font-semibold hover:bg-emerald-400 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    Resume Learning
                  </a>
                </div>
              </div>
            )}

            {/* Overall Progress */}
            <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <h3 className="text-xl font-semibold text-zinc-50">Your Progress</h3>
                  <p className="text-sm text-zinc-500 mt-1">FaceSculpt™ Certification</p>
                </div>
                <span className="text-4xl font-bold text-emerald-400 tabular-nums">{courseProgress.percentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${courseProgress.percentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-4 text-sm text-zinc-500">
                <span>{courseProgress.completed} of {courseProgress.total} lessons completed</span>
                <span>Est. {Math.max(1, Math.ceil((courseProgress.total - courseProgress.completed) * 0.5))} hours left</span>
              </div>
            </div>

            {/* Next Module */}
            {(() => {
              const sortedModules = (modules ?? []).sort((a, b) => a.order_index - b.order_index)
              // Find the first incomplete module
              const nextModule = sortedModules.find(m => {
                const mLessons = (lessons ?? []).filter(l => l.module_id === m.id && l.is_published)
                return mLessons.some(l => progress[l.id]?.status !== 'complete')
              })
              // The module before nextModule is the "current in progress" one
              const currentModuleIndex = nextModule ? sortedModules.indexOf(nextModule) : -1
              const prevModule = currentModuleIndex > 0 ? sortedModules[currentModuleIndex - 1] : null
              // Locked = nextModule is not the first module
              const isLocked = currentModuleIndex > 0

              if (!nextModule) return (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-50">All modules complete</h3>
                  <p className="text-zinc-400 text-sm mt-1">You&apos;ve completed the full course</p>
                </div>
              )

              const moduleLessons = (lessons ?? []).filter(l => l.module_id === nextModule.id)
              const moduleProgressData = moduleLessons.filter(l => progress[l.id]?.status === 'complete').length

              return (
                <div>
                  <h3 className="text-xl font-semibold text-zinc-50 mb-5">Your Next Module</h3>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                    {/* Lock banner */}
                    {isLocked && prevModule && (
                      <div className="flex items-center gap-3 px-6 py-3 bg-zinc-800/60 border-b border-zinc-800">
                        <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                        <p className="text-sm text-zinc-400">
                          Complete <span className="text-zinc-200 font-medium">{prevModule.title}</span> to unlock
                        </p>
                      </div>
                    )}
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h4 className="text-xl font-bold text-zinc-50">{nextModule.title}</h4>
                          {nextModule.description && (
                            <p className="text-sm text-zinc-500 mt-1">{nextModule.description}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm font-semibold text-zinc-300 tabular-nums">
                            {moduleProgressData}/{moduleLessons.length}
                          </div>
                          <div className="text-xs text-zinc-500">lessons</div>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-6">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${moduleLessons.length > 0 ? Math.round((moduleProgressData / moduleLessons.length) * 100) : 0}%` }}
                        />
                      </div>
                      {!isLocked && (
                        <a
                          href={`/course/${moduleSlug(nextModule.order_index)}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-zinc-950 rounded-xl font-semibold text-sm hover:bg-emerald-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          Continue Module
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Cards */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="text-sm text-zinc-500 mb-2">Completion Rate</div>
              <div className="text-5xl font-bold text-emerald-400 tabular-nums">{courseProgress.percentage}%</div>
              <div className="text-sm text-zinc-500 mt-2">Course Progress</div>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <div className="text-sm text-zinc-500 mb-2">Lessons Completed</div>
              <div className="text-5xl font-bold text-zinc-50 tabular-nums">{courseProgress.completed}</div>
              <div className="text-sm text-zinc-500 mt-2">out of {courseProgress.total}</div>
            </div>

            {/* Access Expiry */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <h4 className="font-semibold text-zinc-50 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Access Expiry
              </h4>
              {expiresAt ? (
                <div className="text-center">
                  <div className="text-3xl font-bold text-zinc-50 tabular-nums">
                    {daysUntilExpiry !== null && daysUntilExpiry > 0 ? daysUntilExpiry : 'Expired'}
                  </div>
                  <div className="text-sm text-zinc-500 mt-2">
                    {expiresAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-400">Lifetime access</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
