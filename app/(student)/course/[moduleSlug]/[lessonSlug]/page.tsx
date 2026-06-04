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
    <div className="min-h-screen bg-stone-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
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
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-sm text-stone-600 bg-stone-50 border-t border-stone-100">
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
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
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
  )
}
