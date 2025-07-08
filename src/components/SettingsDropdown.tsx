import React, { useState, useRef, useEffect } from 'react';
import { Settings, ChevronDownIcon } from 'lucide-react';

interface SettingsDropdownProps {
  language: 'en' | 'ja';
  onLanguageChange: (lang: 'en' | 'ja') => void;
  filterView: 'sidebar' | 'top';
  onFilterViewChange: (view: 'sidebar' | 'top') => void;
}

export const SettingsDropdown: React.FC<SettingsDropdownProps> = ({
  language,
  onLanguageChange,
  filterView,
  onFilterViewChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label="Settings"
      >
        <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <ChevronDownIcon className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
          <div className="p-4 space-y-4">
            {/* Filter View Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter Layout
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onFilterViewChange('sidebar');
                    setIsOpen(false);
                  }}
                  className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                    filterView === 'sidebar'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Sidebar
                </button>
                <button
                  onClick={() => {
                    onFilterViewChange('top');
                    setIsOpen(false);
                  }}
                  className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                    filterView === 'top'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Top Bar
                </button>
              </div>
            </div>

            {/* Language Switcher */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onLanguageChange('en');
                    setIsOpen(false);
                  }}
                  className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                    language === 'en'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    onLanguageChange('ja');
                    setIsOpen(false);
                  }}
                  className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                    language === 'ja'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  日本語
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 