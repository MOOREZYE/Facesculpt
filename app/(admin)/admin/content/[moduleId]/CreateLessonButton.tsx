'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TYPES = ['theory', 'video', 'quiz', 'download', 'info'] as const

export default function CreateLessonButton({ moduleId, nextIndex }: { moduleId: string; nextIndex: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<typeof TYPES[number]>('theory')
  const [loading, setLoading] = useState(false)

  async function create() {
    if (!title.trim()) return
    setLoading(true)
    const res = await fetch('/api/admin/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module_id: moduleId, title, type, order_index: nextIndex }),
    })
    const data = await res.json()
    setLoading(false)
    setOpen(false)
    setTitle('')
    // Navigate directly to lesson editor
    router.push(`/admin/content/${moduleId}/${data.id}`)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Lesson
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">New Lesson</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. The three layers of skin"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="grid grid-cols-5 gap-2">
                  {TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`px-2 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                        type === t
                          ? 'bg-indigo-600 text-white'
                          : 'border border-gray-200 text-gray-600 hover:border-indigo-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setOpen(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
              <button
                onClick={create}
                disabled={loading || !title.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Creating…' : 'Create & Edit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
