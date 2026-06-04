export default function HeroSection({
  userName,
  progressPercent,
}: {
  userName: string
  progressPercent: number
}) {
  return (
    <div className="mb-12">
      {/* Gradient Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700 p-8 md:p-12 shadow-2xl">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -ml-24 -mb-24"></div>

        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Welcome back, {userName}!</h1>
          <p className="text-emerald-100 text-lg md:text-xl">
            You&apos;re {progressPercent}% through your FaceSculpt™ certification journey
          </p>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl md:text-3xl font-bold text-white">{progressPercent}%</div>
              <div className="text-sm text-emerald-100 mt-1">Complete</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl md:text-3xl font-bold text-white">8</div>
              <div className="text-sm text-emerald-100 mt-1">Modules</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl md:text-3xl font-bold text-white">38</div>
              <div className="text-sm text-emerald-100 mt-1">Lessons</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl md:text-3xl font-bold text-white">📜</div>
              <div className="text-sm text-emerald-100 mt-1">Certificate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-stone-900">Overall Progress</h3>
          <span className="text-lg font-bold text-emerald-600">{progressPercent}%</span>
        </div>
        <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}
