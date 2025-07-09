// Advanced Fuzzy Matching with Japanese and English Support
export interface FuzzyMatchResult {
  score: number;
  matchType: 'exact' | 'fuzzy' | 'phonetic' | 'partial';
  confidence: number;
}

// Japanese romanization patterns for fuzzy matching
const JAPANESE_ROMANIZATION_PATTERNS = new Map([
  // Hiragana to Romaji
  ['あ', ['a']], ['い', ['i']], ['う', ['u']], ['え', ['e']], ['お', ['o']],
  ['か', ['ka', 'ca']], ['き', ['ki']], ['く', ['ku']], ['け', ['ke']], ['こ', ['ko', 'co']],
  ['が', ['ga']], ['ぎ', ['gi']], ['ぐ', ['gu']], ['げ', ['ge']], ['ご', ['go']],
  ['さ', ['sa']], ['し', ['shi', 'si']], ['す', ['su']], ['せ', ['se']], ['そ', ['so']],
  ['ざ', ['za']], ['じ', ['ji', 'zi']], ['ず', ['zu']], ['ぜ', ['ze']], ['ぞ', ['zo']],
  ['た', ['ta']], ['ち', ['chi', 'ti']], ['つ', ['tsu', 'tu']], ['て', ['te']], ['と', ['to']],
  ['だ', ['da']], ['ぢ', ['di']], ['づ', ['du']], ['で', ['de']], ['ど', ['do']],
  ['な', ['na']], ['に', ['ni']], ['ぬ', ['nu']], ['ね', ['ne']], ['の', ['no']],
  ['は', ['ha', 'wa']], ['ひ', ['hi']], ['ふ', ['fu', 'hu']], ['へ', ['he', 'e']], ['ほ', ['ho']],
  ['ば', ['ba']], ['び', ['bi']], ['ぶ', ['bu']], ['べ', ['be']], ['ぼ', ['bo']],
  ['ぱ', ['pa']], ['ぴ', ['pi']], ['ぷ', ['pu']], ['ぺ', ['pe']], ['ぽ', ['po']],
  ['ま', ['ma']], ['み', ['mi']], ['む', ['mu']], ['め', ['me']], ['も', ['mo']],
  ['や', ['ya']], ['ゆ', ['yu']], ['よ', ['yo']],
  ['ら', ['ra', 'la']], ['り', ['ri', 'li']], ['る', ['ru', 'lu']], ['れ', ['re', 'le']], ['ろ', ['ro', 'lo']],
  ['わ', ['wa']], ['ゐ', ['wi']], ['ゑ', ['we']], ['を', ['wo', 'o']],
  ['ん', ['n', 'nn']],
  
  // Katakana equivalents
  ['ア', ['a']], ['イ', ['i']], ['ウ', ['u']], ['エ', ['e']], ['オ', ['o']],
  ['カ', ['ka', 'ca']], ['キ', ['ki']], ['ク', ['ku']], ['ケ', ['ke']], ['コ', ['ko', 'co']],
  ['ガ', ['ga']], ['ギ', ['gi']], ['グ', ['gu']], ['ゲ', ['ge']], ['ゴ', ['go']],
  ['サ', ['sa']], ['シ', ['shi', 'si']], ['ス', ['su']], ['セ', ['se']], ['ソ', ['so']],
  ['ザ', ['za']], ['ジ', ['ji', 'zi']], ['ズ', ['zu']], ['ゼ', ['ze']], ['ゾ', ['zo']],
  ['タ', ['ta']], ['チ', ['chi', 'ti']], ['ツ', ['tsu', 'tu']], ['テ', ['te']], ['ト', ['to']],
  ['ダ', ['da']], ['ヂ', ['di']], ['ヅ', ['du']], ['デ', ['de']], ['ド', ['do']],
  ['ナ', ['na']], ['ニ', ['ni']], ['ヌ', ['nu']], ['ネ', ['ne']], ['ノ', ['no']],
  ['ハ', ['ha', 'wa']], ['ヒ', ['hi']], ['フ', ['fu', 'hu']], ['ヘ', ['he', 'e']], ['ホ', ['ho']],
  ['バ', ['ba']], ['ビ', ['bi']], ['ブ', ['bu']], ['ベ', ['be']], ['ボ', ['bo']],
  ['パ', ['pa']], ['ピ', ['pi']], ['プ', ['pu']], ['ペ', ['pe']], ['ポ', ['po']],
  ['マ', ['ma']], ['ミ', ['mi']], ['ム', ['mu']], ['メ', ['me']], ['モ', ['mo']],
  ['ヤ', ['ya']], ['ユ', ['yu']], ['ヨ', ['yo']],
  ['ラ', ['ra', 'la']], ['リ', ['ri', 'li']], ['ル', ['ru', 'lu']], ['レ', ['re', 'le']], ['ロ', ['ro', 'lo']],
  ['ワ', ['wa']], ['ヰ', ['wi']], ['ヱ', ['we']], ['ヲ', ['wo', 'o']],
  ['ン', ['n', 'nn']],
]);

