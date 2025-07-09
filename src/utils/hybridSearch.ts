// Advanced Hybrid Search System
import { searchUsersWithAI, AISearchResponse } from './aiSearch';
import { enhancedTextSearch, expandSearchTerms } from './synonymMapping';
import { advancedFuzzyMatch, multiFieldFuzzySearch, enhancedFuzzyTextSearch } from './advancedFuzzyMatching';

export interface SearchResult {
  id: string;
  score: number;
  source: 'structured' | 'ai' | 'hybrid';
  matchedFields: string[];
  confidence: number;
  relevanceFactors?: {
    exactMatch: number;
    fuzzyMatch: number;
    synonymMatch: number;
    fieldRelevance: number;
    contextRelevance: number;
  };
}

export interface HybridSearchResponse {
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
  sources: {
    structured: SearchResult[];
    ai: SearchResult[];
    hybrid: SearchResult[];
  };
  error?: string;
}

interface PersonData {
  id: number;
  name: { ja: string; en: string };
  role: Array<{ ja: string; en: string }>;
  team: { ja: string; en: string };
  specialty: Array<{ ja: string; en: string }>;
  interests: Array<{ ja: string; en: string }>;
  ideas: Array<{ ja: string; en: string }>;
  github_enhanced?: {
    profile: {
      bio: string | null;
      company: string | null;
    };
    languages: {
      topLanguages: string[];
    };
    topRepos: Array<{
      name: string;
      description: string | null;
      language: string | null;
    }>;
  };
}

// Load and parse the full JSON data
async function loadFullData(): Promise<PersonData[]> {
  try {
    const response = await fetch('/people_with_github.json');
    const jsonData = await response.json();
    return jsonData.participants || jsonData;
  } catch (error) {
    console.error('Failed to load full data:', error);
    throw new Error('Failed to load user data');
  }
}

