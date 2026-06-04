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
    <div className="min-h-screen bg-stone-50 flex">
      {/* Left Sidebar Navigation */}
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
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-stone-600 hover:bg-stone-50 font-medium text-sm"
          >
            <span className="text-lg">📊</span>
            Dashboard
          </a>
          <a
            href="/course"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-stone-100 text-stone-900 font-medium text-sm"
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

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Top Navigation */}
        <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-lg font-bold text-stone-900">FaceSculpt™</h1>
              <nav className="hidden md:flex gap-8">
                <a href="/dashboard" className="text-sm text-stone-600 hover:text-stone-900">
                  Dashboard
                </a>
                <a href="/course" className="text-sm text-stone-600 hover:text-stone-900 font-medium border-b-2 border-emerald-600">
                  Courses
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search..."
                className="hidden lg:block px-4 py-2 bg-stone-100 rounded-lg text-sm placeholder-stone-500 border border-stone-200"
              />
              <button className="text-stone-600 hover:text-stone-900">🔔</button>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="px-6 py-3 flex items-center gap-2 text-sm text-stone-600 bg-stone-50 border-t border-stone-100">
            <a href="/course" className="hover:text-stone-900">
              Courses
            </a>
            <span>/</span>
            <a href={`/course/${slugStr}`} className="hover:text-stone-900">
              {currentModule.title}
            </a>
            <span>/</span>
            <span className="text-stone-900">{currentLesson.title}</span>
          </div>
        </header>

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
