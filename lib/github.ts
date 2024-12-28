type GitHubRelease = {
  tag_name: string;
};

let cachedVersion: string | null = null;

export async function getLatestVersion(): Promise<string> {
  if (cachedVersion) return cachedVersion;

  try {
    const response = await fetch(
      'https://api.github.com/repos/miskibin/sejmofront/releases/latest',
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!response.ok) return 'v0.0.0';
    
    const data: GitHubRelease = await response.json();
    cachedVersion = data.tag_name;
    return cachedVersion;
  } catch (error) {
    return 'v0.0.0';
  }
}
