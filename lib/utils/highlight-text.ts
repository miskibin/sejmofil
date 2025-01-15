export function highlightText(text: string, query: string) {
  if (!query || !text) return text;

  const words = query.trim().split(/\s+/);
  const escapedWords = words.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');

  return text.split(regex).map((part, ) => {
    if (regex.test(part)) {
      return `<mark class="bg-yellow-200 dark:bg-yellow-800 dark:text-white px-0.5 rounded">${part}</mark>`;
    }
    return part;
  }).join('');
}
