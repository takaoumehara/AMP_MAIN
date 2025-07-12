import { searchUsersWithAI } from './aiSearch';

// Unified Search Configuration
const SEARCH_CONFIG = {
  // Field weights for scoring (profile data prioritized)
  FIELD_WEIGHTS: {
    // Core profile data (highest priority)
    skills: 1.0,
    hobbies: 1.0,
    role: 0.95,
    name: 0.9,
    bio: 0.85,
    team: 0.8,
    
    // External data (reference only)
    github_bio: 0.3,
    github_company: 0.25,
    github_languages: 0.2,
    github_repos: 0.15,
    external_links: 0.1
  },
  
  // Search thresholds
  THRESHOLDS: {
    exact_match: 1.0,
    partial_match: 0.7,
    fuzzy_match: 0.5,
    synonym_match: 0.8,
    minimum_score: 0.3
  },
  
  // Language detection patterns
  JAPANESE_PATTERN: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/,
  ENGLISH_PATTERN: /^[a-zA-Z\s\-/.]+$/
};

// Comprehensive Synonym Dictionary
const SYNONYM_DICTIONARY = {
  // Dance & Entertainment
  'dance': ['dance', 'ダンス', '踊り', 'dancing', 'ダンシング', 'ダンサー', 'dancer', '舞踊', 'ballet', 'バレエ'],
  
  // Design & Creative
  'design': ['design', 'デザイン', 'designer', 'デザイナー', 'ui', 'ux', 'クリエイティブ', 'creative', 'クリエーター', 'creator'],
  'ui': ['ui', 'ユーアイ', 'user interface', 'ユーザーインターフェース', 'interface design', 'ui design', 'UIデザイン'],
  'ux': ['ux', 'ユーエックス', 'user experience', 'ユーザーエクスペリエンス', 'ux design', 'UXデザイン', 'usability', 'ユーザビリティ'],
  
  // Engineering & Development
  'engineer': ['engineer', 'エンジニア', 'developer', '開発者', 'programmer', 'プログラマー', 'coder', 'コーダー', 'dev', '技術者'],
  'frontend': ['frontend', 'フロントエンド', 'front-end', 'front end', 'fe', 'client-side', 'クライアントサイド'],
  'backend': ['backend', 'バックエンド', 'back-end', 'back end', 'be', 'server-side', 'サーバーサイド'],
  'fullstack': ['fullstack', 'フルスタック', 'full-stack', 'full stack', 'full-stack developer', 'フルスタック開発者'],
  
  // Technologies
  'react': ['react', 'リアクト', 'react.js', 'reactjs', 'react native', 'リアクトネイティブ'],
  'vue': ['vue', 'ビュー', 'vue.js', 'vuejs', 'vue js'],
  'angular': ['angular', 'アンギュラー', 'angular.js', 'angularjs'],
  'javascript': ['javascript', 'ジャバスクリプト', 'js', 'java script', 'node.js', 'nodejs'],
  'typescript': ['typescript', 'タイプスクリプト', 'ts', 'type script'],
  'python': ['python', 'パイソン', 'py'],
  'java': ['java', 'ジャバ'],
  'node': ['node', 'ノード', 'node.js', 'nodejs', 'node js'],
  
  // Management & Business
  'pm': ['pm', 'product manager', 'プロダクトマネージャー', 'プロダクトマネジャー', 'product management', 'プロダクト管理'],
  'manager': ['manager', 'マネージャー', 'management', 'マネジメント', '管理', '管理者', 'lead', 'リード'],
  'marketing': ['marketing', 'マーケティング', 'marketer', 'マーケター', '宣伝', '広告'],
  
  // AI & Data
  'ai': ['ai', 'artificial intelligence', '人工知能', 'machine learning', '機械学習', 'ml', 'deep learning', 'ディープラーニング'],
  'data': ['data', 'データ', 'data science', 'データサイエンス', 'data analysis', 'データ分析', 'analytics', 'アナリティクス'],
  
  // Other skills
  'music': ['music', '音楽', 'musician', 'ミュージシャン', '楽器', 'instrument', 'singing', '歌', 'song', '楽曲'],
  'art': ['art', 'アート', '芸術', 'artist', 'アーティスト', '絵画', 'painting', 'drawing', '描画'],
  'sports': ['sports', 'スポーツ', '運動', 'exercise', 'エクササイズ', 'fitness', 'フィットネス', '体育'],
  'game': ['game', 'ゲーム', 'gaming', 'ゲーミング', 'video game', 'ビデオゲーム', 'board game', 'ボードゲーム'],
  'anime': ['anime', 'アニメ', 'animation', 'アニメーション', 'manga', 'マンガ', '漫画'],
  'travel': ['travel', '旅行', 'trip', 'トリップ', '旅', 'journey', '観光', 'tourism'],
  'food': ['food', '食べ物', '料理', 'cooking', 'クッキング', 'cuisine', 'グルメ', 'gourmet', '食事'],
  'reading': ['reading', '読書', 'book', '本', 'novel', '小説', 'literature', '文学'],
  'movie': ['movie', '映画', 'film', 'フィルム', 'cinema', 'シネマ', 'video', 'ビデオ']
};

