'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { DbLesson } from '@/types'

export default function LessonRow({
  lesson,
  moduleId,
  isFirst,
  isLast,
}: {
  lesson: DbLesson
  moduleId: string
  isFirst: boolean
  isLast: boolean
}) {
  const router = useRouter()

  async function move(dir: 'up' | 'down') {
    await fetch(`/api/admin/lessons/${lesson.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reorder: dir }),
    })
    router.refresh()
  }

  async function deleteLesson() {
    if (!confirm('Delete this lesson?')) return
    await fetch(`/api/admin/lessons/${lesson.id}`, { method: 'DELETE' })
    router.refresh()
  }

  const typeBadge: Record<string, string> = {
    video: 'bg-purple-50 text-purple-700',
    quiz: 'bg-amber-50 text-amber-700',
    theory: 'bg-blue-50 text-blue-700',
    download: 'bg-teal-50 text-teal-700',
    info: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 flex items-center gap-3 px-5 py-3.5">
      {/* Reorder */}
      <div className="flex flex-col gap-0.5">
        <button onClick={() => move('up')} disabled={isFirst} className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
        </button>
        <button onClick={() => move('down')} disabled={isLast} className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </button>
      </div>

      <span className="text-xs font-mono text-gray-300 w-5">{String(lesson.order_index).padStart(2, '0')}</span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{lesson.title}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${typeBadge[lesson.type] ?? 'bg-gray-100 text-gray-500'}`}>
          {lesson.type}
        </span>
        {!lesson.is_published && (
          <span className="text-xs text-gray-400">Draft</span>
        )}
        <Link
          href={`/admin/content/${moduleId}/${lesson.id}`}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium ml-1"
        >
          Edit
        </Link>
        <button
          onClick={deleteLesson}
          className="text-xs text-red-400 hover:text-red-600 ml-1"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