// Advanced structured search with fuzzy matching and field weighting
function performStructuredSearch(data: PersonData[], query: string): SearchResult[] {
  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];
  
  // Define field weights for scoring
  const fieldWeights = {
    name: 1.0,
    role: 0.9,
    specialty: 0.8,
    team: 0.7,
    interests: 0.6,
    ideas: 0.5,
    github_bio: 0.8,
    github_company: 0.7,
    github_languages: 0.6,
    github_repos: 0.4
  };

  // Precise role matching function
  const isPreciseRoleMatch = (roleText: string, searchQuery: string): boolean => {
    const roleLower = roleText.toLowerCase();
    const queryLower = searchQuery.toLowerCase();
    
    // Designer search - should NOT match PM/Engineer combinations
    if (queryLower.includes('デザイナー') || queryLower.includes('designer') || 
        queryLower.includes('クリエーター') || queryLower.includes('クリエイター') ||
        queryLower.includes('creative') || queryLower.includes('creator')) {
      
      // Exclude PM/Engineer combinations
      if (roleLower.includes('pm') && roleLower.includes('engineer')) {
        return false;
      }
      if (roleLower.includes('pm') && roleLower.includes('エンジニア')) {
        return false;
      }
      if (roleLower.includes('product manager') && roleLower.includes('engineer')) {
        return false;
      }
      
      // Only match actual designer roles
      return roleLower.includes('designer') || roleLower.includes('デザイナー') ||
             roleLower.includes('creative') || roleLower.includes('creator') ||
             roleLower.includes('クリエーター') || roleLower.includes('クリエイター');
    }
    
    // Engineer search - can match PM/Engineer combinations
    if (queryLower.includes('エンジニア') || queryLower.includes('engineer') ||
        queryLower.includes('developer') || queryLower.includes('programmer')) {
      return roleLower.includes('engineer') || roleLower.includes('エンジニア') ||
             roleLower.includes('developer') || roleLower.includes('programmer') ||
             roleLower.includes('coder');
    }
    
    // PM/Manager search - can match PM/Engineer combinations
    if (queryLower.includes('pm') || queryLower.includes('manager') ||
        queryLower.includes('マネージャー') || queryLower.includes('product manager')) {
      return roleLower.includes('pm') || roleLower.includes('manager') ||
             roleLower.includes('マネージャー') || roleLower.includes('product manager');
    }
    
    // Default fallback to original logic
    return roleLower.includes(queryLower);
  };

  data.forEach(person => {
    let totalScore = 0;
    const matchedFields: string[] = [];
    
    // Enhanced field checking with multiple matching strategies
    const checkField = (value: string, fieldName: string, weight: number) => {
      if (!value) return false;
      
      let fieldScore = 0;
      const relevanceFactors = {
        exactMatch: 0,
        fuzzyMatch: 0,
        synonymMatch: 0,
        fieldRelevance: weight,
        contextRelevance: 0
      };
      
      // Special handling for role fields with precise matching
      if (fieldName.includes('role')) {
        if (isPreciseRoleMatch(value, query)) {
          fieldScore = weight;
          relevanceFactors.exactMatch = 1.0;
          matchedFields.push(fieldName);
        }
      } else {
        // 1. Direct exact match (highest priority)
        if (value.toLowerCase().includes(lowerQuery)) {
          fieldScore = weight;
          relevanceFactors.exactMatch = 1.0;
          matchedFields.push(fieldName);
        }
        // 2. Fuzzy matching for typos and variations
        else {
          const fuzzyResult = advancedFuzzyMatch(query, value, 0.6);
          if (fuzzyResult.score > 0) {
            fieldScore = weight * fuzzyResult.score * 0.8;
            relevanceFactors.fuzzyMatch = fuzzyResult.score;
            matchedFields.push(`${fieldName}_fuzzy`);
          }
        }
        
        // 3. Synonym-based matching (only for non-role fields to avoid conflicts)
        if (!fieldName.includes('role') && enhancedTextSearch(query, value)) {
          const synonymScore = weight * 0.9;
          if (synonymScore > fieldScore) {
            fieldScore = synonymScore;
            relevanceFactors.synonymMatch = 0.9;
            matchedFields.push(`${fieldName}_synonym`);
          }
        }
        
        // 4. Enhanced fuzzy text search
        if (enhancedFuzzyTextSearch(query, value, 0.5)) {
          const enhancedScore = weight * 0.7;
          if (enhancedScore > fieldScore) {
            fieldScore = enhancedScore;
            relevanceFactors.fuzzyMatch = Math.max(relevanceFactors.fuzzyMatch, 0.7);
            if (!matchedFields.includes(`${fieldName}_enhanced_fuzzy`)) {
              matchedFields.push(`${fieldName}_enhanced_fuzzy`);
            }
          }
        }
      }
      
      totalScore += fieldScore;
      return fieldScore > 0;
    };

    // Helper function for fuzzy matching
const fuzzyMatch = (value: string, query: string, threshold = 0.6) => {
  if (!value) return false;
  const similarity = calculateSimilarity(value.toLowerCase(), query);
  return similarity >= threshold;
};

// Calculate context relevance based on person's profile completeness and query matching
function calculateContextRelevance(person: PersonData, query: string): number {
  let relevance = 0;
  
  // Profile completeness factor
  const profileFields = [
    person.name.ja, person.name.en,
    person.team.ja, person.team.en,
    ...person.role.map(r => r.ja + r.en),
    ...person.specialty.map(s => s.ja + s.en),
    ...person.interests.map(i => i.ja + i.en),
    ...person.ideas.map(i => i.ja + i.en)
  ];
  
  const completeness = profileFields.filter(field => field && field.trim().length > 0).length / profileFields.length;
  relevance += completeness * 0.3;
  
  // GitHub data bonus
  if (person.github_enhanced) {
    relevance += 0.2;
    
    // Active GitHub profile bonus
    if (person.github_enhanced.topRepos && person.github_enhanced.topRepos.length > 0) {
      relevance += 0.1;
    }
    
    // Language diversity bonus
    if (person.github_enhanced.languages.topLanguages.length > 2) {
      relevance += 0.1;
    }
  }
  
  // Query-specific relevance
  const queryLower = query.toLowerCase();
  
  // Role-query alignment
  const roleAlignment = person.role.some(role => 
    role.ja.toLowerCase().includes(queryLower) || 
    role.en.toLowerCase().includes(queryLower)
  );
  if (roleAlignment) relevance += 0.3;
  
  // Skill-query alignment
  const skillAlignment = person.specialty.some(skill => 
    skill.ja.toLowerCase().includes(queryLower) || 
    skill.en.toLowerCase().includes(queryLower)
  );
  if (skillAlignment) relevance += 0.2;
  
  return Math.min(relevance, 1.0);
}

    // Search in name fields
    checkField(person.name.ja, 'name_ja', fieldWeights.name);
    checkField(person.name.en, 'name_en', fieldWeights.name);
    
    // Search in role fields
    person.role.forEach(role => {
      checkField(role.ja, 'role_ja', fieldWeights.role);
      checkField(role.en, 'role_en', fieldWeights.role);
    });
    
    // Search in specialty fields
    person.specialty.forEach(spec => {
      checkField(spec.ja, 'specialty_ja', fieldWeights.specialty);
      checkField(spec.en, 'specialty_en', fieldWeights.specialty);
    });
    
    // Search in team fields
    checkField(person.team.ja, 'team_ja', fieldWeights.team);
    checkField(person.team.en, 'team_en', fieldWeights.team);
    
    // Search in interests
    person.interests.forEach(interest => {
      checkField(interest.ja, 'interests_ja', fieldWeights.interests);
      checkField(interest.en, 'interests_en', fieldWeights.interests);
    });
    
    // Search in ideas
    person.ideas.forEach(idea => {
      checkField(idea.ja, 'ideas_ja', fieldWeights.ideas);
      checkField(idea.en, 'ideas_en', fieldWeights.ideas);
    });
    
    // Search in GitHub data
    if (person.github_enhanced) {
      const gh = person.github_enhanced;
      
      if (gh.profile.bio) {
        checkField(gh.profile.bio, 'github_bio', fieldWeights.github_bio);
      }
      
      if (gh.profile.company) {
        checkField(gh.profile.company, 'github_company', fieldWeights.github_company);
      }
      
      gh.languages.topLanguages.forEach(lang => {
        checkField(lang, 'github_languages', fieldWeights.github_languages);
      });
      
      gh.topRepos.forEach(repo => {
        checkField(repo.name, 'github_repo_name', fieldWeights.github_repos);
        if (repo.description) {
          checkField(repo.description, 'github_repo_desc', fieldWeights.github_repos);
        }
      });
    }
    
    // Add comprehensive text matching with synonym expansion
    const allText = [
      person.name.ja, person.name.en,
      ...person.role.map(r => `${r.ja} ${r.en}`),
      ...person.specialty.map(s => `${s.ja} ${s.en}`),
      person.team.ja, person.team.en,
      ...person.interests.map(i => `${i.ja} ${i.en}`),
      ...person.ideas.map(i => `${i.ja} ${i.en}`)
    ].join(' ');
    
    // Fuzzy matching
    if (fuzzyMatch(allText, lowerQuery, 0.3)) {
      totalScore += 0.2; // Small boost for fuzzy matches
      if (!matchedFields.includes('fuzzy_match')) {
        matchedFields.push('fuzzy_match');
      }
    }
    
    // Enhanced synonym matching across all text
    if (enhancedTextSearch(query, allText)) {
      totalScore += 0.3; // Boost for comprehensive synonym matches
      if (!matchedFields.includes('comprehensive_synonym_match')) {
        matchedFields.push('comprehensive_synonym_match');
      }
    }
    
    if (totalScore > 0) {
      // Calculate comprehensive relevance factors
      const relevanceFactors = {
        exactMatch: matchedFields.filter(f => !f.includes('_')).length > 0 ? 1.0 : 0,
        fuzzyMatch: matchedFields.filter(f => f.includes('_fuzzy')).length > 0 ? 0.8 : 0,
        synonymMatch: matchedFields.filter(f => f.includes('_synonym')).length > 0 ? 0.9 : 0,
        fieldRelevance: totalScore / Math.max(...Object.values(fieldWeights)),
        contextRelevance: calculateContextRelevance(person, query)
      };
      
      // Boost score based on relevance factors
      const boostedScore = totalScore * (1 + relevanceFactors.contextRelevance * 0.2);
      
      results.push({
        id: String(person.id),
        score: boostedScore,
        source: 'structured',
        matchedFields,
        confidence: Math.min(boostedScore, 1.0),
        relevanceFactors
      });
    }
  });
  
  return results.sort((a, b) => b.score - a.score);
}

