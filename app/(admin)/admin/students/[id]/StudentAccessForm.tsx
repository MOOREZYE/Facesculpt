'use client'

import { useState } from 'react'
import type { DbUser } from '@/types'

export default function StudentAccessForm({ student }: { student: DbUser }) {
  const [expiresAt, setExpiresAt] = useState(
    student.access_expires_at
      ? new Date(student.access_expires_at).toISOString().split('T')[0]
      : ''
  )
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function saveAccess() {
    setSaving(true)
    setError('')
    setSuccess(false)
    const res = await fetch(`/api/admin/students/${student.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_expires_at: expiresAt || null }),
    })
    setSaving(false)
    if (res.ok) setSuccess(true)
    else setError('Failed to save')
  }

  async function revokeAccess() {
    if (!confirm('Revoke this student\'s access immediately?')) return
    setSaving(true)
    await fetch(`/api/admin/students/${student.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_expires_at: new Date(Date.now() - 1000).toISOString() }),
    })
    setSaving(false)
    window.location.reload()
  }

  async function resetProgress() {
    if (!confirm('Reset ALL progress for this student? This cannot be undone.')) return
    await fetch(`/api/admin/students/${student.id}`, {
      method: 'DELETE',
    })
    window.location.reload()
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Access Settings</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Access Expires
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400 mt-1">Leave empty for lifetime access</p>
          </div>

          {success && <p className="text-xs text-green-600">Saved successfully</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={saveAccess}
            disabled={saving}
            className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Danger Zone</h3>
        <div className="space-y-3">
          <button
            onClick={revokeAccess}
            className="w-full px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
          >
            Revoke Access Now
          </button>
          <button
            onClick={resetProgress}
            className="w-full px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset All Progress
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 text-xs space-y-2 text-gray-500">
        <div className="flex justify-between">
          <span>ID</span>
          <span className="font-mono text-gray-400 truncate ml-4">{student.id.slice(0, 12)}…</span>
        </div>
        <div className="flex justify-between">
          <span>Enrolled</span>
          <span>{student.enrolled_at ? new Date(student.enrolled_at).toLocaleDateString('en-GB') : '—'}</span>
        </div>
        <div className="flex justify-between">
          <span>Stripe ID</span>
          <span className="font-mono">{student.stripe_customer_id?.slice(0, 10) ?? '—'}</span>
        </div>
      </div>
    </div>
  )
}
