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
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, filters, selected, onFilterChange }) => {
  const [open, setOpen] = useState<{ [key in FilterKey]: boolean }>({ roles: true, locations: true, skills: true });
  const toggleSection = (key: FilterKey) => setOpen(prev => ({ ...prev, [key]: !prev[key] }));
  return (
    <div className={`h-full bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-16' : 'w-72'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h1 className={`text-xl font-semibold text-gray-900 transition-all duration-300 ${collapsed ? 'hidden' : 'block'}`}>Discover</h1>
        <button onClick={onToggle} className="p-2 rounded hover:bg-gray-100">
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>
      {!collapsed && (
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Role Section */}
          <div>
            <div className="flex items-center justify-between cursor-pointer mb-2" onClick={() => toggleSection('roles')}>
              <span className="font-semibold">Role</span>
              {open.roles ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </div>
            {open.roles && (
              <div className="flex flex-wrap gap-2 mb-2">
                {filters.roles.map(role => (
                  <button
                    key={role}
                    className={`px-3 py-1 rounded-full border text-sm transition-colors ${selected.roles.includes(role) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-100'}`}
                    onClick={() => onFilterChange('roles', role)}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Location Section */}
          <div>
            <div className="flex items-center justify-between cursor-pointer mb-2" onClick={() => toggleSection('locations')}>
              <span className="font-semibold">Team</span>
              {open.locations ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </div>
            {open.locations && (
              <div className="flex flex-wrap gap-2 mb-2">
                {filters.locations.map(location => (
                  <button
                    key={location}
                    className={`px-3 py-1 rounded-full border text-sm transition-colors ${selected.locations.includes(location) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-100'}`}
                    onClick={() => onFilterChange('locations', location)}
                  >
                    {location}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Skills Section */}
          <div>
            <div className="flex items-center justify-between cursor-pointer mb-2" onClick={() => toggleSection('skills')}>
              <span className="font-semibold">Skills</span>
              {open.skills ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </div>
            {open.skills && (
              <div className="flex flex-wrap gap-2 mb-2">
                {filters.skills.map(skill => (
                  <button
                    key={skill}
                    className={`px-3 py-1 rounded-full border text-sm transition-colors ${selected.skills.includes(skill) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-100'}`}
                    onClick={() => onFilterChange('skills', skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};