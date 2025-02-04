export function highlightText(text: string, query: string) {
  if (!query || !text) return text

  // Split query into words and escape special characters
  const words = query
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 1) // Skip single-character words
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

  if (words.length === 0) return text

  // Create regex pattern that matches whole words and parts of words
  const pattern = words.join('|')
  const regex = new RegExp(`(${pattern})`, 'gi')

  // First, replace [object Object] occurrences with empty string
  const cleanText = text.replace(/\[object Object\]/g, '')

  // Then apply highlighting
  return cleanText.replace(
    regex,
    (match) => `<mark class="bg-yellow-200  px-0.5 rounded">${match}</mark>`
  )
}
