import React, { useRef, useEffect } from 'react';
import { SearchIcon } from 'lucide-react';
import { ShimmerButton } from './ui/shimmer-button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="flex gap-3 mb-4">
      <div className="relative w-96">
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask AI about people, skills, or interests..."
          className="w-full h-10 pl-10 pr-4 text-base font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition-all outline-none"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
      </div>
      <ShimmerButton 
        className="px-6 h-10 text-white font-medium text-base"
        background="linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)"
        shimmerColor="#60A5FA"
      >
        Search
      </ShimmerButton>
    </div>
  );
};