import React, { useState, useRef, useEffect } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';
import { FilterKey } from '../App';

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    roles: string[];
    locations: string[];
    skills: string[];
    projects: string[];
    interests: string[];
  };
  selected: {
    roles: string[];
    locations: string[];
    skills: string[];
    projects: string[];
    interests: string[];
  };
  onFilterChange: (type: FilterKey, value: string) => void;
  onClearAll: () => void;
  language: 'en' | 'ja';
  peopleData: any[];
}

export const MobileFilterSheet: React.FC<MobileFilterSheetProps> = ({
  isOpen,
  onClose,
  filters,
  selected,
  onFilterChange,
  onClearAll,
  language,
  peopleData
}) => {
  const [expandedSection, setExpandedSection] = useState<FilterKey | null>('roles');
  const [searchTerms, setSearchTerms] = useState<{ [key in FilterKey]: string }>({
    roles: '',
    locations: '',
    skills: '',
    projects: '',
    interests: ''
  });
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ isDragging: false, startY: 0, currentY: 0 });

  // Calculate filter counts
  const getFilterCount = (type: FilterKey, value: string): number => {
    if (!peopleData.length) return 0;
    
    return peopleData.filter(person => {
      switch (type) {
        case 'roles':
          return Array.isArray(person.roles) && person.roles.includes(value);
        case 'locations':
          return person.team && person.team.toLowerCase().includes(value.toLowerCase());
        case 'skills':
          return person.skills.some((skill: string) => skill.toLowerCase().includes(value.toLowerCase())) ||
                 person.hobbies.some((hobby: string) => hobby.toLowerCase().includes(value.toLowerCase()));
        case 'projects':
          return person.hobbies.some((hobby: string) => 
            hobby.toLowerCase().includes(value.toLowerCase()) &&
            (hobby.includes('プロジェクト') || hobby.includes('Project'))
          );
        case 'interests':
          return person.hobbies.some((hobby: string) => 
            hobby.toLowerCase().includes(value.toLowerCase()) &&
            !(hobby.includes('プロジェクト') || hobby.includes('Project'))
          );
        default:
          return false;
      }
    }).length;
  };

  const getSectionTitle = (key: FilterKey): string => {
    const titles = {
      roles: language === 'ja' ? '役職' : 'Roles',
      locations: language === 'ja' ? 'チーム' : 'Teams',
      skills: language === 'ja' ? 'スキル' : 'Skills',
      projects: language === 'ja' ? 'プロジェクト' : 'Projects',
      interests: language === 'ja' ? '興味・趣味' : 'Interests'
    };
    return titles[key];
  };

  const getFilteredItems = (type: FilterKey) => {
    const searchTerm = searchTerms[type].toLowerCase();
    return filters[type].filter(item => 
      item.toLowerCase().includes(searchTerm)
    );
  };

  const getTotalSelectedCount = () => {
    return Object.values(selected).reduce((total, arr) => total + arr.length, 0);
  };

  // Handle touch events for swipe-to-close
  const handleTouchStart = (e: React.TouchEvent) => {
    dragRef.current.isDragging = true;
    dragRef.current.startY = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragRef.current.isDragging) return;
    
    dragRef.current.currentY = e.touches[0].clientY;
    const deltaY = dragRef.current.currentY - dragRef.current.startY;
    
    if (deltaY > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!dragRef.current.isDragging) return;
    
    const deltaY = dragRef.current.currentY - dragRef.current.startY;
    
    if (deltaY > 100) {
      onClose();
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(0)';
    }
    
    dragRef.current.isDragging = false;
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent background scrolling when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] md:hidden"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl z-[999] h-[95vh] md:hidden mobile-hide-scrollbar flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          animation: isOpen ? 'mobile-slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : undefined
        }}
      >
        {/* Drag Handle - Compact */}
        <div className="flex justify-center pt-2 pb-1 flex-shrink-0">
          <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>

        {/* Header - Compact */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {language === 'ja' ? 'フィルター' : 'Filters'}
              </h2>
              {getTotalSelectedCount() > 0 && (
                <div className="px-1.5 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
                  {getTotalSelectedCount()}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              {getTotalSelectedCount() > 0 && (
                <button
                  onClick={onClearAll}
                  className="px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  {language === 'ja' ? 'クリア' : 'Clear'}
                </button>
              )}
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick Stats - Compact */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/30 flex-shrink-0">
            <div className="flex items-center justify-center gap-6 text-center">
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {peopleData.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {language === 'ja' ? '総人数' : 'People'}
                </div>
              </div>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {Object.values(filters).flat().length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {language === 'ja' ? 'フィルター項目' : 'Options'}
                </div>
              </div>
            </div>
          </div>

          {/* Filter Sections */}
          <div className="p-4 space-y-4 pb-8">
            {(['roles', 'locations', 'skills', 'projects', 'interests'] as FilterKey[]).map(type => (
              <div key={type} className="space-y-3 border border-blue-100 dark:border-blue-900/50 rounded-xl p-3 bg-white/50 dark:bg-gray-800/30">
                {/* Section Header */}
                <button
                  onClick={() => setExpandedSection(expandedSection === type ? null : type)}
                  className="w-full flex items-center justify-between py-3 mobile-touch-target"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {getSectionTitle(type)}
                    </h3>
                    {selected[type].length > 0 && (
                      <div className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                        {selected[type].length}
                      </div>
                    )}
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedSection === type ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* Section Content */}
                {expandedSection === type && (
                  <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={language === 'ja' ? `${getSectionTitle(type)}を検索...` : `Search ${getSectionTitle(type).toLowerCase()}...`}
                        value={searchTerms[type]}
                        onChange={(e) => setSearchTerms(prev => ({ ...prev, [type]: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 mobile-search-input bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>

                    {/* Filter Options with improved scrolling */}
                    <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto mobile-hide-scrollbar">
                      {getFilteredItems(type).map(item => {
                        const count = getFilterCount(type, item);
                        const isSelected = selected[type].includes(item);
                        
                        return (
                          <button
                            key={item}
                            onClick={() => onFilterChange(type, item)}
                            className={`flex items-center justify-between p-4 rounded-xl text-left transition-all mobile-touch-target ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-md transform scale-[1.02]'
                                : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                            }`}
                          >
                            <span className="font-medium text-sm">{item}</span>
                            <div className="flex items-center gap-3">
                              <span className={`text-sm font-semibold ${
                                isSelected ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                ({count})
                              </span>
                              {isSelected && (
                                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {getFilteredItems(type).length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <div className="text-sm">
                          {language === 'ja' ? '該当する項目がありません' : 'No items found'}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer - Compact */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors mobile-touch-target text-sm"
          >
            {language === 'ja' ? '完了' : 'Done'}
          </button>
        </div>
      </div>
    </>
  );
}; 