'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = {
  key: string
  question: string
  helper?: string
  type: 'text' | 'textarea' | 'choice'
  options?: string[]
  placeholder?: string
}

const STEPS: Step[] = [
  { key: 'full_name', question: 'What is your full name?', type: 'text', placeholder: 'Jane Doe', helper: 'This will appear on your certificate.' },
  { key: 'country', question: 'What country are you based in?', type: 'text', placeholder: 'United Kingdom' },
  {
    key: 'years_experience',
    question: 'How many years have you been working in the industry?',
    type: 'choice',
    options: ['Less than 1 year', '1–3 years', '3–5 years', '5–10 years', '10+ years'],
  },
  {
    key: 'offers_facials',
    question: 'Do you currently offer facial treatments in your clinic?',
    type: 'choice',
    options: ['Yes', 'No', 'Not yet, but planning to'],
  },
  {
    key: 'primary_goal',
    question: 'What is your primary goal for taking this course?',
    type: 'choice',
    options: [
      'Add FaceSculpt™ to my treatment menu',
      'Improve my facial technique',
      'Start a new treatment business',
      'Increase my revenue',
      'Personal development',
    ],
  },
  {
    key: 'work_setting',
    question: 'Do you work independently or as part of a team/salon?',
    type: 'choice',
    options: ['Independently', 'Part of a team or salon', 'Both'],
  },
  {
    key: 'heard_about',
    question: 'How did you hear about FaceSculpt™?',
    type: 'choice',
    options: ['Instagram', 'Facebook', 'Google search', 'Word of mouth', 'Email', 'Other'],
  },
  {
    key: 'biggest_challenge',
    question: 'What is your biggest challenge with facial treatments right now?',
    type: 'textarea',
    placeholder: 'Tell us in a sentence or two…',
  },
]

export default function OnboardingForm({ prefillName }: { prefillName: string }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>(
    prefillName ? { full_name: prefillName } : {}
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = STEPS.length
  const current = STEPS[step]
  const value = answers[current.key] ?? ''
  const answered = value.trim().length > 0
  const isLast = step === total - 1

  function set(val: string) {
    setAnswers(prev => ({ ...prev, [current.key]: val }))
  }

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error ?? 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  function next() {
    if (!answered) return
    if (isLast) submit()
    else setStep(s => s + 1)
  }

  return (
    <div className="card p-8 md:p-10">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs tracking-[0.15em] uppercase text-warm-600">
            Question {step + 1} of {total}
          </span>
          <span className="text-xs text-gold-500 tabular-nums">
            {Math.round(((step + 1) / total) * 100)}%
          </span>
        </div>
        <div className="w-full h-px bg-warm-800">
          <div
            className="h-full bg-gold-500 transition-all duration-300"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h2 className="serif text-2xl md:text-3xl text-warm-50 mb-2 leading-snug">
        {current.question}
      </h2>
      {current.helper && <p className="text-sm text-warm-500 mb-6">{current.helper}</p>}
      {!current.helper && <div className="mb-6" />}

      {/* Input */}
      {current.type === 'text' && (
        <input
          autoFocus
          value={value}
          onChange={e => set(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && next()}
          placeholder={current.placeholder}
          className="w-full rounded-lg border border-warm-700 bg-warm-950 px-4 py-3 text-warm-100 placeholder-warm-700 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-warm-600"
        />
      )}

      {current.type === 'textarea' && (
        <textarea
          autoFocus
          value={value}
          onChange={e => set(e.target.value)}
          placeholder={current.placeholder}
          rows={4}
          className="w-full rounded-lg border border-warm-700 bg-warm-950 px-4 py-3 text-warm-100 placeholder-warm-700 resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-warm-600"
        />
      )}

      {current.type === 'choice' && (
        <div className="space-y-2.5">
          {current.options!.map(opt => {
            const selected = value === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => set(opt)}
                className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm transition-colors ${
                  selected
                    ? 'border-gold-500 bg-gold-500/10 text-warm-50'
                    : 'border-warm-700 hover:border-warm-600 text-warm-300'
                }`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      )}

      {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-4 py-3 mt-6">{error}</p>}

      {/* Nav */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-warm-800">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="px-5 py-2.5 text-sm text-warm-500 hover:text-warm-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Back
        </button>
        <button
          onClick={next}
          disabled={!answered || submitting}
          className="px-7 py-3 bg-gold-500 text-warm-950 rounded-lg font-semibold text-sm hover:bg-gold-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving…' : isLast ? 'Enter the Course' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
