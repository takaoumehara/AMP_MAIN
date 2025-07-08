import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

export type FilterKey = 'roles' | 'locations' | 'skills';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  filters: {
    roles: string[];
    locations: string[];
    skills: string[];
  };
  selected: {
    roles: string[];
    locations: string[];
    skills: string[];
  };
  onFilterChange: (type: FilterKey, value: string) => void;
  peopleData?: any[]; // Added to calculate counts
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  onToggle, 
  filters, 
  selected, 
  onFilterChange, 
  peopleData = [] 
}) => {
  const [open, setOpen] = useState<{ [key in FilterKey]: boolean }>({ 
    roles: true, 
    locations: true, 
    skills: true 
  });
  
  const toggleSection = (key: FilterKey) => setOpen(prev => ({ ...prev, [key]: !prev[key] }));
  
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
        default:
          return false;
      }
    }).length;
  };

  const renderFilterButton = (type: FilterKey, value: string) => {
    const count = getFilterCount(type, value);
    const isSelected = selected[type].includes(value);
    
    return (
      <button
        key={value}
        className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors w-full ${
          isSelected 
            ? 'bg-blue-600 text-white border-blue-600' 
            : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'
        }`}
        onClick={() => onFilterChange(type, value)}
      >
        <span className="truncate">{value}</span>
        <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
          isSelected 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}>
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className={`h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${collapsed ? 'w-16' : 'w-72'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <h1 className={`text-xl font-semibold text-gray-900 dark:text-gray-100 transition-all duration-300 ${collapsed ? 'hidden' : 'block'}`}>
          Filters
        </h1>
        <button onClick={onToggle} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>
      
      {!collapsed && (
        <div className="p-4 space-y-6 overflow-y-auto h-full">
          {/* Role Section */}
          <div>
            <div className="flex items-center justify-between cursor-pointer mb-3" onClick={() => toggleSection('roles')}>
              <span className="font-semibold text-gray-900 dark:text-gray-100">Role</span>
              {open.roles ? <ChevronUpIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" /> : <ChevronDownIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
            </div>
            {open.roles && (
              <div className="space-y-2">
                {filters.roles.map(role => renderFilterButton('roles', role))}
              </div>
            )}
          </div>

          {/* Location Section */}
          <div>
            <div className="flex items-center justify-between cursor-pointer mb-3" onClick={() => toggleSection('locations')}>
              <span className="font-semibold text-gray-900 dark:text-gray-100">Team</span>
              {open.locations ? <ChevronUpIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" /> : <ChevronDownIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
            </div>
            {open.locations && (
              <div className="space-y-2">
                {filters.locations.map(location => renderFilterButton('locations', location))}
              </div>
            )}
          </div>

          {/* Skills Section */}
          <div>
            <div className="flex items-center justify-between cursor-pointer mb-3" onClick={() => toggleSection('skills')}>
              <span className="font-semibold text-gray-900 dark:text-gray-100">Skills & Interests</span>
              {open.skills ? <ChevronUpIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" /> : <ChevronDownIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
            </div>
            {open.skills && (
              <div className="space-y-2">
                {filters.skills.map(skill => renderFilterButton('skills', skill))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};