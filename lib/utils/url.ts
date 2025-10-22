/**
 * Gets the public-facing origin URL from request headers.
 * This handles cases where the app is behind a reverse proxy (e.g., in Docker).
 *
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL environment variable (most reliable)
 * 2. x-forwarded-host + x-forwarded-proto headers (from reverse proxy)
 * 3. host header + protocol detection (but filter out Docker container hostnames)
 *
 * @param headers - The headers object from Next.js request
 * @returns The full origin URL (e.g., "https://sejmofil.pl")
 */
export function getPublicOrigin(headers: Headers): string {
  // Priority 1: Environment variable (most reliable for production)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // Priority 2: Check for forwarded host/protocol (set by reverse proxies like nginx, traefik, etc.)
  const forwardedHost = headers.get('x-forwarded-host')
  const forwardedProto = headers.get('x-forwarded-proto')

  if (forwardedHost) {
    const protocol = forwardedProto || 'https'
    return `${protocol}://${forwardedHost}`
  }

  // Priority 3: Fallback to host header with validation
  const host = headers.get('host')
  if (host) {
    // Filter out Docker container hostnames (they look like random hex strings)
    // Docker hostnames are typically 12 character hex strings
    const isDockerHostname = /^[0-9a-f]{12}(:\d+)?$/i.test(host.replace(/:\d+$/, ''))
    
    // Don't use Docker container hostnames
    if (!isDockerHostname) {
      // In production, assume https. In development (localhost), use http
      const protocol = host.includes('localhost') ? 'http' : 'https'
      return `${protocol}://${host}`
    }
  }

  // Final fallback - default to production URL
  return 'https://sejmofil.pl'
}
