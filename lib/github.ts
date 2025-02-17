import axios from "axios";
import { SOCIAL_LINKS } from "./config/links";

type GitHubRelease = {
  tag_name: string;
  html_url: string;
};

let cachedRelease: GitHubRelease | null = null;
const REPO_PATH = SOCIAL_LINKS.GITHUB.replace("https://github.com/", "");

// Setup axios
const api = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github.v3+json",
  },
});

export async function getLatestVersion(): Promise<{
  version: string;
  url: string;
}> {
  if (cachedRelease) {
    return {
      version: cachedRelease.tag_name,
      url: cachedRelease.html_url,
    };
  }

  try {
    const { data } = await api.get<GitHubRelease>(
      `/repos/${REPO_PATH}/releases/latest`
      // Removed "cache" configuration as it's not supported in AxiosRequestConfig.
    );

    cachedRelease = data as GitHubRelease; // Ensure the data conforms to GitHubRelease.
    return {
      version: data.tag_name,
      url: data.html_url,
    };
  } catch {
    return {
      version: "v0.0.0",
      url: `${SOCIAL_LINKS.GITHUB}/releases`,
    };
  }
}
