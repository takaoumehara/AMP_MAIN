import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Sparkles, Loader2 } from 'lucide-react';

interface MobileSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearchResults?: (results: any) => void;
  onAISearch?: (results: string[]) => void;
  language: 'en' | 'ja';
  isVisible: boolean;
}

export const MobileSearch: React.FC<MobileSearchProps> = ({
  value,
  onChange,
  onSearchResults,
  onAISearch,
  language,
  isVisible
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAISearch = async () => {
    if (!value.trim() || !onAISearch) return;
    
    setIsSearching(true);
    try {
      // Simulate AI search - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      onAISearch(['1', '2', '3']); // Mock results
    } catch (error) {
      console.error('AI search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.metaKey || e.ctrlKey) {
        handleAISearch();
      }
    }
  };

  const clearSearch = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const getPlaceholder = () => {
    return language === 'ja' 
      ? 'スキル、役職、チームで検索...'
      : 'Search skills, roles, teams...';
  };

  if (!isVisible) return null;

  return (
    <div className={`md:hidden transition-all duration-300 ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      {/* Search Container */}
      <div className="px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="relative">
          {/* Search Input */}
          <div className={`relative transition-all duration-200 ${
            isFocused ? 'transform scale-[1.02]' : ''
          }`}>
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            
            <input
              ref={inputRef}
              type="text"
              placeholder={getPlaceholder()}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`w-full pl-12 pr-20 py-4 mobile-search-input bg-gray-50 dark:bg-gray-800 border-2 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                isFocused 
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                  : 'border-gray-200 dark:border-gray-600'
              }`}
            />
            
            {/* Right side buttons */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {value && (
                <button
                  onClick={clearSearch}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              )}
              
              {value.trim() && onAISearch && (
                <button
                  onClick={handleAISearch}
                  disabled={isSearching}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium transition-colors mobile-touch-target"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">
                        {language === 'ja' ? '検索中...' : 'Searching...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm">AI</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Search Tips */}
          {isFocused && !value && (
            <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <div className="font-medium mb-2">
                  {language === 'ja' ? '検索のヒント:' : 'Search Tips:'}
                </div>
                <ul className="space-y-1 text-xs">
                  <li>• {language === 'ja' ? 'スキル名で検索（例: React, Python）' : 'Search by skills (e.g., React, Python)'}</li>
                  <li>• {language === 'ja' ? '役職で検索（例: エンジニア、デザイナー）' : 'Search by roles (e.g., Engineer, Designer)'}</li>
                  <li>• {language === 'ja' ? 'チーム名で検索' : 'Search by team names'}</li>
                  <li>• {language === 'ja' ? 'AI検索ボタンで自然語検索' : 'Use AI button for natural language search'}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Filter Pills (when search is active) */}
      {value && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex gap-2 overflow-x-auto pb-2 mobile-hide-scrollbar">
            {['Role', 'Skill', 'Team', 'Project'].map(filter => (
              <button
                key={filter}
                className="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 