// Calculate string similarity using Levenshtein distance
function calculateSimilarity(str1: string, str2: string): number {
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;
  
  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1 : (maxLen - matrix[len2][len1]) / maxLen;
}

// Merge and rank results from different sources
function mergeResults(structuredResults: SearchResult[], aiResults: SearchResult[]): SearchResult[] {
  const resultMap = new Map<string, SearchResult>();
  
  // Add structured results
  structuredResults.forEach(result => {
    resultMap.set(result.id, result);
  });
  
  // Merge AI results
  aiResults.forEach(aiResult => {
    const existing = resultMap.get(aiResult.id);
    if (existing) {
      // Combine scores and create hybrid result
      const hybridResult: SearchResult = {
        id: aiResult.id,
        score: (existing.score * 0.6) + (aiResult.score * 0.4), // Weighted combination
        source: 'hybrid',
        matchedFields: [...new Set([...existing.matchedFields, ...aiResult.matchedFields])],
        confidence: Math.max(existing.confidence, aiResult.confidence)
      };
      resultMap.set(aiResult.id, hybridResult);
    } else {
      resultMap.set(aiResult.id, aiResult);
    }
  });
  
  return Array.from(resultMap.values()).sort((a, b) => b.score - a.score);
}

// Main hybrid search function
export async function performHybridSearch(query: string): Promise<HybridSearchResponse> {
  const startTime = Date.now();
  
  if (!query.trim()) {
    return {
      results: [],
      totalResults: 0,
      searchTime: 0,
      sources: { structured: [], ai: [], hybrid: [] },
      error: 'Search query is empty'
    };
  }
  
  try {
    // Load full data
    const data = await loadFullData();
    
    // Perform structured search
    const structuredResults = performStructuredSearch(data, query);
    
    // Perform AI search with fallback
    let aiResults: SearchResult[] = [];
    try {
      const aiResponse: AISearchResponse = await searchUsersWithAI(query);
      if (!aiResponse.error && aiResponse.matchingIds.length > 0) {
        aiResults = aiResponse.matchingIds.map(id => ({
          id,
          score: 0.8, // Default AI score
          source: 'ai' as const,
          matchedFields: ['ai_match'],
          confidence: 0.7
        }));
      }
    } catch (aiError) {
      console.warn('AI search failed, using structured results only:', aiError);
    }
    
    // Merge results
    const mergedResults = mergeResults(structuredResults, aiResults);
    
    const searchTime = Date.now() - startTime;
    
    return {
      results: mergedResults,
      totalResults: mergedResults.length,
      searchTime,
      sources: {
        structured: structuredResults,
        ai: aiResults,
        hybrid: mergedResults.filter(r => r.source === 'hybrid')
      }
    };
    
  } catch (error) {
    console.error('Hybrid search error:', error);
    return {
      results: [],
      totalResults: 0,
      searchTime: Date.now() - startTime,
      sources: { structured: [], ai: [], hybrid: [] },
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Search analytics and debugging
export interface SearchAnalytics {
  query: string;
  timestamp: number;
  results: HybridSearchResponse;
  userInteractions?: {
    clickedResults: string[];
    searchRefinements: string[];
  };
}

class SearchAnalyticsManager {
  private analytics: SearchAnalytics[] = [];
  private readonly maxEntries = 100;
  
  logSearch(query: string, results: HybridSearchResponse) {
    const entry: SearchAnalytics = {
      query,
      timestamp: Date.now(),
      results
    };
    
    this.analytics.unshift(entry);
    if (this.analytics.length > this.maxEntries) {
      this.analytics = this.analytics.slice(0, this.maxEntries);
    }
    
    // Log to console for debugging
    console.log('Search Analytics:', {
      query,
      totalResults: results.totalResults,
      searchTime: results.searchTime,
      sources: {
        structured: results.sources.structured.length,
        ai: results.sources.ai.length,
        hybrid: results.sources.hybrid.length
      }
    });
  }
  
  getAnalytics(): SearchAnalytics[] {
    return [...this.analytics];
  }
  
  getSearchStats() {
    const total = this.analytics.length;
    const avgSearchTime = this.analytics.reduce((sum, a) => sum + a.results.searchTime, 0) / total;
    const avgResults = this.analytics.reduce((sum, a) => sum + a.results.totalResults, 0) / total;
    
    return {
      totalSearches: total,
      averageSearchTime: avgSearchTime,
      averageResults: avgResults,
      successRate: this.analytics.filter(a => a.results.totalResults > 0).length / total
    };
  }
}

export const searchAnalytics = new SearchAnalyticsManager(); 