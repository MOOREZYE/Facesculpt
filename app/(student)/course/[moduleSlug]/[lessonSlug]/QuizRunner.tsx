'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { QuizResult } from '@/types'
import type { QuizClientData } from './page'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export default function QuizRunner({
  lessonId,
  quiz,
  alreadyPassed,
  onPassed,
}: {
  lessonId: string
  quiz: QuizClientData
  alreadyPassed: boolean
  onPassed?: () => void
}) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<QuizResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = quiz.questions.length
  const current = quiz.questions[step]
  const isLast = step === total - 1
  const currentAnswered = current ? !!answers[current.id] : false

  const [retaking, setRetaking] = useState(false)

  function retake() {
    setStep(0)
    setAnswers({})
    setResult(null)
    setError(null)
    setRetaking(true)
  }

  // ── Already passed: show a completed state with a retake option ──
  if (alreadyPassed && !result && !retaking) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-full bg-gold-500 flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-warm-950" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
        </div>
        <h3 className="serif text-2xl text-warm-50 mb-2">Quiz Completed</h3>
        <p className="text-warm-500 text-sm mb-6">You&apos;ve passed this quiz. Continue to the next lesson below.</p>
        <button
          onClick={retake}
          className="px-6 py-2.5 border border-warm-700 text-warm-200 rounded-lg font-medium text-sm hover:border-gold-500/40 hover:text-gold-400 transition-colors"
        >
          Retake Quiz
        </button>
      </div>
    )
  }

  function selectOption(optionId: string) {
    if (!current) return
    setAnswers(prev => ({ ...prev, [current.id]: optionId }))
  }

  async function handleSubmit() {
    if (submitting) return
    setSubmitting(true)
    setError(null)

    const payload = {
      lessonId,
      answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      })),
    }

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }
      const r = json.data as QuizResult
      setResult(r)
      setSubmitting(false)
      if (r.passed) onPassed?.()
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  // ── Results screen (no retake) ──
  if (result) {
    return (
      <div className="space-y-8">
        <div
          className={`rounded-xl p-8 border text-center ${
            result.passed ? 'bg-gold-500/10 border-gold-500/30' : 'bg-red-500/10 border-red-500/25'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
              result.passed ? 'bg-gold-500 text-warm-950' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {result.passed ? (
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </div>
          <h3 className={`serif text-3xl mb-1 ${result.passed ? 'text-gold-400' : 'text-red-400'}`}>
            {result.passed ? 'Passed' : 'Not quite'}
          </h3>
          <p className="text-sm text-warm-400">
            You scored <span className="tabular-nums text-warm-200">{result.score}%</span> · pass mark {result.passMark}%
          </p>
          {result.passed ? (
            <p className="text-sm text-warm-500 mt-4">Lesson marked complete. Continue below.</p>
          ) : (
            <p className="text-sm text-warm-500 mt-4">Review your answers below, then retake the quiz.</p>
          )}
          <button
            onClick={retake}
            className="mt-6 px-6 py-2.5 border border-warm-700 text-warm-200 rounded-lg font-medium text-sm hover:border-gold-500/40 hover:text-gold-400 transition-colors"
          >
            Retake Quiz
          </button>
        </div>

        {/* Per-question review */}
        <div className="space-y-3">
          {quiz.questions.map((q, i) => {
            const g = result.answers.find(a => a.questionId === q.id)
            const correct = g?.isCorrect
            return (
              <div
                key={q.id}
                className="flex items-start gap-3 px-4 py-3 rounded-lg border border-warm-800"
                style={{ background: '#111009' }}
              >
                <span className={`mt-0.5 flex-shrink-0 ${correct ? 'text-gold-400' : 'text-red-400'}`}>
                  {correct ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  )}
                </span>
                <p className="text-sm text-warm-300 flex-1">
                  <span className="text-warm-600 tabular-nums mr-2">{String(i + 1).padStart(2, '0')}</span>
                  {q.text}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Stepper: one question at a time ──
  if (!current) return null

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs tracking-[0.15em] uppercase text-warm-600">
            Question {step + 1} of {total}
          </span>
          <span className="text-xs text-warm-600 tabular-nums">
            {Object.keys(answers).length}/{total} answered
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
      <div>
        <h4 className="serif text-2xl text-warm-50 mb-6 leading-snug">{current.text}</h4>
        <div className="space-y-2.5">
          {current.options.map((opt, oIdx) => {
            const selected = answers[current.id] === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => selectOption(opt.id)}
                className={`w-full text-left flex items-center gap-4 px-5 py-4 rounded-xl border transition-colors ${
                  selected
                    ? 'border-gold-500 bg-gold-500/10 text-warm-50'
                    : 'border-warm-700 hover:border-warm-600 text-warm-300'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0 border ${
                    selected
                      ? 'border-gold-500 bg-gold-500 text-warm-950'
                      : 'border-warm-700 text-warm-500'
                  }`}
                >
                  {LETTERS[oIdx]}
                </span>
                <span className="flex-1 text-sm">{opt.text}</span>
              </button>
            )
          })}
        </div>
      </div>

      {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-4 py-3">{error}</p>}

      {/* Nav */}
      <div className="flex items-center justify-between pt-2 border-t border-warm-800">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="px-5 py-2.5 text-sm text-warm-500 hover:text-warm-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Back
        </button>

        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={!currentAnswered || submitting}
            className="px-7 py-3 bg-gold-500 text-warm-950 rounded-lg font-semibold text-sm hover:bg-gold-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting…' : 'Submit Quiz'}
          </button>
        ) : (
          <button
            onClick={() => setStep(s => Math.min(total - 1, s + 1))}
            disabled={!currentAnswered}
            className="px-7 py-3 bg-gold-500 text-warm-950 rounded-lg font-semibold text-sm hover:bg-gold-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next Question →
          </button>
        )}
      </div>
    </div>
  )
}
