import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Eye, ExternalLink, Github } from 'lucide-react';
import { PeopleListItem } from './PeopleListItem';

interface PeopleListProps {
  people: any[];
  onCardClick: (index: number) => void;
  onTeamClick?: (teamName: string) => void;
  onSkillClick?: (skill: string) => void;
  onInterestClick?: (interest: string) => void;
}

type SortField = 'name' | 'role' | 'team' | 'skillCount' | 'githubStars';
type SortOrder = 'asc' | 'desc';

export const PeopleList: React.FC<PeopleListProps> = ({
  people,
  onCardClick,
  onTeamClick,
  onSkillClick,
  onInterestClick,
}) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Sort functionality
  const sortedPeople = useMemo(() => {
    return [...people].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'role':
          aValue = a.role.toLowerCase();
          bValue = b.role.toLowerCase();
          break;
        case 'team':
          aValue = a.team.toLowerCase();
          bValue = b.team.toLowerCase();
          break;
        case 'skillCount':
          aValue = (a.skills?.length || 0) + (a.hobbies?.length || 0);
          bValue = (b.skills?.length || 0) + (b.hobbies?.length || 0);
          break;
        case 'githubStars':
          aValue = a.github_enhanced?.stats?.totalStars || 0;
          bValue = b.github_enhanced?.stats?.totalStars || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [people, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1" />
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 px-6 py-4">
        <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <div className="col-span-3">
            <button
              onClick={() => handleSort('name')}
              className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Name
              <SortIcon field="name" />
            </button>
          </div>
          <div className="col-span-2">
            <button
              onClick={() => handleSort('role')}
              className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Role
              <SortIcon field="role" />
            </button>
          </div>
          <div className="col-span-2">
            <button
              onClick={() => handleSort('team')}
              className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Team
              <SortIcon field="team" />
            </button>
          </div>
          <div className="col-span-3">
            <button
              onClick={() => handleSort('skillCount')}
              className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Skills & Interests
              <SortIcon field="skillCount" />
            </button>
          </div>
          <div className="col-span-1">
            <button
              onClick={() => handleSort('githubStars')}
              className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              GitHub
              <SortIcon field="githubStars" />
            </button>
          </div>
          <div className="col-span-1">
            <span>Actions</span>
          </div>
        </div>
      </div>

      {/* List Items */}
      <div className="divide-y divide-gray-200 dark:divide-gray-600">
        {sortedPeople.map((person, index) => (
          <PeopleListItem
            key={person.id}
            person={person}
            index={index}
            onCardClick={onCardClick}
            onTeamClick={onTeamClick}
            onSkillClick={onSkillClick}
            onInterestClick={onInterestClick}
          />
        ))}
      </div>

      {/* Empty State */}
      {people.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No people found</p>
        </div>
      )}
    </div>
  );
}; 