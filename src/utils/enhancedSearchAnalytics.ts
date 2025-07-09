// Enhanced Search Analytics with Pattern Recognition
export interface DetailedSearchMetrics {
  totalSearches: number;
  successfulSearches: number;
  failedSearches: number;
  averageSearchTime: number;
  averageResultsCount: number;
  averageConfidence: number;
  
  // Pattern analysis
  searchPatterns: {
    mostCommonQueries: Array<{ query: string; count: number; avgResults: number }>;
    searchLanguageDistribution: { japanese: number; english: number; mixed: number };
    searchTypeDistribution: { role: number; skill: number; name: number; mixed: number };
    timeBasedPatterns: Array<{ hour: number; searchCount: number }>;
  };
  
  // Performance metrics
  performanceMetrics: {
    cacheHitRate: number;
    averageAISearchTime: number;
    averageStructuredSearchTime: number;
    averageHybridSearchTime: number;
    errorRate: number;
  };
  
  // User behavior
  userBehavior: {
    queryLengthDistribution: Record<string, number>;
    refinementPatterns: Array<{ original: string; refined: string; improved: boolean }>;
    abandonmentRate: number;
    clickThroughRate: number;
  };
}

export interface SearchEvent {
  timestamp: number;
  query: string;
  searchType: 'structured' | 'ai' | 'hybrid';
  results: number;
  searchTime: number;
  confidence: number;
  success: boolean;
  error?: string;
  userAgent?: string;
  sessionId?: string;
  
  // Enhanced tracking
  queryLanguage: 'japanese' | 'english' | 'mixed';
  queryType: 'role' | 'skill' | 'name' | 'mixed';
  refinementLevel: number; // How many times user refined this search
  cacheHit: boolean;
  relevanceFactors?: {
    exactMatch: number;
    fuzzyMatch: number;
    synonymMatch: number;
    fieldRelevance: number;
    contextRelevance: number;
  };
}

