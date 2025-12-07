/**
 * File relevance ranking utilities
 */

/**
 * Rank files by relevance to search query
 */
export function rankFilesByRelevance(
  files: string[],
  keywords: string[],
  boostPatterns?: RegExp[]
): Array<{path: string; score: number}> {
  return files.map(file => ({
    path: file,
    score: calculateRelevanceScore(file, keywords, boostPatterns)
  })).sort((a, b) => b.score - a.score);
}

/**
 * Calculate relevance score for a file
 */
function calculateRelevanceScore(
  file: string,
  keywords: string[],
  boostPatterns?: RegExp[]
): number {
  let score = 0;
  const fileName = file.toLowerCase();
  
  // Keyword matching
  for (const keyword of keywords) {
    if (fileName.includes(keyword.toLowerCase())) {
      score += 10;
    }
  }
  
  // File type boosting
  if (fileName.endsWith('.tsx') && !fileName.includes('test')) {
    score += 5;
  }
  if (fileName.endsWith('.ts') && !fileName.includes('test')) {
    score += 3;
  }
  
  // Pattern boosting
  if (boostPatterns) {
    for (const pattern of boostPatterns) {
      if (pattern.test(fileName)) {
        score += 15;
      }
    }
  }
  
  // Penalty for test files
  if (fileName.includes('test') || fileName.includes('spec')) {
    score -= 20;
  }
  
  // Penalty for build artifacts
  if (fileName.includes('.d.ts') || fileName.includes('.map')) {
    score -= 30;
  }
  
  return Math.max(0, score);
}

/**
 * Filter and rank files by pattern matching
 */
export function filterAndRank(
  files: string[],
  patterns: string[],
  keywords: string[]
): Array<{path: string; score: number}> {
  const filtered = files.filter(file => {
    const fileName = file.toLowerCase();
    return patterns.some(pattern => fileName.includes(pattern.toLowerCase()));
  });
  
  return rankFilesByRelevance(filtered, keywords);
}

