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
}: {
  lessonId: string
  quiz: QuizClientData
  alreadyPassed: boolean
}) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<QuizResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalQuestions = quiz.questions.length
  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount === totalQuestions

  function selectOption(questionId: string, optionId: string) {
    if (result) return // locked after submission
    setAnswers(prev => ({ ...prev, [questionId]: optionId }))
  }

  async function handleSubmit() {
    if (!allAnswered || submitting) return
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
      setResult(json.data as QuizResult)
      setSubmitting(false)
      // Refresh server data so completion/unlocks reflect immediately
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  function retake() {
    setAnswers({})
    setResult(null)
    setError(null)
  }

  // Map questionId → graded answer for feedback
  const graded = result ? new Map(result.answers.map(a => [a.questionId, a])) : null

  return (
    <div className="space-y-8">
      {/* Already-passed banner */}
      {alreadyPassed && !result && (
        <div className="flex items-center gap-2 text-sm text-gold-400 bg-gold-500/10 border border-gold-500/20 rounded-lg px-4 py-3">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
          You&apos;ve already passed this quiz. You can retake it any time.
        </div>
      )}

      {/* Result banner */}
      {result && (
        <div
          className={`rounded-xl p-6 border ${
            result.passed
              ? 'bg-gold-500/10 border-gold-500/30'
              : 'bg-red-500/10 border-red-500/25'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                result.passed ? 'bg-gold-500 text-warm-950' : 'bg-red-500/20 text-red-400'
              }`}
            >
              {result.passed ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              )}
            </div>
            <div>
              <h3 className={`serif text-2xl ${result.passed ? 'text-gold-400' : 'text-red-400'}`}>
                {result.passed ? 'Passed' : 'Not quite'}
              </h3>
              <p className="text-sm text-warm-400 mt-0.5">
                You scored <span className="tabular-nums text-warm-200">{result.score}%</span>
                {' '}· pass mark {result.passMark}%
              </p>
            </div>
          </div>
          {!result.passed && (
            <p className="text-sm text-warm-500 mt-4">
              Review the answers below, then retake the quiz. Unlimited attempts.
            </p>
          )}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-8">
        {quiz.questions.map((q, qIdx) => {
          const g = graded?.get(q.id)
          return (
            <div key={q.id}>
              <div className="flex gap-3 mb-4">
                <span className="text-xs tabular-nums text-warm-600 mt-1">
                  {String(qIdx + 1).padStart(2, '0')}
                </span>
                <h4 className="text-warm-100 font-medium leading-relaxed flex-1">{q.text}</h4>
              </div>

              <div className="space-y-2 ml-7">
                {q.options.map((opt, oIdx) => {
                  const selected = answers[q.id] === opt.id
                  // Feedback state after grading
                  let stateClass = 'border-warm-700 hover:border-warm-600 text-warm-300'
                  if (g) {
                    if (opt.id === g.correctOptionId) {
                      stateClass = 'border-gold-500/50 bg-gold-500/10 text-gold-300'
                    } else if (opt.id === g.selectedOptionId && !g.isCorrect) {
                      stateClass = 'border-red-500/40 bg-red-500/10 text-red-300'
                    } else {
                      stateClass = 'border-warm-800 text-warm-500'
                    }
                  } else if (selected) {
                    stateClass = 'border-gold-500 bg-gold-500/10 text-warm-100'
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={!!result}
                      onClick={() => selectOption(q.id, opt.id)}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${stateClass} ${
                        result ? 'cursor-default' : 'cursor-pointer'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold flex-shrink-0 border ${
                          selected && !g
                            ? 'border-gold-500 bg-gold-500 text-warm-950'
                            : g && opt.id === g.correctOptionId
                              ? 'border-gold-500 bg-gold-500 text-warm-950'
                              : g && opt.id === g.selectedOptionId
                                ? 'border-red-500 text-red-400'
                                : 'border-warm-700 text-warm-500'
                        }`}
                      >
                        {LETTERS[oIdx]}
                      </span>
                      <span className="flex-1 text-sm">{opt.text}</span>
                      {g && opt.id === g.correctOptionId && (
                        <svg className="w-4 h-4 text-gold-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-4 py-3">{error}</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-warm-800">
        {!result ? (
          <>
            <span className="text-xs text-warm-600 tabular-nums">
              {answeredCount} of {totalQuestions} answered
            </span>
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="px-7 py-3 bg-gold-500 text-warm-950 rounded-lg font-semibold text-sm hover:bg-gold-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting…' : 'Submit Quiz'}
            </button>
          </>
        ) : (
          <>
            <span className="text-xs text-warm-600">
              {result.passed ? 'Lesson marked complete.' : 'Try again to pass.'}
            </span>
            <button
              onClick={retake}
              className="px-7 py-3 border border-warm-700 text-warm-200 rounded-lg font-medium text-sm hover:border-gold-500/40 hover:text-gold-400 transition-colors"
            >
              Retake Quiz
            </button>
          </>
        )}
      </div>
    </div>
  )
}