// Core interfaces
export interface UnifiedSearchResult {
  id: string;
  score: number;
  person: any;
  matchedFields: MatchedField[];
  searchSource: 'profile' | 'ai' | 'hybrid';
  confidence: number;
  debugInfo?: SearchDebugInfo;
}

export interface MatchedField {
  field: string;
  value: string;
  matchType: 'exact' | 'partial' | 'fuzzy' | 'synonym';
  score: number;
  terms: string[];
}

export interface SearchDebugInfo {
  originalQuery: string;
  normalizedQuery: string;
  expandedTerms: string[];
  languageDetected: 'ja' | 'en' | 'mixed';
  searchStrategy: string;
  fieldScores: { [field: string]: number };
}

export interface UnifiedSearchResponse {
  results: UnifiedSearchResult[];
  totalResults: number;
  searchTime: number;
  query: string;
  debugInfo: SearchDebugInfo;
  error?: string;
}

class UnifiedSearchEngine {
  private synonymMap: Map<string, string[]> = new Map();
  private termToCanonical: Map<string, string> = new Map();

  constructor() {
    this.buildSynonymMaps();
  }

  private buildSynonymMaps(): void {
    // Build bidirectional synonym mapping
    Object.entries(SYNONYM_DICTIONARY).forEach(([canonical, synonyms]) => {
      synonyms.forEach(synonym => {
        const normalizedSynonym = this.normalizeText(synonym);
        
        // Map synonym to canonical form
        this.termToCanonical.set(normalizedSynonym, canonical);
        
        // Add to synonym list
        if (!this.synonymMap.has(canonical)) {
          this.synonymMap.set(canonical, []);
        }
        this.synonymMap.get(canonical)!.push(normalizedSynonym);
        
        // Cross-reference all synonyms
        synonyms.forEach(otherSynonym => {
          const normalizedOther = this.normalizeText(otherSynonym);
          if (normalizedOther !== normalizedSynonym) {
            if (!this.synonymMap.has(normalizedSynonym)) {
              this.synonymMap.set(normalizedSynonym, []);
            }
            this.synonymMap.get(normalizedSynonym)!.push(normalizedOther);
          }
        });
      });
    });
  }

