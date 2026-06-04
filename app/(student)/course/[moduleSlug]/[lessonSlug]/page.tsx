import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { parseModuleSlug, parseLessonSlug } from '@/lib'
import type { DbModule, DbLesson, DbProgress } from '@/types'
import LessonViewer from './LessonViewer'
import CourseContentSidebar from './CourseContentSidebar'

export default async function LessonPage({
  params,
}: {
  params: Promise<{ moduleSlug: string; lessonSlug: string }>
}) {
  const { moduleSlug: slugStr, lessonSlug: slugStr2 } = await params

  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  // Parse slugs to get indices
  const moduleIndex = parseModuleSlug(slugStr)
  const { lessonIndex } = parseLessonSlug(slugStr2)

  // Fetch modules and lessons
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

  const progress = Object.fromEntries((progressData ?? []).map(p => [p.lesson_id, p]))

  // Find current module and lesson
  const currentModule = (modules ?? []).find(m => m.order_index === moduleIndex)
  const currentLesson = (lessons ?? []).find(l => l.order_index === lessonIndex && l.module_id === currentModule?.id)

  if (!currentModule || !currentLesson) {
    redirect('/dashboard')
  }

  // Get next/prev lessons
  const moduleLessons = (lessons ?? []).filter(l => l.module_id === currentModule.id)
  const currentIndex = moduleLessons.findIndex(l => l.id === currentLesson.id)
  const prevLesson = currentIndex > 0 ? moduleLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < moduleLessons.length - 1 ? moduleLessons[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Left Sidebar Navigation */}
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
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 font-medium text-sm transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
            Dashboard
          </a>
          <a
            href="/course"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-zinc-800 text-zinc-50 font-medium text-sm"
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

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Breadcrumb only */}
        <div className="px-6 py-4 flex items-center gap-2 text-sm text-zinc-500 border-b border-zinc-800 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-40">
          <a href="/dashboard" className="hover:text-zinc-300 transition-colors">Dashboard</a>
          <span className="text-zinc-700">/</span>
          <a href={`/course/${slugStr}`} className="hover:text-zinc-300 transition-colors">{currentModule.title}</a>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-200">{currentLesson.title}</span>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Lesson Viewer */}
            <div className="lg:col-span-2">
              <LessonViewer
                lesson={currentLesson}
                module={currentModule}
                userId={userData.user.id}
                currentProgress={progress[currentLesson.id]}
                prevLesson={prevLesson ? { lesson: prevLesson, moduleSlug: slugStr } : null}
                nextLesson={nextLesson ? { lesson: nextLesson, moduleSlug: slugStr } : null}
              />
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              <CourseContentSidebar
                modules={modules ?? []}
                lessons={lessons ?? []}
                progress={progress}
                currentModuleId={currentModule.id}
                currentLessonId={currentLesson.id}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
