export default function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="w-full">
      <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-stone-800 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-sm text-stone-600 mt-2">{percentage}% complete</p>
    </div>
  )
}
