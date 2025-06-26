import React from 'react';
import { Users2Icon, HomeIcon, SettingsIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

export type FilterKey = 'roles' | 'teams' | 'specialties' | 'interests';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  filters: {
    roles: string[];
    teams: string[];
    specialties: string[];
    interests: string[];
  };
  selected: {
    roles: string[];
    teams: string[];
    specialties: string[];
    interests: string[];
  };
  onFilterChange: (type: FilterKey, value: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, filters, selected, onFilterChange }) => {
  return (
    <div className={`h-full bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-16' : 'w-72'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h1 className={`text-xl font-semibold text-gray-900 transition-all duration-300 ${collapsed ? 'hidden' : 'block'}`}>Filters</h1>
        <button onClick={onToggle} className="p-2 rounded hover:bg-gray-100">
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>
      {!collapsed && (
        <div className="p-4 space-y-6 overflow-y-auto">
          <div>
            <div className="font-semibold mb-2">Profession</div>
            <div className="flex flex-wrap gap-2">
              {filters.roles.map(role => (
                <label key={role} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={selected.roles.includes(role)} onChange={() => onFilterChange('roles', role)} />
                  {role}
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Team</div>
            <div className="flex flex-wrap gap-2">
              {filters.teams.map(team => (
                <label key={team} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={selected.teams.includes(team)} onChange={() => onFilterChange('teams', team)} />
                  {team}
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Specialty</div>
            <div className="flex flex-wrap gap-2">
              {filters.specialties.map(spec => (
                <label key={spec} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={selected.specialties.includes(spec)} onChange={() => onFilterChange('specialties', spec)} />
                  {spec}
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Interests</div>
            <div className="flex flex-wrap gap-2">
              {filters.interests.map(interest => (
                <label key={interest} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={selected.interests.includes(interest)} onChange={() => onFilterChange('interests', interest)} />
                  {interest}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};