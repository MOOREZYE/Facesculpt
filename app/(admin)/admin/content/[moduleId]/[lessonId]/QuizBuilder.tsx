'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface QuizOption { id?: string; option_text: string; is_correct: boolean; order_index: number }
interface QuizQuestion { id?: string; question_text: string; order_index: number; quiz_options: QuizOption[] }
type ExistingQuiz = {
  id: string
  pass_mark: number
  quiz_questions: QuizQuestion[]
} | null

export default function QuizBuilder({
  lessonId,
  existingQuiz,
}: {
  lessonId: string
  existingQuiz: ExistingQuiz
}) {
  const [passMark, setPassMark] = useState(existingQuiz?.pass_mark ?? 80)
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    existingQuiz?.quiz_questions?.sort((a, b) => a.order_index - b.order_index).map(q => ({
      ...q,
      quiz_options: q.quiz_options?.sort((a, b) => a.order_index - b.order_index) ?? [],
    })) ?? []
  )
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const router = useRouter()

  function addQuestion() {
    setQuestions(prev => [
      ...prev,
      {
        question_text: '',
        order_index: prev.length + 1,
        quiz_options: [
          { option_text: '', is_correct: true, order_index: 1 },
          { option_text: '', is_correct: false, order_index: 2 },
        ],
      },
    ])
  }

  function removeQuestion(qi: number) {
    setQuestions(prev => prev.filter((_, i) => i !== qi).map((q, i) => ({ ...q, order_index: i + 1 })))
  }

  function updateQuestion(qi: number, text: string) {
    setQuestions(prev => prev.map((q, i) => i === qi ? { ...q, question_text: text } : q))
  }

  function addOption(qi: number) {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qi) return q
      return {
        ...q,
        quiz_options: [
          ...q.quiz_options,
          { option_text: '', is_correct: false, order_index: q.quiz_options.length + 1 },
        ],
      }
    }))
  }

  function removeOption(qi: number, oi: number) {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qi) return q
      const opts = q.quiz_options.filter((_, j) => j !== oi).map((o, j) => ({ ...o, order_index: j + 1 }))
      return { ...q, quiz_options: opts }
    }))
  }

  function updateOption(qi: number, oi: number, text: string) {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qi) return q
      return { ...q, quiz_options: q.quiz_options.map((o, j) => j === oi ? { ...o, option_text: text } : o) }
    }))
  }

  function setCorrect(qi: number, oi: number) {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qi) return q
      return {
        ...q,
        quiz_options: q.quiz_options.map((o, j) => ({ ...o, is_correct: j === oi })),
      }
    }))
  }

  function moveQuestion(qi: number, dir: 'up' | 'down') {
    const newQ = [...questions]
    const swap = dir === 'up' ? qi - 1 : qi + 1
    if (swap < 0 || swap >= newQ.length) return
    ;[newQ[qi], newQ[swap]] = [newQ[swap], newQ[qi]]
    setQuestions(newQ.map((q, i) => ({ ...q, order_index: i + 1 })))
  }

  async function save() {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/admin/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: lessonId,
          quiz_id: existingQuiz?.id ?? null,
          pass_mark: passMark,
          questions,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSaveError(json.error ?? 'Save failed. Please try again.')
        setSaving(false)
        return
      }
      setSaving(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
      // Re-pull fresh server data so the saved quiz reflects immediately
      router.refresh()
    } catch {
      setSaveError('Network error. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Quiz Builder</h2>
        <div className="flex items-center gap-3">
          {saveError && <span className="text-xs text-red-600">{saveError}</span>}
          {success && <span className="text-xs text-green-600">Saved ✓</span>}
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Quiz'}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Pass mark */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Pass mark</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              value={passMark}
              onChange={e => setPassMark(Number(e.target.value))}
              className="w-20 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
          <p className="text-xs text-gray-400">Students must score this % or above to pass</p>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((q, qi) => (
            <div key={qi} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Question header */}
              <div className="bg-gray-50 px-5 py-3 flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Q{qi + 1}</span>
                <div className="flex-1">
                  <input
                    value={q.question_text}
                    onChange={e => updateQuestion(qi, e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none placeholder-gray-400"
                    placeholder="Enter question text…"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveQuestion(qi, 'up')} disabled={qi === 0} className="p-1 text-gray-300 hover:text-gray-500 disabled:opacity-20">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                  </button>
                  <button onClick={() => moveQuestion(qi, 'down')} disabled={qi === questions.length - 1} className="p-1 text-gray-300 hover:text-gray-500 disabled:opacity-20">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  <button onClick={() => removeQuestion(qi)} className="p-1 text-red-300 hover:text-red-500 ml-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="px-5 py-3 space-y-2">
                {q.quiz_options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-3">
                    <button
                      onClick={() => setCorrect(qi, oi)}
                      title={opt.is_correct ? 'Correct answer' : 'Mark as correct'}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        opt.is_correct
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-green-400'
                      }`}
                    >
                      {opt.is_correct && (
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <input
                      value={opt.option_text}
                      onChange={e => updateOption(qi, oi, e.target.value)}
                      className={`flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
                        opt.is_correct
                          ? 'border-green-300 bg-green-50 focus:ring-green-400'
                          : 'border-gray-200 focus:ring-indigo-400'
                      }`}
                      placeholder={`Option ${oi + 1}`}
                    />
                    <button
                      onClick={() => removeOption(qi, oi)}
                      disabled={q.quiz_options.length <= 2}
                      className="text-gray-300 hover:text-red-400 disabled:opacity-20 p-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addOption(qi)}
                  className="mt-1 text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  Add option
                </button>
              </div>
              <p className="px-5 py-2 text-xs text-gray-400 bg-gray-50 border-t border-gray-100">
                Click the circle to mark the correct answer
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={addQuestion}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add Question
        </button>
      </div>
    </div>
  )
}