// Common typo patterns
const COMMON_TYPO_PATTERNS = new Map([
  // English typos
  ['teh', 'the'], ['adn', 'and'], ['taht', 'that'], ['hte', 'the'],
  ['recieve', 'receive'], ['seperate', 'separate'], ['definately', 'definitely'],
  
  // Programming terms
  ['javascirpt', 'javascript'], ['typescirpt', 'typescript'], ['reactjs', 'react'],
  ['nodejs', 'node.js'], ['vuejs', 'vue.js'], ['angularjs', 'angular'],
  
  // Japanese romanization variants
  ['dezaina', 'designer'], ['enjinia', 'engineer'], ['maneja', 'manager'],
  ['purograma', 'programmer'], ['deberoppa', 'developer'],
]);

// Enhanced Levenshtein distance with weighted operations
export function calculateWeightedLevenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Create matrix
  const matrix: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
  
  // Initialize first row and column
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  // Fill matrix with weighted costs
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const char1 = str1[i - 1];
      const char2 = str2[j - 1];
      
      if (char1 === char2) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        // Different weights for different operations
        const substitutionCost = getSubstitutionCost(char1, char2);
        const insertionCost = 1.0;
        const deletionCost = 1.0;
        
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + deletionCost,      // deletion
          matrix[i][j - 1] + insertionCost,     // insertion
          matrix[i - 1][j - 1] + substitutionCost // substitution
        );
      }
    }
  }
  
  return matrix[len1][len2];
}

// Get substitution cost based on character similarity
function getSubstitutionCost(char1: string, char2: string): number {
  // Same character
  if (char1 === char2) return 0;
  
  // Similar characters (lower cost)
  const similarPairs = [
    ['l', 'r'], ['b', 'v'], ['c', 'k'], ['f', 'ph'], ['i', 'y'],
    ['o', '0'], ['s', 'z'], ['u', 'v'], ['w', 'vv'],
    // Japanese similar sounds
    ['し', 'し'], ['じ', 'ぢ'], ['ず', 'づ'], ['は', 'わ']
  ];
  
  for (const [c1, c2] of similarPairs) {
    if ((char1 === c1 && char2 === c2) || (char1 === c2 && char2 === c1)) {
      return 0.5;
    }
  }
  
  // Check Japanese romanization similarity
  const rom1 = JAPANESE_ROMANIZATION_PATTERNS.get(char1);
  const rom2 = JAPANESE_ROMANIZATION_PATTERNS.get(char2);
  
  if (rom1 && rom2) {
    // Check if they have common romanization
    const hasCommon = rom1.some(r1 => rom2.some(r2 => r1 === r2));
    if (hasCommon) return 0.3;
  }
  
  // Default substitution cost
  return 1.0;
}

