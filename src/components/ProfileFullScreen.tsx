import React, { useEffect, useRef } from 'react';

function getProfileImage(profileImage: string | null, profile_url: string | undefined, fallback: string) {
  if (profileImage) return profileImage;
  if (profile_url && profile_url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return profile_url;
  return fallback;
}

interface ProfileFullScreenProps {
  person: {
    name: string;
    role: string;
    avatar_initials: string;
    avatar_color: string;
    profileImage?: string | null;
    skills: string[];
    hobbies: string[];
    recentActivity: string;
    profile_url?: string;
    github_account?: string;
    team?: string;
    specialty?: string;
    ideas?: string;
    interests?: string;
    concurrent_possible?: boolean | string;
    rocket_incubator?: string | boolean;
    graphai_ai_podcaster?: string | boolean;
  };
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onFullPage?: () => void;
  showFullPage?: boolean;
  language?: 'en' | 'ja';
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
  language = 'en',
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
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const imageUrl = getProfileImage(person.profileImage || null, person.profile_url, person.avatar_initials);

  if (showFullPage) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Back to Grid
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Full Profile</h1>
          </div>

          {/* Full page content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Avatar and basic info */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="flex flex-col items-center text-center">
                  {person.profileImage ? (
                    <img src={person.profileImage} alt={person.name} className="w-48 h-48 rounded-full object-cover border-4 border-blue-200 mb-6" />
                  ) : (
                    <div className="flex items-center justify-center w-48 h-48 rounded-full mb-6" style={{ background: person.avatar_color }}>
                      <span className="text-white text-6xl font-bold select-none">{person.avatar_initials}</span>
                    </div>
                  )}
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">{person.name}</h2>
                  <p className="text-2xl text-blue-700 mb-2">{person.role}</p>
                  {person.team && <p className="text-lg text-gray-500 mb-4">Team: {person.team}</p>}
                  <div className="flex gap-4 mb-6">
                    {person.profile_url && person.profile_url !== 'N/A' && (
                      <a href={person.profile_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">Profile</a>
                    )}
                    {person.github_account && (
                      <a href={`https://github.com/${person.github_account}`} target="_blank" rel="noopener noreferrer" className="text-gray-700 underline text-sm flex items-center gap-1">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.11 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.91.08 2.11.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Detailed information */}
            <div className="lg:col-span-2 space-y-8">
              {/* Skills */}
              {person.skills && person.skills.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-3">
                    {person.skills.map((skill: string) => (
                      <span key={skill} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Hobbies */}
              {person.hobbies && person.hobbies.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Hobbies & Interests</h3>
                  <div className="flex flex-wrap gap-3">
                    {person.hobbies.map((hobby: string) => (
                      <span key={hobby} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm">{hobby}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Specialty */}
              {person.specialty && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Specialty</h3>
                  <p className="text-lg text-gray-700 leading-relaxed">{person.specialty}</p>
                </div>
              )}

              {/* Ideas */}
              {person.ideas && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Ideas & Projects</h3>
                  <p className="text-lg text-gray-700 leading-relaxed">{person.ideas}</p>
                </div>
              )}

              {/* Recent Activity */}
              {person.recentActivity && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h3>
                  <p className="text-lg text-gray-700 leading-relaxed">{person.recentActivity}</p>
                </div>
              )}

              {/* Additional Interests */}
              {person.interests && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Additional Interests</h3>
                  <p className="text-lg text-gray-700 leading-relaxed">{person.interests}</p>
                </div>
              )}

              {/* Program Participation */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Program Participation</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {person.concurrent_possible !== undefined && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Concurrent Possible</h4>
                      <p className="text-gray-700">{String(person.concurrent_possible)}</p>
                    </div>
                  )}
                  {person.rocket_incubator !== undefined && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Rocket Incubator</h4>
                      <p className="text-gray-700">{String(person.rocket_incubator)}</p>
                    </div>
                  )}
                  {person.graphai_ai_podcaster !== undefined && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">GraphAI Podcaster</h4>
                      <p className="text-gray-700">{String(person.graphai_ai_podcaster)}</p>
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 overflow-auto">
      <div ref={modalRef} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl mx-4 p-10 flex flex-col md:flex-row gap-10 animate-fade-in min-h-[60vh] max-h-[90vh] overflow-auto">
        {/* X Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 rounded-full p-2 shadow z-10"
          aria-label="Close"
        >
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {/* Full Page Button */}
        {onFullPage && (
          <button
            onClick={onFullPage}
            className="absolute top-4 right-16 bg-blue-100 hover:bg-blue-200 rounded-full p-2 shadow z-10"
            aria-label="Full Page View"
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6"></path>
              <path d="M10 14 21 3"></path>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            </svg>
          </button>
        )}

        {/* Avatar and Basic Info */}
        <div className="flex flex-col items-center md:items-start md:w-1/3 gap-4">
          {person.profileImage ? (
            <img src={person.profileImage} alt={person.name} className="w-40 h-40 rounded-full object-cover border-4 border-blue-200 mb-2" />
          ) : (
            <div className="flex items-center justify-center w-40 h-40 rounded-full mb-2" style={{ background: person.avatar_color }}>
              <span className="text-white text-4xl font-bold select-none">{person.avatar_initials}</span>
            </div>
          )}
          <h2 className="text-4xl font-bold text-gray-900 mb-1">{person.name}</h2>
          <p className="text-2xl text-blue-700 mb-1">{person.role}</p>
          {person.team && <p className="text-lg text-gray-500 mb-1">Team: {person.team}</p>}
          <div className="flex flex-wrap gap-2 mb-2">
            {person.skills && person.skills.map(skill => (
              <span key={skill} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">{skill}</span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {person.hobbies && person.hobbies.map(hobby => (
              <span key={hobby} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">{hobby}</span>
            ))}
          </div>
          <div className="flex gap-4 mt-2">
            {person.profile_url && person.profile_url !== 'N/A' && (
              <a href={person.profile_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">Profile</a>
            )}
            {person.github_account && (
              <a href={`https://github.com/${person.github_account}`} target="_blank" rel="noopener noreferrer" className="text-gray-700 underline text-sm flex items-center gap-1">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.11 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.91.08 2.11.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
                GitHub
              </a>
            )}
          </div>
        </div>
        {/* Rich Content */}
        <div className="flex-1 flex flex-col justify-between gap-4">
          <div>
            {person.specialty && <div className="mb-2"><span className="font-semibold text-gray-800">Specialty:</span> <span className="text-gray-700">{person.specialty}</span></div>}
            {person.ideas && <div className="mb-2"><span className="font-semibold text-gray-800">Ideas:</span> <span className="text-gray-700">{person.ideas}</span></div>}
            {person.recentActivity && <div className="mb-2"><span className="font-semibold text-gray-800">Recent Activity:</span> <span className="text-gray-700">{person.recentActivity}</span></div>}
            {person.interests && <div className="mb-2"><span className="font-semibold text-gray-800">Interests:</span> <span className="text-gray-700">{person.interests}</span></div>}
            {person.concurrent_possible !== undefined && <div className="mb-2"><span className="font-semibold text-gray-800">Concurrent Possible:</span> <span className="text-gray-700">{String(person.concurrent_possible)}</span></div>}
            {person.rocket_incubator !== undefined && <div className="mb-2"><span className="font-semibold text-gray-800">Rocket Incubator:</span> <span className="text-gray-700">{String(person.rocket_incubator)}</span></div>}
            {person.graphai_ai_podcaster !== undefined && <div className="mb-2"><span className="font-semibold text-gray-800">GraphAI Podcaster:</span> <span className="text-gray-700">{String(person.graphai_ai_podcaster)}</span></div>}
          </div>
          {/* Navigation Arrows */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className={`p-2 rounded-full ${hasPrev ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
              aria-label="Previous"
            >
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 6 12 12 18 18"></polyline></svg>
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className={`p-2 rounded-full ${hasNext ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
              aria-label="Next"
            >
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="10 6 16 12 10 18"></polyline></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 