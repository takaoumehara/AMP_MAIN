import { useRef, useEffect, useState } from 'react';
import { SearchIcon, Sparkles, Loader2 } from 'lucide-react';
import { ShimmerButton } from './ui/shimmer-button';
import { searchUsersWithAI } from '../utils/aiSearch';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onAISearch?: (results: string[]) => void;
}

export const SearchBar = ({ value, onChange, onAISearch }: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isAISearching, setIsAISearching] = useState(false);
  const [aiSearchError, setAiSearchError] = useState<string | null>(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleAISearch = async () => {
    if (!value.trim()) {
      setAiSearchError('Please enter a search query');
      return;
    }

    setIsAISearching(true);
    setAiSearchError(null);

    try {
      const result = await searchUsersWithAI(value);
      
      if (result.error) {
        setAiSearchError(result.error);
      } else {
        onAISearch?.(result.matchingIds);
        setAiSearchError(null);
      }
    } catch (error) {
      setAiSearchError('Failed to perform AI search');
      console.error('AI search error:', error);
    } finally {
      setIsAISearching(false);
    }
  };

  // Handle Enter key for AI search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAISearch();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-3 mb-4">
        <div className="relative w-96">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask AI about people, skills, or interests..."
            className="w-full h-10 pl-10 pr-4 text-base font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition-all outline-none"
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isAISearching}
          />
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        </div>
        <ShimmerButton 
          className="px-6 h-10 text-white font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
          background="linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)"
          shimmerColor="#60A5FA"
          onClick={handleAISearch}
          disabled={isAISearching || !value.trim()}
        >
          {isAISearching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Searching...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              AI Search
            </>
          )}
        </ShimmerButton>
      </div>
      
      {aiSearchError && (
        <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">
          {aiSearchError}
        </div>
      )}
    </div>
  );
};