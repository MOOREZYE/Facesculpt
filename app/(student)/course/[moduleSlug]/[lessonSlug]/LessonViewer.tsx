'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { DbLesson, DbModule, DbProgress } from '@/types'
import { lessonSlug } from '@/types'

interface LessonViewerProps {
  lesson: DbLesson
  module: DbModule
  userId: string
  currentProgress?: DbProgress
  prevLesson?: { lesson: DbLesson; moduleSlug: string } | null
  nextLesson?: { lesson: DbLesson; moduleSlug: string } | null
}

export default function LessonViewer({
  lesson,
  module,
  prevLesson,
  nextLesson,
}: LessonViewerProps) {
  const [activeTab, setActiveTab] = useState<'notes' | 'resources' | 'discussion'>('notes')

  const metaLabel =
    lesson.type === 'video'
      ? 'Video Lesson • 12 mins'
      : lesson.type === 'quiz'
        ? 'Quiz • 10 questions'
        : 'Theory Lesson • Read at your pace'

  return (
    <div className="space-y-6">
      {/* Lesson Content Card */}
      <div className="card overflow-hidden">
        {/* Video/Hero Area */}
        {lesson.type === 'video' ? (
          <div className="aspect-video bg-black flex items-center justify-center text-center border-b border-warm-800">
            <div>
              <svg className="w-16 h-16 mx-auto mb-4 text-warm-500" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>
              <p className="text-warm-300">Video Lesson</p>
              <p className="text-sm text-warm-500 mt-2">Vimeo embed will appear here when configured</p>
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-warm-950 flex items-center justify-center text-center border-b border-warm-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-gold-500/5" />
            <div className="relative">
              <svg className="w-16 h-16 mx-auto mb-4 text-gold-500/60" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
              <p className="text-warm-300 font-medium capitalize">{lesson.type} Lesson</p>
            </div>
          </div>
        )}

        {/* Lesson Info */}
        <div className="p-10">
          <div className="mb-8">
            <p className="text-xs tracking-[0.2em] uppercase text-warm-600 mb-3 capitalize">{lesson.type} lesson</p>
            <h1 className="serif text-4xl text-warm-50 mb-3 leading-snug">{lesson.title}</h1>
            <p className="text-warm-500 text-sm">{metaLabel}</p>
          </div>

          {/* Instructor/Meta */}
          <div className="flex items-center justify-between py-6 border-y border-warm-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 text-xs font-semibold tracking-wide">
                FS
              </div>
              <div>
                <div className="text-sm text-warm-200">FaceSculpt™ Instructor</div>
                <div className="text-xs text-warm-600 mt-0.5">Professional Beauty Training</div>
              </div>
            </div>
            <button className="px-4 py-2 text-warm-500 border border-warm-800 rounded-lg hover:border-gold-500/30 hover:text-gold-500 transition-colors text-xs tracking-wide flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
              Save
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-8 border-b border-warm-800">
            <div className="flex gap-8">
              {(['notes', 'resources', 'discussion'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm border-b-2 transition-colors capitalize tracking-wide ${
                    activeTab === tab
                      ? 'border-gold-500 text-warm-100'
                      : 'border-transparent text-warm-600 hover:text-warm-400'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === 'notes' && (
              <div className="space-y-4">
                {lesson.content_html ? (
                  <div
                    className="prose-warm max-w-none"
                    dangerouslySetInnerHTML={{ __html: lesson.content_html }}
                  />
                ) : (
                  <div className="border border-warm-800 rounded-lg p-8 text-center" style={{background:'#111009'}}>
                    <p className="text-warm-600 text-sm">No lesson content available yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="border border-warm-800 rounded-lg p-8 text-center text-warm-600 text-sm" style={{background:'#111009'}}>
                <p>Resources coming soon</p>
              </div>
            )}

            {activeTab === 'discussion' && (
              <div className="border border-warm-800 rounded-lg p-8 text-center text-warm-600 text-sm" style={{background:'#111009'}}>
                <p>Discussion forum coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 justify-between mt-2">
        {prevLesson ? (
          <Link
            href={`/course/${prevLesson.moduleSlug}/${lessonSlug(
              module.order_index,
              prevLesson.lesson.order_index
            )}`}
            className="px-6 py-3 border border-warm-800 text-warm-500 rounded-lg hover:border-warm-700 hover:text-warm-300 transition-colors flex items-center gap-2 text-sm tracking-wide"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            Previous
          </Link>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Link
            href={`/course/${nextLesson.moduleSlug}/${lessonSlug(
              module.order_index,
              nextLesson.lesson.order_index
            )}`}
            className="px-7 py-3 bg-gold-500 text-warm-950 rounded-lg font-semibold hover:bg-gold-400 transition-colors flex items-center gap-2 ml-auto text-sm tracking-wide"
          >
            Next Lesson
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </Link>
        ) : (
          <button className="px-7 py-3 bg-gold-500 text-warm-950 rounded-lg font-semibold hover:bg-gold-400 transition-colors ml-auto text-sm tracking-wide">
            Complete &amp; Finish
          </button>
        )}
      </div>
    </div>
  )
}
