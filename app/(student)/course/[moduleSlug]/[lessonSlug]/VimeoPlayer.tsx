'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Player from '@vimeo/player'
import { parseVimeoId, parseVimeoHash } from '@/lib/vimeo'

const COMPLETE_THRESHOLD = 0.8 // 80% watched marks the lesson complete

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
  const [maxPercent, setMaxPercent] = useState(alreadyComplete ? 1 : 0)
  const [justCompleted, setJustCompleted] = useState(false)

  const videoId = parseVimeoId(videoUrl)
  const videoHash = parseVimeoHash(videoUrl)

  useEffect(() => {
    if (!containerRef.current || !videoId) return

    const player = new Player(containerRef.current, {
      id: Number(videoId),
      ...(videoHash ? { h: videoHash } : {}),
      width: 1280, // fixed intrinsic size; CSS stretches the iframe to fill
      dnt: true,
    })

    async function markComplete() {
      if (completedRef.current) return
      completedRef.current = true
      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId, status: 'complete' }),
        })
        setJustCompleted(true)
        onComplete?.()
        router.refresh()
      } catch {
        completedRef.current = false // allow retry on next tick
      }
    }

    const onTimeUpdate = (data: { percent: number }) => {
      setMaxPercent(prev => (data.percent > prev ? data.percent : prev))
      if (data.percent >= COMPLETE_THRESHOLD) markComplete()
    }
    const onEnded = () => markComplete()

    player.on('timeupdate', onTimeUpdate)
    player.on('ended', onEnded)

    return () => {
      player.off('timeupdate', onTimeUpdate)
      player.off('ended', onEnded)
      player.destroy().catch(() => {})
    }
  }, [videoId, videoHash, lessonId, router])

  if (!videoId) {
    return (
      <div className="aspect-video bg-black flex items-center justify-center text-center border-b border-warm-800">
        <p className="text-warm-500 text-sm px-6">
          This video isn&apos;t configured yet. (Invalid Vimeo URL)
        </p>
      </div>
    )
  }

  const pct = Math.min(100, Math.round(maxPercent * 100))
  const done = completedRef.current || justCompleted || alreadyComplete

  return (
    <div>
      <div
        ref={containerRef}
        className="relative aspect-video bg-black overflow-hidden [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full"
      />
      {/* Watch-progress strip */}
      <div className="px-6 py-3 border-b border-warm-800 flex items-center gap-3" style={{ background: '#111009' }}>
        <div className="flex-1 h-1 bg-warm-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${done ? 'bg-gold-500' : 'bg-warm-500'}`}
            style={{ width: `${done ? 100 : pct}%` }}
          />
        </div>
        {done ? (
          <span className="text-xs text-gold-400 flex items-center gap-1 whitespace-nowrap">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
            Completed
          </span>
        ) : (
          <span className="text-xs text-warm-500 tabular-nums whitespace-nowrap">
            {pct}% watched · 80% to complete
          </span>
        )}
      </div>
    </div>
  )
}
