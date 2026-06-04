import Link from 'next/link'
import type { DbModule, DbLesson } from '@/types'

export default function ResumeButton({
  module,
  lesson,
  moduleSlug,
  lessonSlug,
}: {
  module: DbModule
  lesson: DbLesson
  moduleSlug: string
  lessonSlug: string
}) {
  return (
    <Link href={`/course/${moduleSlug}/${lessonSlug}`}>
      <div className="group relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 rounded-3xl p-8 md:p-10 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-40 -mt-40 group-hover:scale-110 transition-transform duration-300"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -ml-32 -mb-32"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wide mb-2">
                ⏯️ Continue Learning
              </p>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:translate-x-1 transition-transform">
                {module.title}
              </h3>
              <p className="text-emerald-50 text-lg">{lesson.title}</p>
            </div>
            <button className="ml-4 px-6 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-colors shadow-lg">
              Resume
            </button>
          </div>

          {/* Progress indicator */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-sm text-emerald-100">
              Pick up where you left off and continue your certification journey
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
