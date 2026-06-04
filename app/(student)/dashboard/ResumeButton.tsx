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
    <Link
      href={`/course/${moduleSlug}/${lessonSlug}`}
      className="block mb-12 bg-gradient-to-r from-stone-800 to-stone-700 rounded-2xl p-8 text-white hover:from-stone-700 hover:to-stone-600 transition-all group"
    >
      <p className="text-sm text-stone-300 mb-2">Continue where you left off</p>
      <h3 className="text-2xl font-bold mb-1 group-hover:translate-x-1 transition-transform">
        {module.title}
      </h3>
      <p className="text-stone-200">{lesson.title}</p>
    </Link>
  )
}
