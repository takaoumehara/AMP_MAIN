import React, { useState } from 'react';
import { Eye, ExternalLink, Github, Star, GitFork, MapPin } from 'lucide-react';

interface PeopleListItemProps {
  person: any;
  index: number;
  onCardClick: (index: number) => void;
  onTeamClick?: (teamName: string) => void;
  onSkillClick?: (skill: string) => void;
  onInterestClick?: (interest: string) => void;
}

export const PeopleListItem: React.FC<PeopleListItemProps> = ({
  person,
  index,
  onCardClick,
  onTeamClick,
  onSkillClick,
  onInterestClick,
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  // Combine skills and hobbies for display
  const allSkills = [...(person.skills || []), ...(person.hobbies || [])];
  const displaySkills = allSkills.slice(0, 3);
  const remainingCount = allSkills.length - 3;

  // GitHub stats
  const githubStats = person.github_enhanced?.stats;
  const totalStars = githubStats?.totalStars || 0;
  const totalRepos = githubStats?.totalRepos || 0;

  return (
    <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Name Column */}
        <div className="col-span-3">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {person.profileImage && !imageError ? (
                <img
                  src={person.profileImage}
                  alt={person.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                  onError={handleImageError}
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-gray-200 dark:border-gray-600"
                  style={{ backgroundColor: person.avatar_color }}
                >
                  {person.avatar_initials}
                </div>
              )}
            </div>
            
            {/* Name */}
            <div className="min-w-0 flex-1">
              <button
                onClick={() => onCardClick(index)}
                className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left truncate block w-full"
              >
                {person.name}
              </button>
            </div>
          </div>
        </div>

        {/* Role Column */}
        <div className="col-span-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {person.role}
          </span>
        </div>

        {/* Team Column */}
        <div className="col-span-2">
          <button
            onClick={() => onTeamClick?.(person.team)}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
          >
            <MapPin className="w-3 h-3 mr-1" />
            {person.team.length > 15 ? `${person.team.substring(0, 15)}...` : person.team}
          </button>
        </div>

        {/* Skills & Interests Column */}
        <div className="col-span-3">
          <div className="flex flex-wrap gap-1">
            {displaySkills.map((skill, skillIndex) => (
              <button
                key={skillIndex}
                onClick={() => onSkillClick?.(skill)}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                {skill.length > 12 ? `${skill.substring(0, 12)}...` : skill}
              </button>
            ))}
            {remainingCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                +{remainingCount}
              </span>
            )}
          </div>
        </div>

        {/* GitHub Column */}
        <div className="col-span-1">
          {person.github_account ? (
            <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <Star className="w-3 h-3 mr-1" />
                <span>{totalStars}</span>
              </div>
              <div className="flex items-center">
                <GitFork className="w-3 h-3 mr-1" />
                <span>{totalRepos}</span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
          )}
        </div>

        {/* Actions Column */}
        <div className="col-span-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onCardClick(index)}
              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {person.profile_url && person.profile_url !== 'N/A' && (
              <a
                href={person.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                title="View profile"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {person.github_account && (
              <a
                href={`https://github.com/${person.github_account}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                title="View GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 