  private normalizeText(text: string): string {
    return text.toLowerCase().trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]/g, '');
  }

  private detectLanguage(query: string): 'ja' | 'en' | 'mixed' {
    const hasJapanese = SEARCH_CONFIG.JAPANESE_PATTERN.test(query);
    const hasEnglish = SEARCH_CONFIG.ENGLISH_PATTERN.test(query);
    
    if (hasJapanese && hasEnglish) return 'mixed';
    if (hasJapanese) return 'ja';
    return 'en';
  }

  private expandQuery(query: string): string[] {
    const normalizedQuery = this.normalizeText(query);
    const expandedTerms = new Set([query, normalizedQuery]);
    
    // Add direct synonyms
    const canonical = this.termToCanonical.get(normalizedQuery);
    if (canonical && this.synonymMap.has(canonical)) {
      this.synonymMap.get(canonical)!.forEach(synonym => {
        expandedTerms.add(synonym);
      });
    }
    
    // Add synonyms for the normalized query directly
    if (this.synonymMap.has(normalizedQuery)) {
      this.synonymMap.get(normalizedQuery)!.forEach(synonym => {
        expandedTerms.add(synonym);
      });
    }
    
    // Partial matching for compound terms
    this.synonymMap.forEach((synonyms, key) => {
      if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
        synonyms.forEach(synonym => expandedTerms.add(synonym));
      }
    });
    
    return Array.from(expandedTerms).filter(term => term.length > 0);
  }

  private extractPersonData(person: any): { [field: string]: string } {
    return {
      name: `${person.name?.ja || ''} ${person.name?.en || ''}`.trim(),
      role: person.roles || person.role?.map((r: any) => `${r.ja || ''} ${r.en || ''}`).join(' ') || '',
      skills: person.skills || person.specialty?.map((s: any) => `${s.ja || ''} ${s.en || ''}`).join(' ') || '',
      hobbies: person.hobbies || person.interests?.map((i: any) => `${i.ja || ''} ${i.en || ''}`).join(' ') || '',
      bio: person.bio || person.ideas?.map((i: any) => `${i.ja || ''} ${i.en || ''}`).join(' ') || '',
      team: `${person.team?.ja || ''} ${person.team?.en || ''}`.trim(),
      
      // External data (lower priority)
      github_bio: person.github_enhanced?.profile?.bio || '',
      github_company: person.github_enhanced?.profile?.company || '',
      github_languages: person.github_enhanced?.languages?.topLanguages?.join(' ') || '',
      github_repos: person.github_enhanced?.topRepos?.map((repo: any) => 
        `${repo.name} ${repo.description || ''}`).join(' ') || ''
    };
  }

  private matchField(
    fieldValue: string, 
    searchTerms: string[], 
    fieldName: string
  ): MatchedField | null {
    if (!fieldValue) return null;
    
    const normalizedField = this.normalizeText(fieldValue);
    const matchedTerms: string[] = [];
    let bestScore = 0;
    let bestMatchType: 'exact' | 'partial' | 'fuzzy' | 'synonym' = 'fuzzy';
    
    for (const term of searchTerms) {
      const normalizedTerm = this.normalizeText(term);
      
      // Exact match
      if (normalizedField === normalizedTerm) {
        matchedTerms.push(term);
        bestScore = Math.max(bestScore, SEARCH_CONFIG.THRESHOLDS.exact_match);
        bestMatchType = 'exact';
        continue;
      }
      
      // Partial match (substring)
      if (normalizedField.includes(normalizedTerm)) {
        matchedTerms.push(term);
        const score = SEARCH_CONFIG.THRESHOLDS.partial_match * (normalizedTerm.length / normalizedField.length);
        bestScore = Math.max(bestScore, score);
        if (bestMatchType !== 'exact') bestMatchType = 'partial';
        continue;
      }
      
      // Fuzzy match (word boundaries)
      const words = normalizedField.split(/\s+/);
      for (const word of words) {
        if (word.includes(normalizedTerm) || normalizedTerm.includes(word)) {
          matchedTerms.push(term);
          const score = SEARCH_CONFIG.THRESHOLDS.fuzzy_match * 0.8;
          bestScore = Math.max(bestScore, score);
          if (bestMatchType !== 'exact' && bestMatchType !== 'partial') {
            bestMatchType = 'fuzzy';
          }
        }
      }
    }
    
    if (bestScore >= SEARCH_CONFIG.THRESHOLDS.minimum_score) {
      return {
        field: fieldName,
        value: fieldValue,
        matchType: bestMatchType,
        score: bestScore,
        terms: matchedTerms
      };
    }
    
    return null;
  }

  private calculatePersonScore(
    person: any, 
    expandedTerms: string[]
  ): UnifiedSearchResult | null {
    const personData = this.extractPersonData(person);
    const matchedFields: MatchedField[] = [];
    let totalScore = 0;
    const fieldScores: { [field: string]: number } = {};
    
    // Check each field
    Object.entries(personData).forEach(([fieldName, fieldValue]) => {
      const match = this.matchField(fieldValue, expandedTerms, fieldName);
      if (match) {
        matchedFields.push(match);
        const fieldWeight = SEARCH_CONFIG.FIELD_WEIGHTS[fieldName as keyof typeof SEARCH_CONFIG.FIELD_WEIGHTS] || 0.1;
        const fieldScore = match.score * fieldWeight;
        fieldScores[fieldName] = fieldScore;
        totalScore += fieldScore;
      }
    });
    
    // Must have at least one match
    if (matchedFields.length === 0 || totalScore < SEARCH_CONFIG.THRESHOLDS.minimum_score) {
      return null;
    }
    
    // Boost score for profile data matches
    const profileMatches = matchedFields.filter(f => 
      ['name', 'role', 'skills', 'hobbies', 'bio', 'team'].includes(f.field)
    );
    const profileBoost = profileMatches.length > 0 ? 1.2 : 1.0;
    
    return {
      id: String(person.id),
      score: totalScore * profileBoost,
      person,
      matchedFields,
      searchSource: 'profile',
      confidence: Math.min(totalScore * profileBoost, 1.0)
    };
  }

  async searchPeople(query: string): Promise<UnifiedSearchResponse> {
    const startTime = Date.now();
    const normalizedQuery = this.normalizeText(query);
    const expandedTerms = this.expandQuery(query);
    const languageDetected = this.detectLanguage(query);
    
    const debugInfo: SearchDebugInfo = {
      originalQuery: query,
      normalizedQuery,
      expandedTerms,
      languageDetected,
      searchStrategy: 'unified_profile_priority',
      fieldScores: {}
    };
    
    try {
      // Load people data
      const response = await fetch('/people_with_github.json');
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.status}`);
      }
      
      const jsonData = await response.json();
      const participants = jsonData.participants || jsonData;
      
      if (!Array.isArray(participants)) {
        throw new Error('Invalid data format');
      }
      
      console.log('🔍 Unified Search:', {
        query,
        expandedTerms,
        languageDetected,
        totalPeople: participants.length
      });
      
      const results: UnifiedSearchResult[] = [];
      
      // Search through all people
      participants.forEach((person: any) => {
        const result = this.calculatePersonScore(person, expandedTerms);
        if (result) {
          result.debugInfo = {
            ...debugInfo,
            fieldScores: result.matchedFields.reduce((acc, field) => {
              acc[field.field] = field.score;
              return acc;
            }, {} as { [field: string]: number })
          };
          results.push(result);
        }
      });
      
      // Sort by score (descending)
      results.sort((a, b) => b.score - a.score);
      
      const searchTime = Date.now() - startTime;
      
      console.log('🎯 Search Results:', {
        query,
        totalResults: results.length,
        searchTime,
        topResults: results.slice(0, 3).map(r => ({
          name: r.person.name?.ja || r.person.name?.en,
          score: r.score.toFixed(2),
          matches: r.matchedFields.map(f => `${f.field}:${f.matchType}`)
        }))
      });
      
      return {
        results,
        totalResults: results.length,
        searchTime,
        query,
        debugInfo
      };
      
    } catch (error) {
      console.error('❌ Unified search error:', error);
      return {
        results: [],
        totalResults: 0,
        searchTime: Date.now() - startTime,
        query,
        debugInfo,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async searchWithAIFallback(query: string): Promise<UnifiedSearchResponse> {
    // First try unified profile search
    const profileResults = await this.searchPeople(query);
    
    // AI検索を一時的に無効化 - 白画面問題の修正
    // 常にプロファイル検索の結果を返す
    return profileResults;
    
    // 以下のAI検索部分をコメントアウト
    /*
    // If we have good results, return them
    if (profileResults.results.length > 0 && !profileResults.error) {
      return profileResults;
    }
    
    // If no profile matches, try AI search as fallback
    try {
      console.log('🤖 Falling back to AI search for:', query);
      const aiResponse = await searchUsersWithAI(query);
      
      if (aiResponse.matchingIds.length > 0) {
        // Load full data to get person objects
        const response = await fetch('/people_with_github.json');
        const jsonData = await response.json();
        const participants = jsonData.participants || jsonData;
        
        const aiResults: UnifiedSearchResult[] = aiResponse.matchingIds
          .map(id => participants.find((p: any) => String(p.id) === id))
          .filter(Boolean)
          .map((person: any) => ({
            id: String(person.id),
            score: 0.7, // AI fallback score
            person,
            matchedFields: [{ 
              field: 'ai_match', 
              value: 'AI identified match', 
              matchType: 'synonym' as const,
              score: 0.7,
              terms: [query]
            }],
            searchSource: 'ai' as const,
            confidence: 0.6
          }));
        
        return {
          results: aiResults,
          totalResults: aiResults.length,
          searchTime: profileResults.searchTime,
          query,
          debugInfo: {
            ...profileResults.debugInfo,
            searchStrategy: 'ai_fallback'
          }
        };
      }
    } catch (aiError) {
      console.warn('AI fallback also failed:', aiError);
    }
    
    return profileResults; // Return original results even if empty
    */
  }
}

// Export singleton instance
export const unifiedSearchEngine = new UnifiedSearchEngine();

// Main search function
export async function performUnifiedSearch(query: string): Promise<UnifiedSearchResponse> {
  if (!query || query.trim().length === 0) {
    return {
      results: [],
      totalResults: 0,
      searchTime: 0,
      query: '',
      debugInfo: {
        originalQuery: '',
        normalizedQuery: '',
        expandedTerms: [],
        languageDetected: 'en',
        searchStrategy: 'empty_query',
        fieldScores: {}
      },
      error: 'Empty search query'
    };
  }
  
  return unifiedSearchEngine.searchWithAIFallback(query.trim());
} 