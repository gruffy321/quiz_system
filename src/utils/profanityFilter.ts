/**
 * A highly simplified profanity filter for demonstration.
 * In a production environment, this should be expanded or replaced with a dedicated library like 'bad-words'.
 */

const FORBIDDEN_WORDS = new Set([
  'damn',
  'hell',
  'crap',
  // Note: Add domain-specific inappropriate terms here.
]);

export interface ProfanityCheckResult {
  isClean: boolean;
  censoredText: string;
}

export function filterProfanity(text: string): ProfanityCheckResult {
  if (!text) return { isClean: true, censoredText: '' };

  const words = text.split(/\b/);
  let isClean = true;

  const censoredWords = words.map(word => {
    if (FORBIDDEN_WORDS.has(word.toLowerCase())) {
      isClean = false;
      return '*'.repeat(word.length);
    }
    return word;
  });

  return {
    isClean,
    censoredText: censoredWords.join('')
  };
}
