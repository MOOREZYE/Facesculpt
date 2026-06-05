'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DbModule } from '@/types'

export default function ModuleEditForm({ mod }: { mod: DbModule }) {
  const router = useRouter()
  const [title, setTitle] = useState(mod.title)
  const [description, setDescription] = useState(mod.description ?? '')
  const [published, setPublished] = useState(mod.is_published)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  async function save() {
    setSaving(true)
    await fetch(`/api/admin/modules/${mod.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, is_published: published }),
    })
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
    router.refresh()
  }

  async function deleteModule() {
    if (!confirm('Delete this module and all its lessons? This cannot be undone.')) return
    await fetch(`/api/admin/modules/${mod.id}`, { method: 'DELETE' })
    router.push('/admin/content')
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Module Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Published</span>
            <button
              onClick={() => setPublished(!published)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${published ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${published ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          {success && <p className="text-xs text-green-600">Saved</p>}
          <button
            onClick={save}
            disabled={saving}
            className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Danger Zone</h3>
        <button
          onClick={deleteModule}
          className="w-full px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
        >
          Delete Module
        </button>
      </div>
    </div>
  )
}
