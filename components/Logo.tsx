import Image from 'next/image'

// The logo asset is white on transparent (public/logo.png, 350×200).
// Use the default on dark backgrounds; pass `dark` on light backgrounds
// (admin) to render it black via a brightness filter.
export default function Logo({
  className = 'h-10 w-auto',
  dark = false,
}: {
  className?: string
  dark?: boolean
}) {
  return (
    <Image
      src="/logo.png"
      alt="FaceSculpt™"
      width={350}
      height={200}
      priority
      className={`${className} ${dark ? 'brightness-0' : ''}`}
    />
  )
}