// Advanced fuzzy matching with multiple strategies
export function advancedFuzzyMatch(query: string, target: string, threshold: number = 0.6): FuzzyMatchResult {
  const queryLower = query.toLowerCase().trim();
  const targetLower = target.toLowerCase().trim();
  
  // Exact match
  if (queryLower === targetLower) {
    return { score: 1.0, matchType: 'exact', confidence: 1.0 };
  }
  
  // Substring match
  if (targetLower.includes(queryLower)) {
    const score = queryLower.length / targetLower.length;
    return { score, matchType: 'partial', confidence: 0.9 };
  }
  
  // Check common typos
  const correctedQuery = COMMON_TYPO_PATTERNS.get(queryLower) || queryLower;
  if (correctedQuery !== queryLower && targetLower.includes(correctedQuery)) {
    const score = correctedQuery.length / targetLower.length;
    return { score, matchType: 'fuzzy', confidence: 0.8 };
  }
  
  // Levenshtein distance based matching
  const distance = calculateWeightedLevenshteinDistance(queryLower, targetLower);
  const maxLength = Math.max(queryLower.length, targetLower.length);
  const similarity = 1 - (distance / maxLength);
  
  if (similarity >= threshold) {
    return { 
      score: similarity, 
      matchType: 'fuzzy', 
      confidence: similarity * 0.7 
    };
  }
  
  // Phonetic matching for Japanese-English
  const phoneticScore = calculatePhoneticSimilarity(queryLower, targetLower);
  if (phoneticScore >= threshold) {
    return { 
      score: phoneticScore, 
      matchType: 'phonetic', 
      confidence: phoneticScore * 0.6 
    };
  }
  
  return { score: 0, matchType: 'fuzzy', confidence: 0 };
}

// Phonetic similarity for Japanese-English cross-matching
function calculatePhoneticSimilarity(query: string, target: string): number {
  // Convert Japanese characters to possible romanizations
  const queryRomanizations = generateRomanizations(query);
  const targetRomanizations = generateRomanizations(target);
  
  let maxSimilarity = 0;
  
  // Compare all combinations
  for (const qRom of queryRomanizations) {
    for (const tRom of targetRomanizations) {
      const distance = calculateWeightedLevenshteinDistance(qRom, tRom);
      const maxLength = Math.max(qRom.length, tRom.length);
      const similarity = 1 - (distance / maxLength);
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }
  }
  
  return maxSimilarity;
}

// Generate possible romanizations for a string
function generateRomanizations(text: string): string[] {
  const romanizations = new Set<string>();
  romanizations.add(text); // Add original
  
  // Generate romanized versions
  let romanized = '';
  for (const char of text) {
    const patterns = JAPANESE_ROMANIZATION_PATTERNS.get(char);
    if (patterns) {
      // For simplicity, use the first pattern
      romanized += patterns[0];
    } else {
      romanized += char;
    }
  }
  
  if (romanized !== text) {
    romanizations.add(romanized);
  }
  
  return Array.from(romanizations);
}

// Multi-field fuzzy search
export function multiFieldFuzzySearch(
  query: string, 
  fields: string[], 
  threshold: number = 0.6
): { field: string; result: FuzzyMatchResult }[] {
  const results: { field: string; result: FuzzyMatchResult }[] = [];
  
  fields.forEach(field => {
    const result = advancedFuzzyMatch(query, field, threshold);
    if (result.score > 0) {
      results.push({ field, result });
    }
  });
  
  // Sort by score and confidence
  return results.sort((a, b) => {
    const scoreA = a.result.score * a.result.confidence;
    const scoreB = b.result.score * b.result.confidence;
    return scoreB - scoreA;
  });
}

// Enhanced text search with fuzzy matching
export function enhancedFuzzyTextSearch(
  searchText: string, 
  targetText: string, 
  threshold: number = 0.6
): boolean {
  // Split into words for better matching
  const searchWords = searchText.toLowerCase().split(/\s+/);
  const targetWords = targetText.toLowerCase().split(/\s+/);
  
  // Check if all search words have fuzzy matches in target
  return searchWords.every(searchWord => {
    return targetWords.some(targetWord => {
      const result = advancedFuzzyMatch(searchWord, targetWord, threshold);
      return result.score >= threshold;
    });
  });
} 