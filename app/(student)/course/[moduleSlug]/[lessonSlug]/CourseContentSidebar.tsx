'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { DbModule, DbLesson, DbProgress } from '@/types'
import { moduleSlug, lessonSlug } from '@/types'

interface CourseContentSidebarProps {
  modules: DbModule[]
  lessons: DbLesson[]
  progress: Record<string, DbProgress | undefined>
  currentModuleId: string
  currentLessonId: string
}

export default function CourseContentSidebar({
  modules,
  lessons,
  progress,
  currentModuleId,
  currentLessonId,
}: CourseContentSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set([currentModuleId]))

  const toggleModule = (id: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedModules(newExpanded)
  }

  // Calculate overall progress
  const totalLessons = lessons.length
  const completedLessons = lessons.filter(l => progress[l.id]?.status === 'complete').length
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <div className="space-y-4 lg:sticky lg:top-32">
      {/* Progress Card */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
        <h3 className="font-semibold text-zinc-50 mb-4">Course Content</h3>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-zinc-500">Overall Progress</span>
            <span className="text-lg font-bold text-emerald-400 tabular-nums">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="text-xs text-zinc-500 text-center">
          {completedLessons} of {totalLessons} lessons
        </div>
      </div>

      {/* Modules List */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        {modules.map((mod, idx) => {
          const isExpanded = expandedModules.has(mod.id)
          const moduleLessons = lessons.filter(l => l.module_id === mod.id)

          return (
            <div key={mod.id} className={idx > 0 ? 'border-t border-zinc-800' : ''}>
              {/* Module Header */}
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full px-5 py-4 hover:bg-zinc-800/40 transition-colors flex items-center justify-between text-left"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-zinc-100 text-sm">{mod.title}</h4>
                  <p className="text-xs text-zinc-500 mt-1 tabular-nums">
                    {moduleLessons.filter(l => progress[l.id]?.status === 'complete').length}/{moduleLessons.length}
                  </p>
                </div>
                <svg
                  className={`w-4 h-4 text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Module Lessons */}
              {isExpanded && (
                <div className="bg-zinc-950/40 divide-y divide-zinc-800/60">
                  {moduleLessons.map(lesson => {
                    const isActive = lesson.id === currentLessonId
                    const lessonProgress = progress[lesson.id]
                    const isComplete = lessonProgress?.status === 'complete'

                    return (
                      <Link
                        key={lesson.id}
                        href={`/course/${moduleSlug(mod.order_index)}/${lessonSlug(
                          mod.order_index,
                          lesson.order_index
                        )}`}
                        className={`block px-5 py-3 text-sm transition-colors ${
                          isActive
                            ? 'bg-zinc-900 border-l-2 border-emerald-400 text-emerald-400 font-medium'
                            : 'hover:bg-zinc-800/30 text-zinc-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isComplete ? (
                            <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                          ) : (
                            <span className="w-4 h-4 flex-shrink-0 rounded-full border border-zinc-600" />
                          )}
                          <span className="flex-1 truncate">{lesson.title}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
