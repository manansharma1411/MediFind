/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a, b) {
  if (!a || !b) return (a || b).length;
  const matrix = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[a.length][b.length];
}

/**
 * Find 'Did You Mean?' suggestion from a list of medicine records
 * @param {string} query 
 * @param {Array<{name: string, generic_name: string, brand_name: string}>} allMedicines 
 * @returns {string|null}
 */
function getDidYouMeanSuggestion(query, allMedicines) {
  if (!query || query.length < 3) return null;
  const normalizedQuery = query.toLowerCase().trim();
  let bestMatch = null;
  let minDistance = Infinity;

  for (const med of allMedicines) {
    const candidates = [med.name, med.generic_name, med.brand_name];
    for (const candidate of candidates) {
      if (!candidate) continue;
      const normalizedCandidate = candidate.toLowerCase();
      // If query is already contained, no typo suggestion needed
      if (normalizedCandidate.includes(normalizedQuery)) {
        return null;
      }
      const dist = levenshteinDistance(normalizedQuery, normalizedCandidate);
      // Max allowable distance based on query length (e.g. 2 for 4-6 chars, 3 for 7+ chars)
      const maxDist = normalizedQuery.length <= 5 ? 2 : 3;
      if (dist < minDistance && dist <= maxDist && dist > 0) {
        minDistance = dist;
        bestMatch = candidate;
      }
    }
  }

  return bestMatch;
}

module.exports = {
  levenshteinDistance,
  getDidYouMeanSuggestion
};
