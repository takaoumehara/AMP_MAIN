import React, { useEffect, useRef } from 'react';

interface ProfileCardProps {
  name: string;
  avatar_initials: string;
  avatar_color: string;
  role: string;
  skills: string[];
  hobbies: string[];
  recentActivity: string;
  profile_url?: string;
  github_account?: string;
  team?: string;
  specialty?: string;
  ideas?: string;
  interests?: string;
  profileImage?: string | null;
}

export const ProfileCard = ({
  name,
  avatar_initials,
  avatar_color,
  role,
  skills,
  hobbies,
  recentActivity,
  profile_url,
  github_account,
  team,
  specialty,
  ideas,
  interests,
  profileImage,
}: ProfileCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleScroll = () => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const scrollProgress = rect.top / window.innerHeight;
        cardRef.current.style.transform = `translateY(${scrollProgress * 10}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={cardRef} className="relative bg-white rounded-3xl border border-gray-200 p-10 transition-all duration-300 transform-gpu hover:shadow-2xl cursor-pointer min-h-[360px] flex flex-col gap-6 w-full max-w-2xl mx-auto md:min-h-[400px] md:max-w-3xl lg:min-h-[440px] lg:max-w-4xl card-hover">
      <div className="flex items-center gap-8 mb-2 flex-col md:flex-row">
        <div className="flex-shrink-0 flex items-center justify-center w-28 h-28 rounded-full">
          {profileImage ? (
            <img src={profileImage} alt={name} className="w-28 h-28 rounded-full object-cover" />
          ) : (
            <div className="flex items-center justify-center w-28 h-28 rounded-full" style={{ background: avatar_color }}>
              <span className="text-white text-4xl font-bold select-none">{avatar_initials}</span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-3xl md:text-4xl text-gray-900 mb-1 leading-tight">{name}</h3>
          <p className="text-lg text-blue-700 mb-1">{role}</p>
          {team && <p className="text-md text-gray-500">Team: {team}</p>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {skills && skills.map((skill: string) => <span key={skill} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">{skill}</span>)}
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {hobbies && hobbies.map((hobby: string) => <span key={hobby} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">{hobby}</span>)}
      </div>
      {specialty && <div className="text-md text-gray-700"><b>Specialty:</b> {specialty}</div>}
      {ideas && <div className="text-md text-gray-700"><b>Ideas:</b> {ideas}</div>}
      {recentActivity && <div className="text-md text-gray-700"><b>Recent Activity:</b> {recentActivity}</div>}
      {interests && <div className="text-md text-gray-700"><b>Interests:</b> {interests}</div>}
      <div className="flex gap-4 mt-2">
        {profile_url && profile_url !== 'N/A' && (
          <a href={profile_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">Profile</a>
        )}
        {github_account && (
          <a href={`https://github.com/${github_account}`} target="_blank" rel="noopener noreferrer" className="text-gray-700 underline text-sm flex items-center gap-1">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.11 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.91.08 2.11.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
            GitHub
          </a>
        )}
      </div>
    </div>
  );
};