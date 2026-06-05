import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'

export default async function AdminDashboardPage() {
  const supabase = createServiceClient()

  const [
    { count: totalStudents },
    { data: modules },
    { data: lessons },
    { data: progressRows },
    { data: recentStudents },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('modules').select('id, title, order_index').eq('is_published', true).order('order_index'),
    supabase.from('lessons').select('id, module_id').eq('is_published', true),
    supabase.from('student_progress').select('user_id, lesson_id, status'),
    supabase
      .from('users')
      .select('id, full_name, email, enrolled_at, access_expires_at')
      .eq('role', 'student')
      .order('enrolled_at', { ascending: false })
      .limit(8),
  ])

  const allLessons = lessons ?? []
  const allProgress = progressRows ?? []

  // Unique students who have any progress
  const activeStudentIds = new Set(allProgress.map(p => p.user_id))
  // Avg progress
  let avgProgress = 0
  if (totalStudents && totalStudents > 0 && allLessons.length > 0) {
    const completedPerUser: Record<string, number> = {}
    allProgress.filter(p => p.status === 'complete').forEach(p => {
      completedPerUser[p.user_id] = (completedPerUser[p.user_id] ?? 0) + 1
    })
    const totalPct = Object.values(completedPerUser).reduce(
      (sum, c) => sum + Math.min(100, Math.round((c / allLessons.length) * 100)),
      0
    )
    avgProgress = Math.round(totalPct / (Object.keys(completedPerUser).length || 1))
  }

  // Per-module completion
  const moduleStats = (modules ?? []).map(mod => {
    const modLessons = allLessons.filter(l => l.module_id === mod.id)
    if (modLessons.length === 0) return { ...mod, pct: 0 }
    const lessonIds = new Set(modLessons.map(l => l.id))
    const completed = allProgress.filter(
      p => p.status === 'complete' && lessonIds.has(p.lesson_id)
    ).length
    const total = modLessons.length * (totalStudents ?? 1)
    return { ...mod, pct: total > 0 ? Math.round((completed / total) * 100) : 0 }
  })

  const stats = [
    { label: 'Total Students', value: totalStudents ?? 0, sub: 'enrolled accounts' },
    { label: 'Active Students', value: activeStudentIds.size, sub: 'have started the course' },
    { label: 'Avg. Progress', value: `${avgProgress}%`, sub: 'across all students' },
    { label: 'Total Lessons', value: allLessons.length, sub: `across ${modules?.length ?? 0} modules` },
  ]

  return (
    <div className="px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of FaceSculpt™ platform activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-6 py-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Module completion */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">Module Completion</h2>
          <div className="space-y-4">
            {moduleStats.map(mod => (
              <div key={mod.id}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-600 truncate">{mod.title}</span>
                  <span className="text-gray-400 ml-2 flex-shrink-0">{mod.pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${mod.pct}%` }}
                  />
                </div>
              </div>
            ))}
            {moduleStats.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No modules published yet</p>
            )}
          </div>
        </div>

        {/* Recent students */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-900">Recent Students</h2>
            <Link href="/admin/students" className="text-xs text-indigo-600 hover:text-indigo-700">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {(recentStudents ?? []).map(s => (
              <Link
                key={s.id}
                href={`/admin/students/${s.id}`}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors -mx-2"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold flex-shrink-0">
                  {s.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{s.full_name}</p>
                  <p className="text-xs text-gray-400 truncate">{s.email}</p>
                </div>
                <p className="text-xs text-gray-400 flex-shrink-0">
                  {s.enrolled_at
                    ? new Date(s.enrolled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                    : '—'}
                </p>
              </Link>
            ))}
            {(recentStudents ?? []).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No students yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
