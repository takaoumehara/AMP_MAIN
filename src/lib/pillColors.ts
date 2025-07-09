// Unified pill color system for the entire application
export interface PillColor {
  bg: string;
  text: string;
  border: string;
  hover: string;
}

export const pillColors = {
  // Role colors - Blue theme
  role: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-700',
    hover: 'hover:bg-blue-200 dark:hover:bg-blue-800/50'
  },
  
  // Team colors - Purple theme
  team: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-800 dark:text-purple-200',
    border: 'border-purple-200 dark:border-purple-700',
    hover: 'hover:bg-purple-200 dark:hover:bg-purple-800/50'
  },
  
  // Skill colors - Green theme
  skill: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-200 dark:border-green-700',
    hover: 'hover:bg-green-200 dark:hover:bg-green-800/50'
  },
  
  // Interest colors - Red theme
  interest: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-200 dark:border-red-700',
    hover: 'hover:bg-red-200 dark:hover:bg-red-800/50'
  },
  
  // Programming language colors - Indigo theme
  language: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    text: 'text-indigo-800 dark:text-indigo-200',
    border: 'border-indigo-200 dark:border-indigo-700',
    hover: 'hover:bg-indigo-200 dark:hover:bg-indigo-800/50'
  },
  
  // Default/fallback colors - Gray theme
  default: {
    bg: 'bg-gray-100 dark:bg-gray-600',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-500',
    hover: 'hover:bg-gray-200 dark:hover:bg-gray-500'
  }
};

// Get pill color classes for a specific type
export const getPillColor = (type: 'role' | 'team' | 'skill' | 'interest' | 'language' | 'default'): PillColor => {
  return pillColors[type] || pillColors.default;
};

// Generate a complete pill class string
export const getPillClasses = (type: 'role' | 'team' | 'skill' | 'interest' | 'language' | 'default', clickable = false): string => {
  const color = getPillColor(type);
  const baseClasses = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${color.bg} ${color.text} ${color.border}`;
  
  if (clickable) {
    return `${baseClasses} cursor-pointer ${color.hover}`;
  }
  
  return baseClasses;
}; 