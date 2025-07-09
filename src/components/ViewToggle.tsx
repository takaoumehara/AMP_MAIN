import React from 'react';
import { Grid3x3, List, Users } from 'lucide-react';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  totalCount?: number;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  currentView,
  onViewChange,
  totalCount = 0,
}) => {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Count display */}
      <div className="flex items-center gap-1 sm:gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Users className="w-4 h-4" />
        <span className="hidden xs:inline">{totalCount} {totalCount === 1 ? 'person' : 'people'}</span>
        <span className="xs:hidden">{totalCount}</span>
      </div>
      
      {/* View toggle buttons */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => onViewChange('grid')}
          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            currentView === 'grid'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
          title="Grid view"
        >
          <Grid3x3 className="w-4 h-4" />
          <span className="hidden sm:inline">Grid</span>
        </button>
        
        <button
          onClick={() => onViewChange('list')}
          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            currentView === 'list'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
          title="List view"
        >
          <List className="w-4 h-4" />
          <span className="hidden sm:inline">List</span>
        </button>
      </div>
    </div>
  );
}; 