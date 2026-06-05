// Extract a Vimeo video ID from a full URL or a bare ID.
// Accepts:
//   https://vimeo.com/123456789
//   https://vimeo.com/123456789/abcdef0123   (unlisted hash)
//   https://player.vimeo.com/video/123456789
//   123456789
export function parseVimeoId(input: string | null | undefined): string | null {
  if (!input) return null
  const trimmed = input.trim()

  // Bare numeric ID
  if (/^\d+$/.test(trimmed)) return trimmed

  // Try to pull the first long number out of a URL
  const match = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (match) return match[1]

  // Fallback: last path segment that's numeric
  const seg = trimmed.split('/').filter(Boolean).pop()
  return seg && /^\d+$/.test(seg) ? seg : null
}

// Optional unlisted/private hash (the token after the ID for unlisted videos)
export function parseVimeoHash(input: string | null | undefined): string | null {
  if (!input) return null
  const match = input.trim().match(/vimeo\.com\/(?:video\/)?\d+\/([0-9a-z]+)/i)
  return match ? match[1] : null
}
