import React, { useState } from 'react';
import { Eye, ExternalLink, Github, Star, GitFork } from 'lucide-react';
import { getPillClasses } from '../lib/pillColors';

interface PeopleListItemProps {
  person: any;
  index: number;
  onCardClick: (index: number) => void;
  onRoleClick?: (role: string) => void;
  onTeamClick?: (teamName: string) => void;
  onSkillClick?: (skill: string) => void;
  onInterestClick?: (interest: string) => void;
}

export const PeopleListItem: React.FC<PeopleListItemProps> = ({
  person,
  index,
  onCardClick,
  onRoleClick,
  onTeamClick,
  onSkillClick,
  onInterestClick,
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  // GitHub stats
  const githubStats = person.github_enhanced?.stats;
  const totalStars = githubStats?.totalStars || 0;
  const totalRepos = githubStats?.totalRepos || 0;

  return (
    <div className="px-3 sm:px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
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
          <div className="flex flex-wrap gap-1">
            {(person.roles && person.roles.length > 0) ? (
              person.roles.slice(0, 2).map((individualRole: string, index: number) => (
                <button
                  key={index}
                  onClick={() => onRoleClick?.(individualRole)}
                  className={`${getPillClasses('role', true)} text-xs`}
                >
                  {individualRole.length > 8 ? `${individualRole.substring(0, 8)}...` : individualRole}
                </button>
              ))
            ) : (
              // Fallback: split role by comma
                             person.role.split(',').map((r: string) => r.trim()).filter(Boolean).slice(0, 2).map((individualRole: string, index: number) => (
                <button
                  key={index}
                  onClick={() => onRoleClick?.(individualRole)}
                  className={`${getPillClasses('role', true)} text-xs`}
                >
                  {individualRole.length > 8 ? `${individualRole.substring(0, 8)}...` : individualRole}
                </button>
              ))
            )}
            {((person.roles && person.roles.length > 2) || (!person.roles && person.role.split(',').length > 2)) && (
              <span className={`${getPillClasses('default', false)} text-xs`}>
                +{(person.roles ? person.roles.length - 2 : person.role.split(',').length - 2)}
              </span>
            )}
          </div>
        </div>

        {/* Team Column */}
        <div className="col-span-2">
          <button
            onClick={() => onTeamClick?.(person.team)}
            className={`${getPillClasses('team', true)} max-w-full`}
          >
            <span className="truncate">
              {person.team.length > 15 ? `${person.team.substring(0, 15)}...` : person.team}
            </span>
          </button>
        </div>

        {/* Skills & Interests Column */}
        <div className="col-span-3">
          <div className="flex flex-wrap gap-1">
            {/* Skills */}
            {person.skills.slice(0, 1).map((skill: string, skillIndex: number) => (
              <button
                key={`skill-${skillIndex}`}
                onClick={() => onSkillClick?.(skill)}
                className={`${getPillClasses('skill', true)}`}
              >
                {skill.length > 10 ? `${skill.substring(0, 10)}...` : skill}
              </button>
            ))}
            {/* Interests */}
            {person.hobbies.slice(0, Math.max(0, 2 - person.skills.slice(0, 1).length)).map((hobby: string, hobbyIndex: number) => (
              <button
                key={`hobby-${hobbyIndex}`}
                onClick={() => onInterestClick?.(hobby)}
                className={`${getPillClasses('interest', true)}`}
              >
                {hobby.length > 10 ? `${hobby.substring(0, 10)}...` : hobby}
              </button>
            ))}
            {(person.skills.length + person.hobbies.length) > 2 && (
              <span className={`${getPillClasses('default', false)}`}>
                +{(person.skills.length + person.hobbies.length) - 2}
              </span>
            )}
          </div>
        </div>

        {/* GitHub Column */}
        <div className="col-span-1">
          {person.github_account ? (
            <div className="flex flex-col space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <Star className="w-3 h-3 mr-1" />
                <span>{totalStars}</span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
          )}
        </div>

        {/* Actions Column */}
        <div className="col-span-1">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onCardClick(index)}
              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </button>
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

      {/* Tablet Layout */}
      <div className="hidden md:grid lg:hidden grid-cols-8 gap-3 items-center">
        {/* Name Column */}
        <div className="col-span-3">
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              {person.profileImage && !imageError ? (
                <img
                  src={person.profileImage}
                  alt={person.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                  onError={handleImageError}
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-gray-200 dark:border-gray-600"
                  style={{ backgroundColor: person.avatar_color }}
                >
                  {person.avatar_initials}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <button
                onClick={() => onCardClick(index)}
                className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left truncate block w-full"
              >
                {person.name}
              </button>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {person.role}
              </div>
            </div>
          </div>
        </div>

        {/* Team Column */}
        <div className="col-span-2">
          <button
            onClick={() => onTeamClick?.(person.team)}
            className={`${getPillClasses('team', true)} max-w-full`}
          >
            <span className="truncate">
              {person.team.length > 10 ? `${person.team.substring(0, 10)}...` : person.team}
            </span>
          </button>
        </div>

        {/* Skills Column */}
        <div className="col-span-2">
          <div className="flex flex-wrap gap-1">
            {/* Skills */}
            {person.skills.slice(0, 1).map((skill: string, skillIndex: number) => (
              <button
                key={`skill-${skillIndex}`}
                onClick={() => onSkillClick?.(skill)}
                className={`${getPillClasses('skill', true)}`}
              >
                {skill.length > 8 ? `${skill.substring(0, 8)}...` : skill}
              </button>
            ))}
            {/* Interests */}
            {person.hobbies.slice(0, Math.max(0, 1 - person.skills.slice(0, 1).length)).map((hobby: string, hobbyIndex: number) => (
              <button
                key={`hobby-${hobbyIndex}`}
                onClick={() => onInterestClick?.(hobby)}
                className={`${getPillClasses('interest', true)}`}
              >
                {hobby.length > 8 ? `${hobby.substring(0, 8)}...` : hobby}
              </button>
            ))}
            {(person.skills.length + person.hobbies.length) > 1 && (
              <span className={`${getPillClasses('default', false)}`}>
                +{(person.skills.length + person.hobbies.length) - 1}
              </span>
            )}
          </div>
        </div>

        {/* Actions Column */}
        <div className="col-span-1">
          <div className="flex items-center justify-end space-x-1">
            <button
              onClick={() => onCardClick(index)}
              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {person.profileImage && !imageError ? (
              <img
                src={person.profileImage}
                alt={person.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                onError={handleImageError}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-gray-200 dark:border-gray-600"
                style={{ backgroundColor: person.avatar_color }}
              >
                {person.avatar_initials}
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Name and Role */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => onCardClick(index)}
                className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left truncate"
              >
                {person.name}
              </button>
              <button
                onClick={() => onCardClick(index)}
                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="View details"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
            
            {/* Role and Team */}
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex flex-wrap gap-1">
                {(person.roles && person.roles.length > 0) ? (
                  person.roles.slice(0, 2).map((individualRole: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => onRoleClick?.(individualRole)}
                      className={`${getPillClasses('role', true)} text-xs`}
                    >
                      {individualRole.length > 8 ? `${individualRole.substring(0, 8)}...` : individualRole}
                    </button>
                  ))
                ) : (
                  // Fallback: split role by comma
                  person.role.split(',').map((r: string) => r.trim()).filter(Boolean).slice(0, 2).map((individualRole: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => onRoleClick?.(individualRole)}
                      className={`${getPillClasses('role', true)} text-xs`}
                    >
                      {individualRole.length > 8 ? `${individualRole.substring(0, 8)}...` : individualRole}
                    </button>
                  ))
                )}
                {((person.roles && person.roles.length > 2) || (!person.roles && person.role.split(',').length > 2)) && (
                  <span className={`${getPillClasses('default', false)} text-xs`}>
                    +{(person.roles ? person.roles.length - 2 : person.role.split(',').length - 2)}
                  </span>
                )}
              </div>
              <button
                onClick={() => onTeamClick?.(person.team)}
                className={`${getPillClasses('team', true)}`}
              >
                {person.team.length > 12 ? `${person.team.substring(0, 12)}...` : person.team}
              </button>
            </div>
            
            {/* Skills */}
            <div className="flex flex-wrap gap-1 mt-2">
              {/* Skills */}
              {person.skills.slice(0, 1).map((skill: string, skillIndex: number) => (
                <button
                  key={`skill-${skillIndex}`}
                  onClick={() => onSkillClick?.(skill)}
                  className={`${getPillClasses('skill', true)}`}
                >
                  {skill.length > 10 ? `${skill.substring(0, 10)}...` : skill}
                </button>
              ))}
              {/* Interests */}
              {person.hobbies.slice(0, Math.max(0, 2 - person.skills.slice(0, 1).length)).map((hobby: string, hobbyIndex: number) => (
                <button
                  key={`hobby-${hobbyIndex}`}
                  onClick={() => onInterestClick?.(hobby)}
                  className={`${getPillClasses('interest', true)}`}
                >
                  {hobby.length > 10 ? `${hobby.substring(0, 10)}...` : hobby}
                </button>
              ))}
              {(person.skills.length + person.hobbies.length) > 2 && (
                <span className={`${getPillClasses('default', false)}`}>
                  +{(person.skills.length + person.hobbies.length) - 2}
                </span>
              )}
            </div>
            
            {/* GitHub Stats */}
            {person.github_account && (
              <div className="flex items-center space-x-3 mt-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  <span>{totalStars}</span>
                </div>
                <div className="flex items-center">
                  <GitFork className="w-3 h-3 mr-1" />
                  <span>{totalRepos}</span>
                </div>
                <a
                  href={`https://github.com/${person.github_account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  title="View GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 