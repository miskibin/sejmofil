type GitHubRelease = {
  tag_name: string
  html_url: string
}

let cachedRelease: GitHubRelease | null = null

export async function getLatestVersion(): Promise<{
  version: string
  url: string
}> {
  if (cachedRelease) {
    return {
      version: cachedRelease.tag_name,
      url: cachedRelease.html_url,
    }
  }

  try {
    const response = await fetch(
      'https://api.github.com/repos/miskibin/sejmofront/releases/latest',
      { next: { revalidate: 3600 } }
    )

    if (!response.ok)
      return {
        version: 'v0.0.0',
        url: 'https://github.com/miskibin/sejmofront/releases',
      }

    const data: GitHubRelease = await response.json()
    cachedRelease = data
    return {
      version: data.tag_name,
      url: data.html_url,
    }
  } catch {
    return {
      version: 'v0.0.0',
      url: 'https://github.com/miskibin/sejmofront/releases',
    }
  }
}
