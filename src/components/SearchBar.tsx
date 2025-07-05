import React, { useRef, useEffect } from 'react';
import { SearchIcon } from 'lucide-react';

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

  return <div className="flex gap-4">
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask AI about people, skills, or interests..."
          className="w-full h-14 pl-14 pr-6 text-xl font-semibold text-gray-900 placeholder-gray-400 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>
      <button className="px-8 h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-xl transition-colors">
        Search
      </button>
    </div>;
};