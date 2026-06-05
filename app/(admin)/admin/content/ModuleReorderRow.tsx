'use client'

import { useRouter } from 'next/navigation'
import type { DbModule } from '@/types'

export default function ModuleReorderRow({ module: mod, totalModules }: { module: DbModule; totalModules: number }) {
  const router = useRouter()

  async function move(dir: 'up' | 'down') {
    await fetch(`/api/admin/modules/${mod.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reorder: dir }),
    })
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-0.5">
      <button
        onClick={() => move('up')}
        disabled={mod.order_index === 1}
        className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors"
        aria-label="Move up"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>
      <button
        onClick={() => move('down')}
        disabled={mod.order_index === totalModules}
        className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors"
        aria-label="Move down"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
    </div>
  )
}
