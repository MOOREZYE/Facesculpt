'use client'

import { useState, useEffect, useRef } from 'react'

interface LessonNotesProps {
  lessonId: string
  userId: string
}

export default function LessonNotes({ lessonId, userId }: LessonNotesProps) {
  const [content, setContent] = useState('')
  const [saved, setSaved] = useState(true)
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Load existing note on mount
  useEffect(() => {
    async function loadNote() {
      const res = await fetch(
        `${url}/rest/v1/lesson_notes?user_id=eq.${userId}&lesson_id=eq.${lessonId}&select=content`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
        }
      )
      const rows = await res.json()
      if (rows?.[0]?.content !== undefined) {
        setContent(rows[0].content)
      }
    }
    loadNote()
  }, [lessonId, userId, url, key])

  function handleChange(val: string) {
    setContent(val)
    setSaved(false)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSaving(true)
      await fetch(`${url}/rest/v1/lesson_notes`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({ user_id: userId, lesson_id: lessonId, content: val }),
      })
      setSaving(false)
      setSaved(true)
    }, 800)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-warm-600 tracking-wide">
          Private notes — only visible to you
        </p>
        <span className={`text-xs transition-colors ${saving ? 'text-gold-500' : saved && content ? 'text-warm-700' : ''}`}>
          {saving ? 'Saving…' : saved && content ? 'Saved' : ''}
        </span>
      </div>

      <textarea
        value={content}
        onChange={e => handleChange(e.target.value)}
        placeholder="Write your notes here…"
        rows={12}
        className="w-full rounded-lg text-sm text-warm-200 placeholder-warm-700 resize-none focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-colors leading-relaxed p-5 font-inter"
        style={{
          background: '#111009',
          border: '1px solid #2A2420',
          fontFamily: 'var(--font-inter)',
        }}
      />

      <p className="text-xs text-warm-700">Notes are private and auto-save as you type.</p>
    </div>
  )
}
