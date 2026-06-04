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
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        {/* Video/Hero Area */}
        {lesson.type === 'video' ? (
          <div className="aspect-video bg-black flex items-center justify-center text-center border-b border-zinc-800">
            <div>
              <svg className="w-16 h-16 mx-auto mb-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>
              <p className="text-zinc-300">Video Lesson</p>
              <p className="text-sm text-zinc-600 mt-2">Vimeo embed will appear here when configured</p>
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-zinc-950 flex items-center justify-center text-center border-b border-zinc-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/5" />
            <div className="relative">
              <svg className="w-16 h-16 mx-auto mb-4 text-emerald-400/60" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
              <p className="text-zinc-300 font-medium capitalize">{lesson.type} Lesson</p>
            </div>
          </div>
        )}

        {/* Lesson Info */}
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-zinc-50 mb-2">{lesson.title}</h1>
            <p className="text-zinc-500 text-sm">{metaLabel}</p>
          </div>

          {/* Instructor/Meta */}
          <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold">
                F
              </div>
              <div>
                <div className="font-medium text-zinc-100">FaceSculpt™ Instructor</div>
                <div className="text-sm text-zinc-500">Professional Beauty Training</div>
              </div>
            </div>
            <button className="px-4 py-2 text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
              Save Lesson
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-zinc-800">
            <div className="flex gap-8">
              {(['notes', 'resources', 'discussion'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-1 py-4 font-medium text-sm border-b-2 transition-colors capitalize ${
                    activeTab === tab
                      ? 'border-emerald-400 text-zinc-50'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'notes' && (
              <div className="space-y-4">
                {lesson.content_html ? (
                  <div
                    className="prose-dark max-w-none"
                    dangerouslySetInnerHTML={{ __html: lesson.content_html }}
                  />
                ) : (
                  <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-6">
                    <p className="text-zinc-500 text-center">No lesson content available yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-6 text-center text-zinc-500">
                <p>Resources coming soon</p>
              </div>
            )}

            {activeTab === 'discussion' && (
              <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-6 text-center text-zinc-500">
                <p>Discussion forum coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 justify-between">
        {prevLesson ? (
          <Link
            href={`/course/${prevLesson.moduleSlug}/${lessonSlug(
              module.order_index,
              prevLesson.lesson.order_index
            )}`}
            className="px-6 py-3 border border-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-900 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            Prev
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
            className="px-6 py-3 bg-emerald-500 text-zinc-950 rounded-xl font-semibold hover:bg-emerald-400 transition-colors flex items-center gap-2 ml-auto"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </Link>
        ) : (
          <button className="px-6 py-3 bg-emerald-500 text-zinc-950 rounded-xl font-semibold hover:bg-emerald-400 transition-colors ml-auto">
            Complete &amp; Finish
          </button>
        )}
      </div>
    </div>
  )
}
