import { redirect } from 'next/navigation'
import Logo from '@/components/Logo'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCourseProgress, isModuleLocked, moduleSlug, lessonSlug } from '@/lib'
import type { DbModule, DbLesson, DbProgress } from '@/types'

export default async function CoursePage() {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const { data: modules } = (await supabase
    .from('modules')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true })) as { data: DbModule[] | null }

  const { data: lessons } = (await supabase
    .from('lessons')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true })) as { data: DbLesson[] | null }

  const { data: progressData } = (await supabase
    .from('student_progress')
    .select('*')
    .eq('user_id', userData.user.id)) as { data: DbProgress[] | null }

  const progress: Record<string, DbProgress | undefined> = Object.fromEntries(
    (progressData ?? []).map(p => [p.lesson_id, p])
  )

  const allModules = modules ?? []
  const allLessons = lessons ?? []
  const courseProgress = getCourseProgress(allLessons, progress)

  return (
    <div className="min-h-screen bg-warm-950 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 h-screen z-40 p-8" style={{background:'linear-gradient(180deg,#111009 0%,#0D0B09 100%)',borderRight:'1px solid #2A2420'}}>
        <div className="mb-14">
          <Logo className="w-[120px] h-auto mb-3" />
          <p className="text-xs tracking-[0.18em] uppercase text-warm-600">Professional Training</p>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { href: '/dashboard', label: 'Dashboard', active: false },
            { href: '/course', label: 'Course', active: true },
            { href: '#', label: 'Profile', active: false },
          ].map(item => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                item.active
                  ? 'text-gold-500'
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

      {/* Main */}
      <main className="flex-1 md:ml-64 pt-12 md:pt-16 px-6 md:px-14 pb-24">
        <div className="mb-14">
          <p className="text-xs tracking-[0.2em] uppercase text-warm-500 mb-4">FaceSculpt™ Curriculum</p>
          <h1 className="serif text-5xl text-warm-50 mb-4 leading-none">The Course</h1>
          <div className="flex items-center gap-6">
            <p className="text-warm-500 text-sm">{courseProgress.completed} of {courseProgress.total} lessons complete</p>
            <div className="flex-1 max-w-xs h-px bg-warm-800">
              <div className="h-full bg-gold-500 transition-all" style={{width:`${courseProgress.percentage}%`}} />
            </div>
            <p className="text-gold-500 text-sm tabular-nums">{courseProgress.percentage}%</p>
          </div>
        </div>

        <div className="space-y-4">
          {allModules.map((mod, idx) => {
            const modLessons = allLessons.filter(l => l.module_id === mod.id)
            const completed = modLessons.filter(l => progress[l.id]?.status === 'complete').length
            const locked = isModuleLocked(mod, allModules, allLessons, progress)
            const isComplete = completed === modLessons.length && modLessons.length > 0
            const pct = modLessons.length > 0 ? Math.round((completed / modLessons.length) * 100) : 0

            // First incomplete lesson in module for direct link
            const firstIncomplete = modLessons.find(l => progress[l.id]?.status !== 'complete')
            const firstLesson = modLessons[0]
            const targetLesson = firstIncomplete ?? firstLesson

            return (
              <div
                key={mod.id}
                className={`card overflow-hidden transition-opacity ${locked ? 'opacity-50' : ''}`}
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Module number */}
                      <span className="text-xs tabular-nums text-warm-600 w-6 text-right flex-shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className={`serif text-xl ${locked ? 'text-warm-500' : 'text-warm-50'}`}>
                            {mod.title}
                          </h3>
                          {locked && (
                            <svg className="w-4 h-4 text-warm-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                          )}
                          {isComplete && (
                            <svg className="w-4 h-4 text-gold-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        {mod.description && (
                          <p className="text-warm-600 text-sm mt-1">{mod.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-6 flex-shrink-0">
                      <span className="text-xs text-warm-600 tabular-nums">{completed}/{modLessons.length}</span>
                      {!locked && targetLesson && (
                        <div className="mt-3">
                          <Link
                            href={`/course/${moduleSlug(mod.order_index)}/${lessonSlug(mod.order_index, targetLesson.order_index)}`}
                            className="text-xs text-gold-500 hover:text-gold-400 transition-colors tracking-wide"
                          >
                            {isComplete ? 'Review' : 'Continue'} →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="ml-10 mt-4">
                    <div className="w-full h-px bg-warm-800">
                      <div
                        className="h-full bg-gold-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
