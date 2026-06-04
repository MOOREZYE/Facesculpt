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

  const lessonIcon: Record<string, string> = {
    theory: '📖',
    video: '🎬',
    quiz: '✓',
    download: '📥',
    info: 'ℹ️',
  }

  return (
    <div className="space-y-6">
      {/* Lesson Content Card */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {/* Video/Hero Area */}
        {lesson.type === 'video' ? (
          <div className="aspect-video bg-stone-900 flex items-center justify-center text-white text-center">
            <div>
              <div className="text-6xl mb-4">🎬</div>
              <p className="text-lg">Video Lesson</p>
              <p className="text-sm text-stone-400 mt-2">Vimeo embed will appear here when configured</p>
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-center">
            <div>
              <div className="text-6xl mb-4">{lessonIcon[lesson.type]}</div>
              <p className="text-lg font-semibold">{lesson.type === 'quiz' ? 'Quiz Lesson' : 'Theory Lesson'}</p>
            </div>
          </div>
        )}

        {/* Lesson Info */}
        <div className="p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{lessonIcon[lesson.type]}</span>
              <h1 className="text-3xl font-bold text-stone-900">{lesson.title}</h1>
            </div>
            <p className="text-stone-600">
              {lesson.type === 'video'
                ? 'Video Lesson • 12 mins'
                : lesson.type === 'quiz'
                  ? 'Quiz • 10 questions'
                  : 'Theory Lesson • Read at your pace'}
            </p>
          </div>

          {/* Instructor/Meta */}
          <div className="flex items-center justify-between pb-6 border-b border-stone-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                F
              </div>
              <div>
                <div className="font-medium text-stone-900">FaceSculpt™ Instructor</div>
                <div className="text-sm text-stone-600">Professional Beauty Training</div>
              </div>
            </div>
            <button className="px-4 py-2 text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50">
              ⭐ Save Lesson
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-stone-200">
            <div className="flex gap-8">
              {(['notes', 'resources', 'discussion'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-emerald-600 text-stone-900'
                      : 'border-transparent text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tab === 'notes' && '📝 Notes'}
                  {tab === 'resources' && '📎 Resources'}
                  {tab === 'discussion' && '💬 Discussion'}
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
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: lesson.content_html }}
                  />
                ) : (
                  <div className="bg-stone-50 rounded-lg p-6">
                    <p className="text-stone-600 text-center">No lesson content available yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="bg-stone-50 rounded-lg p-6 text-center text-stone-600">
                <p>Resources coming soon</p>
              </div>
            )}

            {activeTab === 'discussion' && (
              <div className="bg-stone-50 rounded-lg p-6 text-center text-stone-600">
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
            className="px-6 py-3 border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-2"
          >
            <span>←</span>
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
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 ml-auto"
          >
            Next
            <span>→</span>
          </Link>
        ) : (
          <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors ml-auto">
            Complete & Finish
          </button>
        )}
      </div>
    </div>
  )
}
