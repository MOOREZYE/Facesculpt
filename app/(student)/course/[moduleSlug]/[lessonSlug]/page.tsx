import { redirect } from 'next/navigation'
import Logo from '@/components/Logo'
import { createClient } from '@/lib/supabase/server'
import { parseModuleSlug, parseLessonSlug, isModuleLocked, isLessonLocked } from '@/lib'
import type { DbModule, DbLesson, DbProgress } from '@/types'
import LessonViewer from './LessonViewer'
import CourseContentSidebar from './CourseContentSidebar'

export type QuizClientData = {
  passMark: number
  questions: { id: string; text: string; options: { id: string; text: string }[] }[]
}

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

  // ── Access enforcement ────────────────────────────────────────
  // Block access if the module or lesson is locked
  if (isModuleLocked(currentModule, modules ?? [], lessons ?? [], progress)) {
    redirect('/dashboard')
  }
  const moduleLessonsForLock = (lessons ?? []).filter(l => l.module_id === currentModule.id)
  if (isLessonLocked(currentLesson, moduleLessonsForLock, progress)) {
    // Redirect to the first incomplete lesson in this module instead
    const firstIncomplete = moduleLessonsForLock
      .sort((a, b) => a.order_index - b.order_index)
      .find(l => progress[l.id]?.status !== 'complete')
    if (firstIncomplete) {
      redirect(`/course/${slugStr}/${slugStr2.replace(/lesson-\d+-\d+/, `lesson-${String(currentModule.order_index).padStart(2,'0')}-${String(firstIncomplete.order_index).padStart(2,'0')}`)}`)
    }
    redirect('/dashboard')
  }

  // Get next/prev lessons
  const moduleLessons = (lessons ?? []).filter(l => l.module_id === currentModule.id)
  const currentIndex = moduleLessons.findIndex(l => l.id === currentLesson.id)
  const prevLesson = currentIndex > 0 ? moduleLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < moduleLessons.length - 1 ? moduleLessons[currentIndex + 1] : null

  // If this is a quiz lesson, load its questions + options (WITHOUT is_correct)
  let quizData: QuizClientData | null = null
  if (currentLesson.type === 'quiz') {
    const { data: quiz } = (await supabase
      .from('quizzes')
      .select('id, pass_mark')
      .eq('lesson_id', currentLesson.id)
      .maybeSingle()) as { data: { id: string; pass_mark: number } | null }

    if (quiz) {
      const { data: questions } = (await supabase
        .from('quiz_questions')
        .select('id, question_text, order_index')
        .eq('quiz_id', quiz.id)
        .order('order_index')) as { data: { id: string; question_text: string; order_index: number }[] | null }

      const { data: options } = (await supabase
        .from('quiz_options')
        .select('id, question_id, option_text, order_index')
        .in('question_id', (questions ?? []).map(q => q.id))
        .order('order_index')) as { data: { id: string; question_id: string; option_text: string; order_index: number }[] | null }

      quizData = {
        passMark: quiz.pass_mark,
        questions: (questions ?? []).map(q => ({
          id: q.id,
          text: q.question_text,
          options: (options ?? [])
            .filter(o => o.question_id === q.id)
            .map(o => ({ id: o.id, text: o.option_text })),
        })),
      }
    }
  }

  return (
    <div className="min-h-screen bg-warm-950 flex">
      {/* Left Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 h-screen z-40 p-8" style={{background:'linear-gradient(180deg,#111009 0%,#0D0B09 100%)',borderRight:'1px solid #2A2420'}}>
        <div className="mb-14">
          <Logo className="w-[150px] h-auto mb-3" />
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

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Breadcrumb only */}
        <div className="px-6 py-4 flex items-center gap-2 text-sm text-warm-500 border-b border-warm-700 sticky top-0 bg-warm-950/90 backdrop-blur-sm z-40">
          <a href="/dashboard" className="hover:text-warm-300 transition-colors">Dashboard</a>
          <span className="text-zinc-700">/</span>
          <a href={`/course/${slugStr}`} className="hover:text-warm-300 transition-colors">{currentModule.title}</a>
          <span className="text-zinc-700">/</span>
          <span className="text-warm-200">{currentLesson.title}</span>
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
                quiz={quizData}
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
