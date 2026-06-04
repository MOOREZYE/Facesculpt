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
    <div className="space-y-4 lg:sticky lg:top-24">
      {/* Progress */}
      <div className="card p-6">
        <p className="text-xs tracking-[0.18em] uppercase text-warm-600 mb-5">Course Content</p>
        <div className="flex justify-between items-end mb-3">
          <span className="text-xs text-warm-500">{completedLessons} of {totalLessons} lessons</span>
          <span className="text-gold-500 tabular-nums font-light">{progressPercent}%</span>
        </div>
        <div className="w-full h-px bg-warm-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Modules List */}
      <div className="card overflow-hidden">
        {modules.map((mod, idx) => {
          const isExpanded = expandedModules.has(mod.id)
          const moduleLessons = lessons.filter(l => l.module_id === mod.id)
          const completedInModule = moduleLessons.filter(l => progress[l.id]?.status === 'complete').length

          return (
            <div key={mod.id} className={idx > 0 ? 'border-t border-warm-800' : ''}>
              {/* Module Header */}
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full px-5 py-4 hover:bg-warm-800/20 transition-colors flex items-center justify-between text-left"
              >
                <div className="flex-1">
                  <p className="text-sm text-warm-200">{mod.title}</p>
                  <p className="text-xs text-warm-600 mt-0.5 tabular-nums">
                    {completedInModule}/{moduleLessons.length}
                  </p>
                </div>
                <svg
                  className={`w-3.5 h-3.5 text-warm-600 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Module Lessons */}
              {isExpanded && (
                <div className="divide-y divide-warm-800/60" style={{background:'#111009'}}>
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
                        className={`block px-5 py-3.5 text-xs transition-colors ${
                          isActive
                            ? 'border-l-2 border-gold-500 text-gold-500 pl-4'
                            : 'hover:bg-warm-800/20 text-warm-500'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isComplete ? (
                            <svg className="w-3 h-3 text-gold-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                          ) : (
                            <span className="w-3 h-3 flex-shrink-0 rounded-full border border-warm-700" />
                          )}
                          <span className="flex-1 truncate leading-relaxed">{lesson.title}</span>
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
