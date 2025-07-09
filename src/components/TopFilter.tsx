import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, SearchIcon } from 'lucide-react';
import { FilterKey } from '../App';

interface TopFilterProps {
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
  peopleData?: any[];
  language?: 'en' | 'ja';
}

export const TopFilter: React.FC<TopFilterProps> = ({ 
  filters, 
  selected, 
  onFilterChange, 
  peopleData = [],
  language = 'en'
}) => {
  const [openDropdown, setOpenDropdown] = useState<FilterKey | null>(null);
  const [searchTerms, setSearchTerms] = useState<{ [key in FilterKey]: string }>({
    roles: '',
    locations: '',
    skills: '',
    projects: '',
    interests: ''
  });
  const dropdownRefs = useRef<{ [key in FilterKey]: HTMLDivElement | null }>({
    roles: null,
    locations: null,
    skills: null,
    projects: null,
    interests: null
  });
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && dropdownRefs.current[openDropdown] && 
          !dropdownRefs.current[openDropdown]?.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);
  
  // Get localized filter section titles
  const getSectionTitle = (key: FilterKey): string => {
    const titles = {
      roles: language === 'ja' ? '役職' : 'Role',
      locations: language === 'ja' ? 'チーム' : 'Team',
      skills: language === 'ja' ? 'スキル・興味' : 'Expertise',
      projects: language === 'ja' ? 'プロジェクト' : 'Projects',
      interests: language === 'ja' ? '興味・趣味' : 'Interests'
    };
    return titles[key];
  };
  
  const getSearchPlaceholder = (key: FilterKey): string => {
    const placeholders = {
      roles: language === 'ja' ? '役職を検索...' : 'Search role...',
      locations: language === 'ja' ? 'チームを検索...' : 'Search team...',
      skills: language === 'ja' ? 'スキルを検索...' : 'Search expertise...',
      projects: language === 'ja' ? 'プロジェクトを検索...' : 'Search projects...',
      interests: language === 'ja' ? '興味を検索...' : 'Search interests...'
    };
    return placeholders[key];
  };
  
  // Filter items based on search term
  const getFilteredItems = (type: FilterKey): string[] => {
    const items = filters[type];
    const searchTerm = searchTerms[type].toLowerCase();
    if (!searchTerm) return items;
    return items.filter(item => item.toLowerCase().includes(searchTerm));
  };
  
  // Calculate counts for each filter option
  const getFilterCount = (type: FilterKey, value: string): number => {
    if (!peopleData.length) return 0;
    
    return peopleData.filter(person => {
      switch (type) {
        case 'roles':
          return Array.isArray(person.roles) && person.roles.includes(value);
        case 'locations':
          return person.team && person.team.toLowerCase().includes(value.toLowerCase());
        case 'skills':
          if (value === 'Misc') {
            const miscSkills = (window as any).miscSkills || [];
            return person.skills.some((skill: string) => miscSkills.includes(skill)) ||
                   person.hobbies.some((hobby: string) => miscSkills.includes(hobby));
          }
          return person.skills.some((skill: string) => skill.toLowerCase().includes(value.toLowerCase())) ||
                 person.hobbies.some((hobby: string) => hobby.toLowerCase().includes(value.toLowerCase()));
        case 'projects':
          return person.hobbies.some((hobby: string) => 
            hobby.toLowerCase().includes(value.toLowerCase()) &&
            (hobby.includes('プロジェクト') || hobby.includes('Project') || 
             hobby.includes('開発') || hobby.includes('Development') ||
             hobby.includes('作成') || hobby.includes('制作'))
          );
        case 'interests':
          return person.hobbies.some((hobby: string) => 
            hobby.toLowerCase().includes(value.toLowerCase()) &&
            !(hobby.includes('プロジェクト') || hobby.includes('Project') || 
              hobby.includes('開発') || hobby.includes('Development') ||
              hobby.includes('作成') || hobby.includes('制作'))
          );
        default:
          return false;
      }
    }).length;
  };

  const toggleDropdown = (key: FilterKey) => {
    setOpenDropdown(openDropdown === key ? null : key);
    if (openDropdown !== key) {
      setSearchTerms(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleSearchChange = (key: FilterKey, value: string) => {
    setSearchTerms(prev => ({ ...prev, [key]: value }));
  };

  const renderDropdown = (type: FilterKey) => {
    const isOpen = openDropdown === type;
    const selectedCount = selected[type].length;
    const filteredItems = getFilteredItems(type);
    
    // Calculate position to prevent overflow on mobile
    const getDropdownPosition = () => {
      if (typeof window === 'undefined') return 'left-0';
      const screenWidth = window.innerWidth;
      const dropdownWidth = screenWidth < 640 ? 320 : screenWidth < 768 ? 384 : screenWidth < 1024 ? 500 : screenWidth < 1280 ? 600 : 700;
      
      // If we're on mobile and this might overflow, use different positioning
      if (screenWidth < 640) {
        return 'left-0 right-0 mx-2'; // Full width with margins on mobile
      }
      return 'left-0'; // Default left alignment for larger screens
    };
    
    return (
      <div 
        key={type}
        className="relative z-[200]"
        ref={el => dropdownRefs.current[type] = el}
      >
        <button
          onClick={() => toggleDropdown(type)}
          className={`flex items-center justify-between px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-w-[120px] sm:min-w-[140px] ${
            selectedCount > 0 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
          }`}
        >
          <span className="font-medium">
            {getSectionTitle(type)}
            {selectedCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {selectedCount}
              </span>
            )}
          </span>
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className={`absolute top-full mt-1 ${getDropdownPosition()} w-80 sm:w-96 md:w-[500px] lg:w-[600px] xl:w-[700px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-[1000] max-h-80 sm:max-h-96 md:max-h-[500px] overflow-hidden`}>
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-600">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={getSearchPlaceholder(type)}
                  value={searchTerms[type]}
                  onChange={(e) => handleSearchChange(type, e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Filter Options */}
            <div className="p-3 max-h-60 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {filteredItems.map(item => {
                  const count = getFilterCount(type, item);
                  const isSelected = selected[type].includes(item);
                  
                  return (
                    <button
                      key={item}
                      onClick={() => onFilterChange(type, item)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500'
                      }`}
                    >
                      {item}
                      {count > 0 && (
                        <span className={`ml-1 text-xs font-semibold ${
                          isSelected ? 'text-blue-100' : 'text-gray-700 dark:text-gray-200'
                        }`}>
                          ({count})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {filteredItems.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                  {language === 'ja' ? '該当する項目がありません' : 'No items found'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 relative z-50">
      {(['roles', 'locations', 'skills', 'projects', 'interests'] as FilterKey[]).map(type => renderDropdown(type))}
    </div>
  );
}; 