/**
 * Gets the public-facing origin URL from request headers.
 * This handles cases where the app is behind a reverse proxy (e.g., in Docker).
 *
 * Priority:
 * 1. x-forwarded-host + x-forwarded-proto headers (from reverse proxy)
 * 2. NEXT_PUBLIC_SITE_URL environment variable
 * 3. host header + protocol detection
 *
 * @param headers - The headers object from Next.js request
 * @returns The full origin URL (e.g., "https://sejmofil.pl")
 */
export function getPublicOrigin(headers: Headers): string {
  // Check for forwarded host/protocol (set by reverse proxies like nginx, traefik, etc.)
  const forwardedHost = headers.get('x-forwarded-host')
  const forwardedProto = headers.get('x-forwarded-proto')

  if (forwardedHost) {
    const protocol = forwardedProto || 'https'
    return `${protocol}://${forwardedHost}`
  }

  // Check for environment variable (useful for production deployments)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // Fallback to host header
  const host = headers.get('host')
  if (host) {
    // In production, assume https. In development (localhost), use http
    const protocol = host.includes('localhost') ? 'http' : 'https'
    return `${protocol}://${host}`
  }

  // Final fallback - should rarely happen
  return 'http://localhost:3000'
}
