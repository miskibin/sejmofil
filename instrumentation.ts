/**
 * Next.js Instrumentation Hook
 *
 * This file runs when the Next.js server starts.
 * Used for initialization, logging setup, monitoring, etc.
 */

export async function register() {
  // Initialize any server-side services here
  // This runs once when the server starts

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Node.js only initialization
    // Add any backend setup code here
  }
}
