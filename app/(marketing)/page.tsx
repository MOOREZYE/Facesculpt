import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      {/* Navigation */}
      <nav className="border-b border-stone-200 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-wide text-stone-800">
            FaceSculpt<span className="text-xs align-super">™</span>
          </h1>
          <Link
            href="/login"
            className="text-sm text-stone-600 hover:text-stone-800 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold tracking-tight text-stone-900 mb-4">
            Master the Art of Facial Sculpting
          </h2>
          <p className="text-xl text-stone-600 mb-8 max-w-2xl mx-auto">
            A comprehensive professional training course for beauty therapists and skin specialists.
            Learn FaceSculpt™ techniques, anatomy, and protocols from industry experts.
          </p>

          <div className="flex gap-4 justify-center">
            <a
              href="#enrol"
              className="bg-stone-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-stone-700 transition-colors"
            >
              Enrol Now
            </a>
            <a
              href="#about"
              className="border border-stone-300 text-stone-800 px-8 py-3 rounded-lg font-medium hover:bg-stone-50 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Features */}
        <div id="about" className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-2xl p-8 border border-stone-200">
            <div className="text-3xl mb-4">🎓</div>
            <h3 className="text-lg font-semibold text-stone-800 mb-2">8 Modules</h3>
            <p className="text-sm text-stone-600">
              Structured curriculum covering anatomy, science, technique, and business.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-stone-200">
            <div className="text-3xl mb-4">🎥</div>
            <h3 className="text-lg font-semibold text-stone-800 mb-2">38 Lessons</h3>
            <p className="text-sm text-stone-600">
              Theory, video demonstrations, quizzes, and downloadable resources.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-stone-200">
            <div className="text-3xl mb-4">📜</div>
            <h3 className="text-lg font-semibold text-stone-800 mb-2">Certification</h3>
            <p className="text-sm text-stone-600">
              Receive your FaceSculpt™ certificate upon 100% course completion.
            </p>
          </div>
        </div>

        {/* Enrol CTA */}
        <div
          id="enrol"
          className="bg-white rounded-2xl shadow-lg border border-stone-200 p-12 text-center max-w-2xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-stone-800 mb-4">Ready to get started?</h3>
          <p className="text-stone-600 mb-6">
            Complete access to all 8 modules, 38 lessons, and quizzes. Learn at your own pace
            over 12 months.
          </p>

          <button
            disabled
            className="bg-stone-800 text-white px-8 py-3 rounded-lg font-medium opacity-50 cursor-not-allowed"
            title="Stripe integration coming soon"
          >
            Enrol – Stripe integration coming soon
          </button>

          <p className="text-xs text-stone-500 mt-4">
            Stripe checkout will be available shortly
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white/50 mt-20 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-stone-500">
          <p>FaceSculpt™ Professional Training Platform</p>
        </div>
      </footer>
    </div>
  )
}
