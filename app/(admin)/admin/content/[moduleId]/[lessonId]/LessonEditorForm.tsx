'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DbLesson } from '@/types'

const TYPES = ['theory', 'video', 'quiz', 'download', 'info'] as const

export default function LessonEditorForm({ lesson }: { lesson: DbLesson; moduleId: string }) {
  const router = useRouter()
  const [title, setTitle] = useState(lesson.title)
  const [type, setType] = useState<string>(lesson.type)
  const [videoUrl, setVideoUrl] = useState(lesson.video_url ?? '')
  const [content, setContent] = useState(lesson.content_html ?? '')
  const [published, setPublished] = useState(lesson.is_published)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  async function save() {
    setSaving(true)
    await fetch(`/api/admin/lessons/${lesson.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        type,
        video_url: videoUrl || null,
        content_html: content || null,
        is_published: published,
      }),
    })
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Lesson Content</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Published</span>
            <button
              onClick={() => setPublished(!published)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${published ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${published ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
          {success && <span className="text-xs text-green-600">Saved ✓</span>}
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Lesson Type</label>
          <div className="flex gap-2 flex-wrap">
            {TYPES.map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
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

        {/* Video URL */}
        {type === 'video' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Vimeo Video URL or ID</label>
            <input
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://vimeo.com/123456789 or 123456789"
            />
            {videoUrl && (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-100">
                <iframe
                  src={`https://player.vimeo.com/video/${videoUrl.replace(/.*vimeo\.com\//, '').split('?')[0]}`}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        )}

        {/* Content HTML */}
        {(type === 'theory' || type === 'info') && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Lesson Content <span className="text-gray-400">(HTML supported)</span>
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={16}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
              placeholder="<h2>Lesson Title</h2><p>Content goes here...</p>"
            />
            {content && (
              <details className="mt-3">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">Preview rendered content</summary>
                <div
                  className="mt-2 p-4 border border-gray-100 rounded-lg text-sm prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </details>
            )}
          </div>
        )}

        {type === 'download' && (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
            <p className="text-sm text-gray-500">Downloads are managed via lesson_resources in Supabase.</p>
            <p className="text-xs text-gray-400 mt-1">Add rows to the lesson_resources table with this lesson ID.</p>
          </div>
        )}
      </div>
    </div>
  )
}