class EnhancedSearchAnalytics {
  private searchEvents: SearchEvent[] = [];
  private sessionId: string;
  private readonly maxEvents = 1000;
  private readonly storageKey = 'enhanced_search_analytics';
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadFromStorage();
    this.setupPeriodicCleanup();
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.searchEvents = data.searchEvents || [];
        // Keep only recent events (last 7 days)
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        this.searchEvents = this.searchEvents.filter(event => event.timestamp > weekAgo);
      }
    } catch (error) {
      console.warn('Failed to load search analytics from storage:', error);
      this.searchEvents = [];
    }
  }
  
  private saveToStorage(): void {
    try {
      const data = {
        searchEvents: this.searchEvents.slice(-this.maxEvents),
        lastUpdated: Date.now()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save search analytics to storage:', error);
    }
  }
  
  private setupPeriodicCleanup(): void {
    // Clean up old events every hour
    setInterval(() => {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      this.searchEvents = this.searchEvents.filter(event => event.timestamp > weekAgo);
      this.saveToStorage();
    }, 60 * 60 * 1000);
  }
  
  // Detect query language
  private detectQueryLanguage(query: string): 'japanese' | 'english' | 'mixed' {
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(query);
    const hasEnglish = /[a-zA-Z]/.test(query);
    
    if (hasJapanese && hasEnglish) return 'mixed';
    if (hasJapanese) return 'japanese';
    return 'english';
  }
  
  // Detect query type based on content
  private detectQueryType(query: string): 'role' | 'skill' | 'name' | 'mixed' {
    const lowerQuery = query.toLowerCase();
    
    // Role indicators
    const roleKeywords = [
      'engineer', 'designer', 'manager', 'developer', 'founder',
      'エンジニア', 'デザイナー', 'マネージャー', '開発者', 'ファウンダー',
      'クリエーター', 'クリエイター', 'プログラマー'
    ];
    
    // Skill indicators
    const skillKeywords = [
      'react', 'python', 'javascript', 'ai', 'ml', 'node', 'vue',
      'typescript', 'java', 'go', 'rust', 'swift', 'kotlin',
      'machine learning', 'artificial intelligence', '機械学習', '人工知能'
    ];
    
    // Name indicators (typically shorter, no technical terms)
    const isLikelyName = query.length < 20 && !/\s/.test(query) && 
                        !roleKeywords.some(k => lowerQuery.includes(k)) &&
                        !skillKeywords.some(k => lowerQuery.includes(k));
    
    const hasRole = roleKeywords.some(k => lowerQuery.includes(k));
    const hasSkill = skillKeywords.some(k => lowerQuery.includes(k));
    
    if (isLikelyName) return 'name';
    if (hasRole && hasSkill) return 'mixed';
    if (hasRole) return 'role';
    if (hasSkill) return 'skill';
    return 'mixed';
  }
  
  // Calculate refinement level
  private calculateRefinementLevel(query: string): number {
    const recentQueries = this.searchEvents
      .filter(event => event.timestamp > Date.now() - 5 * 60 * 1000) // Last 5 minutes
      .map(event => event.query);
    
    let refinementLevel = 0;
    for (const recentQuery of recentQueries.reverse()) {
      if (query.includes(recentQuery) || recentQuery.includes(query)) {
        refinementLevel++;
      } else {
        break;
      }
    }
    
    return refinementLevel;
  }
  
  // Log search event with enhanced tracking
  logSearch(
    query: string,
    searchType: 'structured' | 'ai' | 'hybrid',
    results: number,
    searchTime: number,
    confidence: number = 0,
    error?: string,
    cacheHit: boolean = false,
    relevanceFactors?: any
  ): void {
    const event: SearchEvent = {
      timestamp: Date.now(),
      query: query.trim(),
      searchType,
      results,
      searchTime,
      confidence,
      success: !error && results > 0,
      error,
      sessionId: this.sessionId,
      queryLanguage: this.detectQueryLanguage(query),
      queryType: this.detectQueryType(query),
      refinementLevel: this.calculateRefinementLevel(query),
      cacheHit,
      relevanceFactors
    };
    
    this.searchEvents.push(event);
    
    // Keep only recent events in memory
    if (this.searchEvents.length > this.maxEvents) {
      this.searchEvents = this.searchEvents.slice(-this.maxEvents);
    }
    
    this.saveToStorage();
  }
  
  // Get comprehensive analytics
  getDetailedMetrics(): DetailedSearchMetrics {
    const events = this.searchEvents;
    const successfulEvents = events.filter(e => e.success);
    
    if (events.length === 0) {
      return this.getEmptyMetrics();
    }
    
    // Basic metrics
    const totalSearches = events.length;
    const successfulSearches = successfulEvents.length;
    const failedSearches = totalSearches - successfulSearches;
    const averageSearchTime = events.reduce((sum, e) => sum + e.searchTime, 0) / totalSearches;
    const averageResultsCount = successfulEvents.reduce((sum, e) => sum + e.results, 0) / Math.max(successfulEvents.length, 1);
    const averageConfidence = successfulEvents.reduce((sum, e) => sum + e.confidence, 0) / Math.max(successfulEvents.length, 1);
    
    // Pattern analysis
    const queryFrequency = new Map<string, { count: number; totalResults: number }>();
    events.forEach(event => {
      const existing = queryFrequency.get(event.query) || { count: 0, totalResults: 0 };
      queryFrequency.set(event.query, {
        count: existing.count + 1,
        totalResults: existing.totalResults + event.results
      });
    });
    
    const mostCommonQueries = Array.from(queryFrequency.entries())
      .map(([query, data]) => ({
        query,
        count: data.count,
        avgResults: data.totalResults / data.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Language distribution
    const languageDistribution = {
      japanese: events.filter(e => e.queryLanguage === 'japanese').length,
      english: events.filter(e => e.queryLanguage === 'english').length,
      mixed: events.filter(e => e.queryLanguage === 'mixed').length
    };
    
    // Search type distribution
    const typeDistribution = {
      role: events.filter(e => e.queryType === 'role').length,
      skill: events.filter(e => e.queryType === 'skill').length,
      name: events.filter(e => e.queryType === 'name').length,
      mixed: events.filter(e => e.queryType === 'mixed').length
    };
    
    // Time-based patterns
    const hourlyDistribution = new Array(24).fill(0);
    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourlyDistribution[hour]++;
    });
    
    const timeBasedPatterns = hourlyDistribution.map((count, hour) => ({ hour, searchCount: count }));
    
    // Performance metrics
    const cacheHits = events.filter(e => e.cacheHit).length;
    const cacheHitRate = cacheHits / totalSearches;
    
    const aiSearchEvents = events.filter(e => e.searchType === 'ai');
    const structuredSearchEvents = events.filter(e => e.searchType === 'structured');
    const hybridSearchEvents = events.filter(e => e.searchType === 'hybrid');
    
    const averageAISearchTime = aiSearchEvents.length > 0 ? 
      aiSearchEvents.reduce((sum, e) => sum + e.searchTime, 0) / aiSearchEvents.length : 0;
    const averageStructuredSearchTime = structuredSearchEvents.length > 0 ? 
      structuredSearchEvents.reduce((sum, e) => sum + e.searchTime, 0) / structuredSearchEvents.length : 0;
    const averageHybridSearchTime = hybridSearchEvents.length > 0 ? 
      hybridSearchEvents.reduce((sum, e) => sum + e.searchTime, 0) / hybridSearchEvents.length : 0;
    
    const errorRate = events.filter(e => e.error).length / totalSearches;
    
    // User behavior
    const queryLengthDistribution: Record<string, number> = {};
    events.forEach(event => {
      const length = event.query.length;
      const bucket = length < 5 ? 'short' : length < 15 ? 'medium' : 'long';
      queryLengthDistribution[bucket] = (queryLengthDistribution[bucket] || 0) + 1;
    });
    
    // Refinement patterns
    const refinementPatterns = events
      .filter(e => e.refinementLevel > 0)
      .map(event => {
        const previousQuery = events
          .filter(e => e.timestamp < event.timestamp && e.sessionId === event.sessionId)
          .pop()?.query || '';
        
        return {
          original: previousQuery,
          refined: event.query,
          improved: event.results > 0 && event.confidence > 0.5
        };
      });
    
    const abandonmentRate = events.filter(e => e.results === 0).length / totalSearches;
    const clickThroughRate = successfulEvents.length / totalSearches;
    
    return {
      totalSearches,
      successfulSearches,
      failedSearches,
      averageSearchTime,
      averageResultsCount,
      averageConfidence,
      
      searchPatterns: {
        mostCommonQueries,
        searchLanguageDistribution: languageDistribution,
        searchTypeDistribution: typeDistribution,
        timeBasedPatterns
      },
      
      performanceMetrics: {
        cacheHitRate,
        averageAISearchTime,
        averageStructuredSearchTime,
        averageHybridSearchTime,
        errorRate
      },
      
      userBehavior: {
        queryLengthDistribution,
        refinementPatterns,
        abandonmentRate,
        clickThroughRate
      }
    };
  }
  
  private getEmptyMetrics(): DetailedSearchMetrics {
    return {
      totalSearches: 0,
      successfulSearches: 0,
      failedSearches: 0,
      averageSearchTime: 0,
      averageResultsCount: 0,
      averageConfidence: 0,
      
      searchPatterns: {
        mostCommonQueries: [],
        searchLanguageDistribution: { japanese: 0, english: 0, mixed: 0 },
        searchTypeDistribution: { role: 0, skill: 0, name: 0, mixed: 0 },
        timeBasedPatterns: []
      },
      
      performanceMetrics: {
        cacheHitRate: 0,
        averageAISearchTime: 0,
        averageStructuredSearchTime: 0,
        averageHybridSearchTime: 0,
        errorRate: 0
      },
      
      userBehavior: {
        queryLengthDistribution: {},
        refinementPatterns: [],
        abandonmentRate: 0,
        clickThroughRate: 0
      }
    };
  }
  
  // Get search suggestions based on patterns
  getSearchSuggestions(currentQuery: string): string[] {
    const suggestions = new Set<string>();
    
    // Common queries
    const commonQueries = this.getDetailedMetrics().searchPatterns.mostCommonQueries;
    commonQueries.forEach(({ query }) => {
      if (query.toLowerCase().includes(currentQuery.toLowerCase()) || 
          currentQuery.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(query);
      }
    });
    
    // Pattern-based suggestions
    const queryType = this.detectQueryType(currentQuery);
    const relatedQueries = this.searchEvents
      .filter(e => e.queryType === queryType && e.success)
      .map(e => e.query)
      .slice(-20);
    
    relatedQueries.forEach(query => {
      if (query !== currentQuery) {
        suggestions.add(query);
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  }
  
  // Clear analytics data
  clearAnalytics(): void {
    this.searchEvents = [];
    localStorage.removeItem(this.storageKey);
  }
}

// Export singleton instance
export const enhancedSearchAnalytics = new EnhancedSearchAnalytics(); 