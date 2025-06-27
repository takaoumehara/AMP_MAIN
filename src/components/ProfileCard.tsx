import { useEffect, useState, useRef } from 'react';
import { MessageCircleIcon, UserPlusIcon } from 'lucide-react';

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
  language?: 'en' | 'ja';
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
  language = 'en'
}: ProfileCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout>();

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setLongPressActive(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    setLongPressActive(false);
  };

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
    <div 
      ref={cardRef} 
      className={`relative bg-white rounded-xl border border-gray-200 p-6 transition-all duration-300 transform-gpu 
        ${isExpanded ? 'scale-[1.02] shadow-xl' : 'hover:shadow-lg'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="relative">
            {profileImage ? (
              <img 
                src={profileImage} 
                alt={name} 
                className="w-12 h-12 rounded-full object-cover transform-gpu transition-transform hover:scale-105" 
              />
            ) : (
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center transform-gpu transition-transform hover:scale-105"
                style={{ background: avatar_color }}
              >
                <span className="text-white text-sm font-bold select-none">{avatar_initials}</span>
              </div>
            )}
            <span className="absolute bottom-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{role}</p>
            {team && <p className="text-xs text-gray-400">Team: {team}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors">
            <MessageCircleIcon className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors">
            <UserPlusIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {skills && skills.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2">SKILLS</h4>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span 
                  key={skill} 
                  className="relative px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded-md 
                    transition-all duration-300 hover:bg-gradient-to-r from-blue-50 to-blue-100
                    before:absolute before:inset-0 before:rounded-md before:bg-blue-400/0
                    hover:before:bg-blue-400/10 before:transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {hobbies && hobbies.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2">HOBBIES</h4>
            <div className="flex flex-wrap gap-2">
              {hobbies.map(hobby => (
                <span 
                  key={hobby} 
                  className="px-2 py-1 bg-gray-50 text-gray-600 text-sm rounded-md transition-colors hover:bg-gray-100"
                >
                  {hobby}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {recentActivity && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2">
              RECENT ACTIVITY
            </h4>
            <p className="text-sm text-gray-600">{recentActivity}</p>
          </div>
        )}

        {specialty && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2">SPECIALTY</h4>
            <p className="text-sm text-gray-600">{specialty}</p>
          </div>
        )}

        {ideas && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2">IDEAS</h4>
            <p className="text-sm text-gray-600">{ideas}</p>
          </div>
        )}

        {interests && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2">INTERESTS</h4>
            <p className="text-sm text-gray-600">{interests}</p>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
        {profile_url && profile_url !== 'N/A' && (
          <a href={profile_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Profile
          </a>
        )}
        {github_account && (
          <a href={`https://github.com/${github_account}`} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-800 text-sm font-medium flex items-center gap-1">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.11 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.91.08 2.11.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            GitHub
          </a>
        )}
      </div>

      {longPressActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 space-y-2">
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
              View Profile
            </button>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
              Send Message
            </button>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
              Add to Team
            </button>
          </div>
        </div>
      )}
    </div>
  );
};