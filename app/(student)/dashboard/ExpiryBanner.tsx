export default function ExpiryBanner({
  expiresAt,
  daysUntilExpiry,
  isExpired,
}: {
  expiresAt: Date
  daysUntilExpiry: number
  isExpired: boolean
}) {
  const isWarning = daysUntilExpiry <= 30 && daysUntilExpiry > 0

  if (isExpired) return null

  if (!isWarning) return null

  return (
    <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
      <p className="text-sm text-amber-900">
        <span className="font-semibold">Access expiring soon:</span> Your course access expires in{' '}
        <span className="font-semibold">{daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}</span>
        {' '}(
        {expiresAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
      </p>
    </div>
  )
}
