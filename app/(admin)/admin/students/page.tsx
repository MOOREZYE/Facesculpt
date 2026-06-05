import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'

type StudentRow = { id: string; full_name: string | null; email: string; enrolled_at: string | null; access_expires_at: string | null; role: string }
type ProgRow = { user_id: string; lesson_id: string; status: string }

export default async function StudentsPage() {
  const supabase = createServiceClient()

  const { data: students } = (await supabase
    .from('users')
    .select('id, full_name, email, enrolled_at, access_expires_at, role')
    .eq('role', 'student')
    .order('enrolled_at', { ascending: false })) as { data: StudentRow[] | null }
  const { data: allLessons } = (await supabase.from('lessons').select('id').eq('is_published', true)) as { data: { id: string }[] | null }
  const { data: progress } = (await supabase.from('student_progress').select('user_id, lesson_id, status')) as { data: ProgRow[] | null }

  const totalLessons = (allLessons ?? []).length
  const progressMap: Record<string, number> = {}
  ;(progress ?? []).forEach(p => {
    if (p.status === 'complete') {
      progressMap[p.user_id] = (progressMap[p.user_id] ?? 0) + 1
    }
  })

  const studentsWithProgress = (students ?? []).map(s => ({
    ...s,
    completed: progressMap[s.id] ?? 0,
    pct: totalLessons > 0 ? Math.round(((progressMap[s.id] ?? 0) / totalLessons) * 100) : 0,
    expired: s.access_expires_at ? new Date(s.access_expires_at) < new Date() : false,
  }))

  return (
    <div className="px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-1">{studentsWithProgress.length} enrolled</p>
        </div>
        <Link
          href="/admin/students/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Student
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Enrolled</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Progress</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Access</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {studentsWithProgress.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold flex-shrink-0">
                      {s.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{s.full_name || '—'}</p>
                      <p className="text-gray-500 text-xs">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {s.enrolled_at
                    ? new Date(s.enrolled_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-28 h-1.5 bg-gray-100 rounded-full">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 tabular-nums w-8">{s.pct}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {s.access_expires_at ? (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      s.expired
                        ? 'bg-red-50 text-red-700'
                        : 'bg-green-50 text-green-700'
                    }`}>
                      {s.expired ? 'Expired' : `Until ${new Date(s.access_expires_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">Lifetime</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/students/${s.id}`}
                    className="text-indigo-600 hover:text-indigo-700 text-xs font-medium"
                  >
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
            {studentsWithProgress.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                  No students enrolled yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
