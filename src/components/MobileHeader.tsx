import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, Users, BarChart3, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from './theme-provider';

interface MobileHeaderProps {
  title: string;
  peopleCount: number;
  currentView: 'people' | 'skills';
  onViewChange: (view: 'people' | 'skills') => void;
  gridListMode: 'grid' | 'list';
  onGridListChange: (mode: 'grid' | 'list') => void;
  language: 'en' | 'ja';
  onLanguageChange: (lang: 'en' | 'ja') => void;
  filterCount: number;
  onFiltersToggle: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  peopleCount,
  currentView,
  onViewChange,
  gridListMode,
  onGridListChange,
  language,
  onLanguageChange,
  filterCount,
  onFiltersToggle
}) => {
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { theme, setTheme } = useTheme();
  const viewDropdownRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewDropdownRef.current && !viewDropdownRef.current.contains(event.target as Node)) {
        setShowViewDropdown(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getViewLabel = () => {
    if (currentView === 'skills') {
      return language === 'ja' ? 'スキルマップ' : 'Skill Map';
    }
    const modeLabel = gridListMode === 'grid' 
      ? (language === 'ja' ? 'グリッド' : 'Grid')
      : (language === 'ja' ? 'リスト' : 'List');
    const peopleLabel = language === 'ja' ? '人材' : 'People';
    return `${peopleLabel} · ${modeLabel}`;
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <>
      {/* Mobile Header - Ultra Compact */}
      <div className="md:hidden relative z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="px-4 py-3 flex items-center justify-between mobile-safe-area">
          {/* Left: Title + Count */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {title}
            </h1>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-200 dark:border-blue-700 flex-shrink-0">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                {peopleCount}
              </span>
            </div>
          </div>

          {/* Center: View Selector Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative" ref={viewDropdownRef}>
              <button
                onClick={() => setShowViewDropdown(!showViewDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 mobile-touch-target"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {getViewLabel()}
                </span>
                <ChevronDownIcon className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${showViewDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* View Dropdown */}
              {showViewDropdown && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 overflow-hidden z-[999]">
                  {/* People Options */}
                  <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                      {language === 'ja' ? '人材表示' : 'People View'}
                    </div>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          onViewChange('people');
                          onGridListChange('grid');
                          setShowViewDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors mobile-touch-target ${
                          currentView === 'people' && gridListMode === 'grid'
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="w-6 h-6 flex items-center justify-center">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{language === 'ja' ? 'グリッド表示' : 'Grid View'}</div>
                          <div className="text-xs opacity-70">{language === 'ja' ? 'カード形式で表示' : 'Card layout'}</div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          onViewChange('people');
                          onGridListChange('list');
                          setShowViewDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors mobile-touch-target ${
                          currentView === 'people' && gridListMode === 'list'
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="w-6 h-6 flex items-center justify-center">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{language === 'ja' ? 'リスト表示' : 'List View'}</div>
                          <div className="text-xs opacity-70">{language === 'ja' ? 'テーブル形式で表示' : 'Table layout'}</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Skill Map Option */}
                  <div className="p-3">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                      {language === 'ja' ? '分析表示' : 'Analysis View'}
                    </div>
                    <button
                      onClick={() => {
                        onViewChange('skills');
                        setShowViewDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors mobile-touch-target ${
                        currentView === 'skills'
                          ? 'bg-purple-600 text-white'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{language === 'ja' ? 'スキルマップ' : 'Skill Map'}</div>
                        <div className="text-xs opacity-70">{language === 'ja' ? 'スキル分析' : 'Skill analysis'}</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Filters Button */}
            {currentView === 'people' && (
              <button
                onClick={onFiltersToggle}
                className="relative flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 mobile-touch-target"
              >
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                {filterCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {filterCount}
                  </div>
                )}
              </button>
            )}
          </div>

          {/* Right: Settings */}
          <div className="relative ml-3" ref={settingsRef}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 mobile-touch-target"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Settings Dropdown */}
            {showSettings && (
              <div className="absolute top-full mt-2 right-0 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 overflow-hidden z-[999]">
                <div className="p-4 space-y-4">
                  {/* Theme Toggle */}
                  <div>
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                      {language === 'ja' ? 'テーマ' : 'Theme'}
                    </div>
                    <button
                      onClick={() => {
                        toggleTheme();
                        setShowSettings(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors mobile-touch-target"
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        {theme === 'light' ? (
                          <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        ) : (
                          <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {theme === 'light' 
                          ? (language === 'ja' ? 'ダークモード' : 'Dark Mode')
                          : (language === 'ja' ? 'ライトモード' : 'Light Mode')
                        }
                      </span>
                    </button>
                  </div>

                  {/* Language Toggle */}
                  <div>
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                      {language === 'ja' ? '言語' : 'Language'}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          onLanguageChange('en');
                          setShowSettings(false);
                        }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors mobile-touch-target ${
                          language === 'en'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => {
                          onLanguageChange('ja');
                          setShowSettings(false);
                        }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors mobile-touch-target ${
                          language === 'ja'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
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
        </div>
      </div>
    </>
  );
}; 