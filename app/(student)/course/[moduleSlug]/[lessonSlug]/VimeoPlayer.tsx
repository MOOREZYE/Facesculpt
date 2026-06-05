'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Player from '@vimeo/player'
import { parseVimeoId, parseVimeoHash } from '@/lib/vimeo'

// Allowed forward jump (seconds) before it's treated as skipping.
// Covers normal timeupdate granularity without permitting real seeks.
const SKIP_TOLERANCE = 2

export default function VimeoPlayer({
  lessonId,
  videoUrl,
  alreadyComplete,
  onComplete,
}: {
  lessonId: string
  videoUrl: string
  alreadyComplete: boolean
  onComplete?: () => void
}) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  const completedRef = useRef(alreadyComplete)
  const maxWatchedRef = useRef(0)   // furthest point reached by real playback
  const durationRef = useRef(0)
  const revertingRef = useRef(false)

  const [percent, setPercent] = useState(alreadyComplete ? 100 : 0)
  const [completed, setCompleted] = useState(alreadyComplete)
  const [cheating, setCheating] = useState(false)

  const videoId = parseVimeoId(videoUrl)
  const videoHash = parseVimeoHash(videoUrl)

  useEffect(() => {
    if (!containerRef.current || !videoId) return

    const player = new Player(containerRef.current, {
      id: Number(videoId),
      ...(videoHash ? { h: videoHash } : {}),
      responsive: true, // sizes the player to the video's real aspect ratio
      dnt: true,
    })

    player.getDuration().then(d => { durationRef.current = d }).catch(() => {})

    async function markComplete() {
      if (completedRef.current) return
      completedRef.current = true
      setCompleted(true)
      setPercent(100)
      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId, status: 'complete' }),
        })
        onComplete?.()
        router.refresh()
      } catch {
        completedRef.current = false
      }
    }

    let cheatTimer: ReturnType<typeof setTimeout> | null = null
    function warnCheating() {
      setCheating(true)
      if (cheatTimer) clearTimeout(cheatTimer)
      cheatTimer = setTimeout(() => setCheating(false), 2500)
    }

    const onTimeUpdate = (data: { seconds: number; duration: number; percent: number }) => {
      durationRef.current = data.duration || durationRef.current
      if (revertingRef.current) return

      const t = data.seconds
      const max = maxWatchedRef.current

      // Forward jump beyond what's been watched = skipping (unless already done)
      if (!completedRef.current && !alreadyComplete && t > max + SKIP_TOLERANCE) {
        revertingRef.current = true
        warnCheating()
        player.setCurrentTime(max).catch(() => {}).finally(() => {
          // small delay so the resulting timeupdate isn't re-flagged
          setTimeout(() => { revertingRef.current = false }, 300)
        })
        return
      }

      // Legit playback (or rewatching) — advance the watched marker
      maxWatchedRef.current = Math.max(max, t)
      const d = durationRef.current
      if (d > 0) setPercent(Math.min(100, Math.round((maxWatchedRef.current / d) * 100)))

      // 100% — must reach the very end
      if (d > 0 && maxWatchedRef.current >= d - 1) markComplete()
    }

    const onEnded = () => markComplete()

    player.on('timeupdate', onTimeUpdate)
    player.on('ended', onEnded)

    return () => {
      if (cheatTimer) clearTimeout(cheatTimer)
      player.off('timeupdate', onTimeUpdate)
      player.off('ended', onEnded)
      player.destroy().catch(() => {})
    }
  }, [videoId, videoHash, lessonId, router, alreadyComplete, onComplete])

  if (!videoId) {
    return (
      <div className="aspect-video bg-black flex items-center justify-center text-center border-b border-warm-800">
        <p className="text-warm-500 text-sm px-6">
          This video isn&apos;t configured yet. (Invalid Vimeo URL)
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Responsive player — matches the video's true aspect ratio (no bars) */}
      <div className="relative bg-black">
        <div ref={containerRef} />
        {cheating && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-red-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-lg">
              No cheating — watch the lesson
            </div>
          </div>
        )}
      </div>

      {/* Watch-progress strip */}
      <div className="px-6 py-3 border-b border-warm-800 flex items-center gap-3" style={{ background: '#111009' }}>
        <div className="flex-1 h-1 bg-warm-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${completed ? 'bg-gold-500' : 'bg-warm-500'}`}
            style={{ width: `${completed ? 100 : percent}%` }}
          />
        </div>
        {completed ? (
          <span className="text-xs text-gold-400 flex items-center gap-1 whitespace-nowrap">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
            Completed
          </span>
        ) : (
          <span className="text-xs text-warm-500 tabular-nums whitespace-nowrap">
            {percent}% watched · 100% to complete
          </span>
        )}
      </div>
    </div>
  )
}
