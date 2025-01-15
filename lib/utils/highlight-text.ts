export function highlightText(text: string, query: string) {
  if (!query || !text) return text;

  // Split query into words and escape special characters
  const words = query
    .trim()
    .split(/\s+/)
    .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  // Create regex pattern that ignores HTML tags
  const regex = new RegExp(`(${words.join('|')})(?![^<]*>)`, 'gi');

  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 dark:text-white px-0.5 rounded">$1</mark>');
}
