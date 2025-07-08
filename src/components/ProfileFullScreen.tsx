import React, { useEffect, useRef } from 'react';
import { MapPin, ExternalLink, Github, User, Briefcase, Lightbulb, Heart, FileText, Code, Users, Calendar } from 'lucide-react';

interface ProfileFullScreenProps {
  person: any;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onFullPage: () => void;
  showFullPage: boolean;
  hasPrev: boolean;
  hasNext: boolean;
}

export const ProfileFullScreen: React.FC<ProfileFullScreenProps> = ({
  person,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  onFullPage,
  showFullPage = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrev, onNext, onClose, hasPrev, hasNext]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (!target.closest('[aria-label="Previous"]') && !target.closest('[aria-label="Next"]')) {
          onClose();
        }
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  // Helper function to render tag list
  const renderTagList = (items: string[], colorType: 'roles' | 'skills' | 'interests') => {
    if (!items || items.length === 0) return null;
    
    // Color schemes for different tag types
    const colorSchemes = {
      roles: 'bg-blue-600 dark:bg-blue-500 text-white border-blue-700 dark:border-blue-400',
      skills: 'bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-700 dark:border-emerald-400',
      interests: 'bg-purple-600 dark:bg-purple-500 text-white border-purple-700 dark:border-purple-400'
    };
    
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={index}
            className={`px-3 py-1 rounded-full text-sm font-medium border ${colorSchemes[colorType]}`}
          >
            {item}
          </span>
        ))}
      </div>
    );
  };

  // Helper function to render link with icon
  const renderLink = (url: string, label: string, icon: React.ReactNode) => {
    if (!url || url === 'N/A') return null;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
      >
        {icon}
        {label}
      </a>
    );
  };

  // Full Page Profile View
  if (showFullPage) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Back to Grid
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile Details</h1>
          </div>

          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 mb-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {person.profileImage ? (
                  <img 
                    src={person.profileImage} 
                    alt={person.name} 
                    className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-600 shadow-lg" 
                  />
                ) : (
                  <div 
                    className="flex items-center justify-center w-32 h-32 rounded-full border-4 border-white dark:border-gray-600 shadow-lg"
                    style={{ background: person.avatar_color }}
                  >
                    <span className="text-white text-4xl font-bold select-none">
                      {person.avatar_initials}
                    </span>
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {person.name}
                </h2>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-4">
                  <div className="flex items-center gap-2 text-xl text-blue-700 dark:text-blue-400">
                    <Briefcase size={20} />
                    {person.role}
                  </div>
                  {person.team && (
                    <div className="flex items-center gap-2 text-lg text-gray-600 dark:text-gray-400">
                      <MapPin size={18} />
                      {person.team}
                    </div>
                  )}
                </div>

                {/* Links */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mb-6">
                  {renderLink(person.profile_url, 'Profile', <ExternalLink size={18} />)}
                  {person.github_account && renderLink(
                    `https://github.com/${person.github_account}`,
                    'GitHub',
                    <Github size={18} />
                  )}
                </div>

                {/* Role Tags */}
                {person.roles && person.roles.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Roles</h4>
                    {renderTagList(person.roles, 'roles')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Summary/About */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <User className="text-blue-600 dark:text-blue-400" size={24} />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">About</h3>
                </div>
                {person.summary ? (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {person.summary}
                  </p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    Profile summary will be generated by AI based on available information.
                  </p>
                )}
              </div>

              {/* Specialties */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <Code className="text-green-600 dark:text-green-400" size={24} />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Specialties</h3>
                </div>
                {person.skills && person.skills.length > 0 ? (
                  renderTagList(person.skills, 'skills')
                ) : person.specialty ? (
                  <p className="text-gray-700 dark:text-gray-300">{person.specialty}</p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">No specialties listed</p>
                )}
              </div>

              {/* Interests */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="text-red-600 dark:text-red-400" size={24} />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Interests</h3>
                </div>
                {person.hobbies && person.hobbies.length > 0 ? (
                  renderTagList(person.hobbies, 'interests')
                ) : person.interests ? (
                  <p className="text-gray-700 dark:text-gray-300">{person.interests}</p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">No interests listed</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Ideas & Projects */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="text-yellow-600 dark:text-yellow-400" size={24} />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ideas & Projects</h3>
                </div>
                {person.ideas ? (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {person.ideas}
                  </p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic mb-4">No ideas listed</p>
                )}
                
                {person.recentActivity && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Recent Activity</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{person.recentActivity}</p>
                  </div>
                )}
              </div>

              {/* Detailed Project Stories */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="text-purple-600 dark:text-purple-400" size={24} />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Project Details</h3>
                </div>
                {person.project_details ? (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {person.project_details}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    Detailed project information will be added based on ongoing work and achievements.
                  </p>
                )}
              </div>

              {/* Program Participation */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="text-indigo-600 dark:text-indigo-400" size={24} />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Program Participation</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {person.concurrent_possible !== undefined && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium text-gray-800 dark:text-gray-200">Concurrent Possible</span>
                      <span className="text-gray-600 dark:text-gray-300">{String(person.concurrent_possible)}</span>
                    </div>
                  )}
                  {person.rocket_incubator !== undefined && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium text-gray-800 dark:text-gray-200">Rocket Incubator</span>
                      <span className="text-gray-600 dark:text-gray-300">{String(person.rocket_incubator)}</span>
                    </div>
                  )}
                  {person.graphai_ai_podcaster !== undefined && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium text-gray-800 dark:text-gray-200">GraphAI Podcaster</span>
                      <span className="text-gray-600 dark:text-gray-300">{String(person.graphai_ai_podcaster)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modal Card View
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 dark:bg-black dark:bg-opacity-80 overflow-auto">
      {/* Navigation Arrows */}
      <button
        onClick={onPrev}
        disabled={!hasPrev}
        className={`absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 shadow-lg transition-all text-gray-900 dark:text-gray-100 ${
          hasPrev ? 'opacity-100' : 'opacity-50 cursor-not-allowed'
        }`}
        aria-label="Previous"
      >
        <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 6 10 16 18 26"></polyline>
        </svg>
      </button>

      <button
        onClick={onNext}
        disabled={!hasNext}
        className={`absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 shadow-lg transition-all text-gray-900 dark:text-gray-100 ${
          hasNext ? 'opacity-100' : 'opacity-50 cursor-not-allowed'
        }`}
        aria-label="Next"
      >
        <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="14 6 22 16 14 26"></polyline>
        </svg>
      </button>

      {/* Modal Content */}
      <div 
        ref={modalRef} 
        className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto animate-fade-in"
      >
        {/* Header with close and expand buttons */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 rounded-t-3xl p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile Details</h2>
            <div className="flex items-center gap-2">
              {onFullPage && (
                <button
                  onClick={onFullPage}
                  className="p-2 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-full transition-colors text-blue-700 dark:text-blue-300"
                  aria-label="Full Page View"
                >
                  <ExternalLink size={20} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-900 dark:text-gray-100"
                aria-label="Close"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Avatar and Basic Info */}
            <div className="lg:w-1/3 flex flex-col items-center lg:items-start">
              {/* Avatar */}
              <div className="mb-6">
                {person.profileImage ? (
                  <img 
                    src={person.profileImage} 
                    alt={person.name} 
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 dark:border-blue-700 shadow-lg" 
                  />
                ) : (
                  <div 
                    className="flex items-center justify-center w-32 h-32 rounded-full border-4 border-blue-200 dark:border-blue-700 shadow-lg"
                    style={{ background: person.avatar_color }}
                  >
                    <span className="text-white text-4xl font-bold select-none">
                      {person.avatar_initials}
                    </span>
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="text-center lg:text-left mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {person.name}
                </h3>
                <div className="flex items-center justify-center lg:justify-start gap-2 text-lg text-blue-700 dark:text-blue-400 mb-2">
                  <Briefcase size={18} />
                  {person.role}
                </div>
                {person.team && (
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin size={16} />
                    {person.team}
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="flex flex-col gap-3 mb-6 w-full">
                {renderLink(person.profile_url, 'View Profile', <ExternalLink size={18} />)}
                {person.github_account && renderLink(
                  `https://github.com/${person.github_account}`,
                  'GitHub Profile',
                  <Github size={18} />
                )}
              </div>

              {/* Summary */}
              {person.summary && (
                <div className="w-full">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">About</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {person.summary.length > 200 ? `${person.summary.substring(0, 200)}...` : person.summary}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Detailed Information */}
            <div className="lg:w-2/3 space-y-6">
              {/* Specialties */}
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  <Code size={18} className="text-green-600 dark:text-green-400" />
                  Specialties
                </h4>
                {person.skills && person.skills.length > 0 ? (
                  renderTagList(person.skills, 'skills')
                ) : person.specialty ? (
                  <p className="text-gray-700 dark:text-gray-300">{person.specialty}</p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">No specialties listed</p>
                )}
              </div>

              {/* Interests */}
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  <Heart size={18} className="text-red-600 dark:text-red-400" />
                  Interests
                </h4>
                {person.hobbies && person.hobbies.length > 0 ? (
                  renderTagList(person.hobbies, 'interests')
                ) : person.interests ? (
                  <p className="text-gray-700 dark:text-gray-300">{person.interests}</p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">No interests listed</p>
                )}
              </div>

              {/* Ideas & Projects */}
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  <Lightbulb size={18} className="text-yellow-600 dark:text-yellow-400" />
                  Ideas & Projects
                </h4>
                {person.ideas ? (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {person.ideas}
                  </p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">No ideas listed</p>
                )}
                
                {person.recentActivity && person.recentActivity !== person.ideas && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Recent Activity</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{person.recentActivity}</p>
                  </div>
                )}
              </div>

              {/* Program Participation */}
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  <Users size={18} className="text-indigo-600 dark:text-indigo-400" />
                  Program Participation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {person.concurrent_possible !== undefined && (
                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                      <span className="font-medium text-gray-800 dark:text-gray-200">Concurrent</span>
                      <span className="text-gray-600 dark:text-gray-300">{String(person.concurrent_possible)}</span>
                    </div>
                  )}
                  {person.rocket_incubator !== undefined && (
                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                      <span className="font-medium text-gray-800 dark:text-gray-200">Rocket</span>
                      <span className="text-gray-600 dark:text-gray-300">{String(person.rocket_incubator)}</span>
                    </div>
                  )}
                  {person.graphai_ai_podcaster !== undefined && (
                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                      <span className="font-medium text-gray-800 dark:text-gray-200">GraphAI</span>
                      <span className="text-gray-600 dark:text-gray-300">{String(person.graphai_ai_podcaster)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 