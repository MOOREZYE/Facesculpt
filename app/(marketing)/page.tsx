import Link from 'next/link'
import Logo from '@/components/Logo'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-warm-950">
      {/* Navigation */}
      <nav className="border-b border-warm-700 bg-warm-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo className="h-14 w-auto" />
          <Link
            href="/login"
            className="text-sm text-warm-400 hover:text-warm-100 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
            Professional Certification Course
          </div>
          <h2 className="serif text-5xl md:text-7xl text-warm-50 mb-8 text-balance leading-none">
            Master the Art<br />of Facial Sculpting
          </h2>
          <p className="text-lg md:text-xl text-warm-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            A comprehensive professional training course for beauty therapists and skin specialists.
            Learn FaceSculpt™ techniques, anatomy, and protocols from industry experts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#enrol"
              className="bg-gold-500 text-warm-950 px-8 py-3.5 rounded-xl font-semibold hover:bg-gold-400 transition-colors"
            >
              Enrol Now
            </a>
            <a
              href="#about"
              className="border border-warm-700 text-warm-200 px-8 py-3.5 rounded-xl font-medium hover:bg-warm-900 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Features */}
        <div id="about" className="grid md:grid-cols-3 gap-5 mb-24">
          {[
            {
              title: '8 Modules',
              body: 'Structured curriculum covering anatomy, science, technique, and business.',
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              ),
            },
            {
              title: '38 Lessons',
              body: 'Theory, video demonstrations, quizzes, and downloadable resources.',
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              ),
            },
            {
              title: 'Certification',
              body: 'Receive your FaceSculpt™ certificate upon 100% course completion.',
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
              ),
            },
          ].map(f => (
            <div key={f.title} className="bg-warm-900 rounded-2xl p-8 border border-warm-700">
              <div className="w-11 h-11 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-5">
                <svg className="w-5 h-5 text-gold-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  {f.icon}
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-warm-50 mb-2">{f.title}</h3>
              <p className="text-sm text-warm-400 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>

        {/* Enrol CTA */}
        <div
          id="enrol"
          className="relative overflow-hidden bg-warm-900 rounded-3xl border border-warm-700 p-12 text-center max-w-2xl mx-auto"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl -mt-48" />
          <div className="relative">
            <h3 className="serif text-4xl text-warm-50 mb-5">Ready to begin?</h3>
            <p className="text-warm-400 mb-8 max-w-md mx-auto">
              Complete access to all 8 modules, 38 lessons, and quizzes. Learn at your own pace.
            </p>

            <button
              disabled
              className="bg-warm-800 text-warm-400 px-8 py-3.5 rounded-xl font-medium cursor-not-allowed border border-warm-600"
              title="Stripe integration coming soon"
            >
              Enrol — Coming soon
            </button>

            <p className="text-xs text-warm-500 mt-4">Stripe checkout will be available shortly</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-warm-700 mt-12 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-warm-500">
          <p>FaceSculpt™ Professional Training Platform</p>
        </div>
      </footer>
    </div>
  )
}
