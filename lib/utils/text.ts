export function truncateMarkdown(text: string, maxLength: number = 300): string {
  if (!text || text.length <= maxLength) return text;
  
  // Try to find the last complete sentence within the limit
  const truncated = text.slice(0, maxLength);
  const lastSentence = truncated.match(/.*[.!?]/);
  
  if (lastSentence) {
    return lastSentence[0] + ' [...]';
  }
  
  // If no sentence end found, cut at the last complete word
  const lastWord = truncated.match(/.*\s/);
  return (lastWord ? lastWord[0] : truncated) + ' [...]';
}
