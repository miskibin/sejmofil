import { getLatestVersion } from '@/lib/github'

export async function GET() {
  try {
    const { version, url } = await getLatestVersion()
    return Response.json({ version, url })
  } catch (error) {
    console.error('Failed to fetch version:', error)
    return Response.json({ version: 'main', url: '#' }, { status: 200 })
  }
}
