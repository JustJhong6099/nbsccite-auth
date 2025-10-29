/**
 * Data normalization utilities for research domains, keywords, and entities
 * Provides consistent filtering and replacement across all components
 */

// False positive terms to exclude from domain/keyword analysis
export const FALSE_POSITIVES = [
  'experience',
  'document',
  'experiment',
  'reductionism',
  // Current institution name
  'northern bukidnon state college',
  'nbsc',
  'bukidnon',
  'state college',
  // Old institution name (for backward compatibility with existing data)
  'northern beaches secondary college',
  'beaches',
  'secondary college',
  'the',
  'and',
  'or',
  'with',
  'for',
  'in',
  'on',
  'at',
  'to',
  'of',
  'study',
  'abstract',
  'paper',
  'student',
  'teacher',
  'professor'
];

// Replacement mappings for standardizing terminology
export const TERM_REPLACEMENTS: { [key: string]: string } = {
  // IoT variations
  'iot': 'Internet of Things',
  'i.o.t': 'Internet of Things',
  'i.o.t.': 'Internet of Things',
  
  // Management variations
  'management': 'Data Management',
};

/**
 * Normalizes a term by applying filters and replacements
 * @param term - The term to normalize
 * @param applyCapitalization - Whether to capitalize the term if no replacement is found
 * @returns The normalized term, or null if it should be filtered out
 */
export function normalizeTerm(term: string, applyCapitalization: boolean = true): string | null {
  if (!term) return null;
  
  const trimmed = term.trim();
  if (!trimmed) return null;
  
  const normalized = trimmed.toLowerCase();
  
  // Filter out short terms (2 characters or less)
  if (normalized.length <= 2) return null;
  
  // Filter out false positives (exact matches)
  if (FALSE_POSITIVES.includes(normalized)) return null;
  
  // Filter out terms containing institution name keywords (current and old)
  if (normalized.includes('bukidnon') || 
      normalized.includes('nbsc') || 
      normalized.includes('state college') ||
      normalized.includes('beaches') ||
      normalized.includes('secondary college') ||
      normalized.includes('northern beaches')) {
    return null;
  }
  
  // Apply replacements
  if (TERM_REPLACEMENTS[normalized]) {
    return TERM_REPLACEMENTS[normalized];
  }
  
  // Return with original casing or capitalized
  return applyCapitalization ? capitalizeWords(trimmed) : trimmed;
}

/**
 * Capitalizes the first letter of each word
 * @param text - The text to capitalize
 * @returns The capitalized text
 */
function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Normalizes an array of terms, removing nulls and duplicates
 * @param terms - Array of terms to normalize
 * @param applyCapitalization - Whether to capitalize terms
 * @returns Normalized array of unique terms
 */
export function normalizeTerms(terms: string[], applyCapitalization: boolean = true): string[] {
  const normalized = new Map<string, string>();
  
  terms.forEach(term => {
    const result = normalizeTerm(term, applyCapitalization);
    if (result) {
      // Use lowercase as key to prevent duplicates like "Data Management" and "data management"
      const key = result.toLowerCase();
      normalized.set(key, result);
    }
  });
  
  return Array.from(normalized.values());
}

/**
 * Counts occurrences of normalized terms
 * @param terms - Array of terms to count
 * @returns Object with term counts
 */
export function countNormalizedTerms(terms: string[]): { [key: string]: number } {
  const counts: { [key: string]: number } = {};
  
  terms.forEach(term => {
    const normalized = normalizeTerm(term, true);
    if (normalized) {
      counts[normalized] = (counts[normalized] || 0) + 1;
    }
  });
  
  return counts;
}

/**
 * Gets top N terms by count
 * @param counts - Term counts object
 * @param limit - Number of top terms to return
 * @returns Array of [term, count] tuples sorted by count descending
 */
export function getTopTerms(counts: { [key: string]: number }, limit: number): [string, number][] {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}
