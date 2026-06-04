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

  const lessonIcons: Record<string, string> = {
    video: '🎬',
    theory: '📖',
    quiz: '✓',
    download: '📥',
    info: 'ℹ️',
  }

  // Calculate overall progress
  const totalLessons = lessons.length
  const completedLessons = lessons.filter(l => progress[l.id]?.status === 'complete').length
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Progress Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="font-bold text-stone-900 mb-4">Course Content</h3>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-stone-600">Overall Progress</span>
            <span className="text-lg font-bold text-emerald-600">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="text-xs text-stone-600 text-center">
          {completedLessons} of {totalLessons} lessons
        </div>
      </div>

      {/* Modules List */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {modules.map((mod, idx) => {
          const isExpanded = expandedModules.has(mod.id)
          const moduleLessons = lessons.filter(l => l.module_id === mod.id)

          return (
            <div key={mod.id} className={idx > 0 ? 'border-t border-stone-200' : ''}>
              {/* Module Header */}
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full px-6 py-4 hover:bg-stone-50 transition-colors flex items-center justify-between text-left"
              >
                <div className="flex-1">
                  <h4 className="font-bold text-stone-900 text-sm">{mod.title}</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    {moduleLessons.filter(l => progress[l.id]?.status === 'complete').length}/{moduleLessons.length}
                  </p>
                </div>
                <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {/* Module Lessons */}
              {isExpanded && (
                <div className="bg-stone-50 divide-y divide-stone-200">
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
                        className={`block px-6 py-3 text-sm transition-colors ${
                          isActive
                            ? 'bg-white border-l-4 border-emerald-600 text-emerald-600 font-semibold'
                            : 'hover:bg-white text-stone-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={isComplete ? 'text-emerald-600' : 'text-stone-400'}>
                            {isComplete ? '✓' : '○'}
                          </span>
                          <span className="flex-1 truncate">{lesson.title}</span>
                          <span className="text-xs opacity-60">{lessonIcons[lesson.type]}</span>
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

      {/* Bottom Buttons */}
      <div className="space-y-2">
        <button className="w-full px-4 py-3 text-stone-700 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors text-sm font-medium">
          ← Prev Lesson
        </button>
        <button className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
          Next →
        </button>
      </div>
    </div>
  )
}
