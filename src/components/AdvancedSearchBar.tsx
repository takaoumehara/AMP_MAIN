import { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { SearchIcon, Sparkles, Loader2, TrendingUp, Clock, X, Settings } from 'lucide-react';
import { ShimmerButton } from './ui/shimmer-button';
import { performHybridSearch, HybridSearchResponse, searchAnalytics } from '../utils/hybridSearch';
import { searchUsersWithFallback } from '../utils/aiSearch';
import { searchWithCache } from '../utils/searchCache';
import { enhancedSearchAnalytics } from '../utils/enhancedSearchAnalytics';
import { expandSearchTerms } from '../utils/synonymMapping';
import { performScoredSearch } from '../utils/advancedScoredSearch';

interface AdvancedSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearchResults?: (results: HybridSearchResponse) => void;
  onAISearch?: (results: string[]) => void;
}

interface SearchSuggestion {
  text: string;
  type: 'recent' | 'trending' | 'suggestion';
  count?: number;
}

export const AdvancedSearchBar = ({ value, onChange, onSearchResults, onAISearch }: AdvancedSearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchMode, setSearchMode] = useState<'hybrid' | 'ai' | 'structured' | 'scored'>('hybrid');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchStats, setSearchStats] = useState<any>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((query: string) => {
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  }, [recentSearches]);

  // Generate intelligent search suggestions
  const generateSuggestions = useCallback((query: string): SearchSuggestion[] => {
    if (!query.trim()) {
      return [
        ...recentSearches.slice(0, 5).map(search => ({
          text: search,
          type: 'recent' as const
        })),
        // Get trending queries from analytics
        ...enhancedSearchAnalytics.getDetailedMetrics().searchPatterns.mostCommonQueries
          .slice(0, 4)
          .map(({ query, count }) => ({
            text: query,
            type: 'trending' as const,
            count
          }))
      ];
    }

    const suggestions: SearchSuggestion[] = [];

    // Recent searches that match
    recentSearches.forEach(search => {
      if (search.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push({ text: search, type: 'recent' });
      }
    });

    // Analytics-based suggestions
    const analyticsSuggestions = enhancedSearchAnalytics.getSearchSuggestions(query);
    analyticsSuggestions.forEach(suggestion => {
      if (!suggestions.some(s => s.text === suggestion)) {
        suggestions.push({ text: suggestion, type: 'suggestion' });
      }
    });

    // Synonym expansion suggestions
    const expandedTerms = expandSearchTerms(query);
    expandedTerms.forEach(term => {
      if (term !== query.toLowerCase() && !suggestions.some(s => s.text.toLowerCase() === term)) {
        suggestions.push({ text: term, type: 'suggestion' });
      }
    });

    // Common search patterns with multilingual support
    const commonPatterns = [
      // English patterns
      'designer', 'developer', 'engineer', 'manager', 'PM',
      'frontend', 'backend', 'fullstack', 'AI', 'ML', 'data',
      'React', 'Vue', 'Angular', 'Python', 'JavaScript', 'TypeScript',
      'mobile', 'iOS', 'Android', 'web', 'API', 'database',
      // Japanese patterns
      'デザイナー', 'エンジニア', 'マネージャー', '開発者', 'プログラマー',
      'クリエーター', 'クリエイター', 'フロントエンド', 'バックエンド',
      '人工知能', '機械学習', 'データサイエンス', 'モバイル開発'
    ];

    const lowerQuery = query.toLowerCase();
    commonPatterns.forEach(pattern => {
      if (pattern.toLowerCase().includes(lowerQuery) || lowerQuery.includes(pattern.toLowerCase())) {
        if (!suggestions.some(s => s.text.toLowerCase() === pattern.toLowerCase())) {
          suggestions.push({ text: pattern, type: 'suggestion' });
        }
      }
    });

    return suggestions.slice(0, 8);
  }, [recentSearches]);

  // Update suggestions when input changes
  useEffect(() => {
    setSuggestions(generateSuggestions(value));
  }, [value, generateSuggestions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setShowSuggestions(true);
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Handle search execution
  const handleSearch = async (searchQuery?: string) => {
    const query = searchQuery || value;
    if (!query.trim()) {
      setSearchError('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setShowSuggestions(false);

    try {
      let results: HybridSearchResponse;

      if (searchMode === 'hybrid') {
        results = await searchWithCache(query, performHybridSearch);
      } else if (searchMode === 'ai') {
        const aiResult = await searchUsersWithFallback(query);
        results = {
          results: aiResult.matchingIds.map(id => ({
            id,
            score: 0.8,
            source: 'ai' as const,
            matchedFields: ['ai_match'],
            confidence: aiResult.confidence || 0.7
          })),
          totalResults: aiResult.matchingIds.length,
          searchTime: 0,
          sources: {
            structured: [],
            ai: aiResult.matchingIds.map(id => ({
              id,
              score: 0.8,
              source: 'ai' as const,
              matchedFields: ['ai_match'],
              confidence: aiResult.confidence || 0.7
            })),
            hybrid: []
          },
          error: aiResult.error
        };
      } else if (searchMode === 'scored') {
        // New scored search system
        const scoredResult = await performScoredSearch(query);
        results = {
          results: scoredResult.results.map(r => ({
            id: r.id,
            score: r.score / 100, // Normalize to 0-1 range
            source: 'hybrid' as const,
            matchedFields: r.matchedTerms,
            confidence: Math.min(r.score / 100, 1)
          })),
          totalResults: scoredResult.totalFound,
          searchTime: scoredResult.processingTime,
          sources: {
            structured: [],
            ai: [],
            hybrid: scoredResult.results.map(r => ({
              id: r.id,
              score: r.score / 100,
              source: 'hybrid' as const,
              matchedFields: r.matchedTerms,
              confidence: Math.min(r.score / 100, 1)
            }))
          },
          error: scoredResult.results.length === 0 ? 'No results found' : undefined
        };
      } else {
        // Structured search only
        results = await searchWithCache(query, performHybridSearch);
        results.results = results.sources.structured;
      }

      if (results.error) {
        setSearchError(results.error);
      } else {
        onSearchResults?.(results);
        onAISearch?.(results.results.map(r => r.id));
        saveRecentSearch(query);
        
        // Log analytics
        searchAnalytics.logSearch(query, results);
        setSearchStats(searchAnalytics.getSearchStats());
        
        // Enhanced analytics logging
        enhancedSearchAnalytics.logSearch(
          query,
          searchMode as any,
          results.results.length,
          results.searchTime,
          results.results.reduce((sum, r) => sum + r.confidence, 0) / Math.max(results.results.length, 1),
          results.error,
          false, // cacheHit - would need to track this
          results.results[0]?.relevanceFactors
        );
      }
    } catch (error) {
      setSearchError('Search failed. Please try again.');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    handleSearch(suggestion.text);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Calculate dropdown position
  const updateDropdownPosition = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, []);

  // Update position when showing suggestions
  useEffect(() => {
    if (showSuggestions && inputRef.current) {
      updateDropdownPosition();
      
      // Update position on scroll/resize
      const handleUpdate = () => updateDropdownPosition();
      window.addEventListener('scroll', handleUpdate);
      window.addEventListener('resize', handleUpdate);
      
      return () => {
        window.removeEventListener('scroll', handleUpdate);
        window.removeEventListener('resize', handleUpdate);
      };
    }
  }, [showSuggestions, updateDropdownPosition]);

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="flex gap-3 mb-4">
        <div className="relative max-w-lg">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search people, skills, or interests... (Cmd+K)"
            className="w-full h-12 pl-12 pr-16 text-base font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition-all outline-none"
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            disabled={isSearching}
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          
          {/* Search Mode Selector */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <select
              value={searchMode}
              onChange={(e) => setSearchMode(e.target.value as any)}
              className="text-xs bg-transparent border-none outline-none text-gray-500 dark:text-gray-400"
            >
              <option value="hybrid">Hybrid</option>
              <option value="scored">Scored</option>
              <option value="ai">AI Only</option>
              <option value="structured">Structured</option>
            </select>
          </div>
        </div>
        
        <ShimmerButton 
          className="px-6 h-12 text-white font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
          background="linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)"
          shimmerColor="#60A5FA"
          onClick={() => handleSearch()}
          disabled={isSearching || !value.trim()}
        >
          {isSearching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Searching...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Search
            </>
          )}
        </ShimmerButton>
      </div>

      {/* Search Suggestions - Portal with calculated positioning */}
      {showSuggestions && suggestions.length > 0 && createPortal(
        <div 
          className="fixed bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-xl max-h-80 overflow-y-auto"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            zIndex: 999999
          }}
        >
          {/* Recent Searches Header */}
          {recentSearches.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Searches</span>
              </div>
              <button
                onClick={clearRecentSearches}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded transition-colors"
              >
                Clear
              </button>
            </div>
          )}
          
          {/* Suggestions List */}
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-3 group transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              {suggestion.type === 'recent' && (
                <Clock className="h-4 w-4 text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              )}
              {suggestion.type === 'trending' && (
                <TrendingUp className="h-4 w-4 text-green-500 group-hover:text-green-600 dark:group-hover:text-green-400" />
              )}
              {suggestion.type === 'suggestion' && (
                <SearchIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              )}
              
              <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                {suggestion.text}
              </span>
              
              {suggestion.count && (
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {suggestion.count} results
                </span>
              )}
            </button>
          ))}
        </div>,
        document.body
      )}

      {/* Error Display */}
      {searchError && (
        <div className="mb-4 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2">
          <X className="h-4 w-4" />
          {searchError}
        </div>
      )}

      {/* Search Stats */}
      {searchStats && (
        <div className="mb-4 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-4">
          <span>Total searches: {searchStats.totalSearches}</span>
          <span>Avg time: {searchStats.averageSearchTime?.toFixed(0)}ms</span>
          <span>Success rate: {(searchStats.successRate * 100).toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
}; 