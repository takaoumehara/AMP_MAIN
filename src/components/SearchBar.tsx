import React from 'react';
import { SearchIcon } from 'lucide-react';
export const SearchBar = () => {
  return <div className="flex gap-4">
      <div className="relative flex-1">
        <input type="text" placeholder="Ask AI about people, skills, or interests..." className="w-full h-14 pl-14 pr-6 text-lg rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>
      <button className="px-8 h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
        Search
      </button>
    </div>;
};