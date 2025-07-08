import { useEffect, useState, useRef } from 'react';
import { MessageCircleIcon, UserPlusIcon } from 'lucide-react';
import { Sparkles } from './ui/sparkles';

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
      className={`relative bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-600 p-4 transition-all duration-300 transform-gpu shadow-md hover:shadow-xl hover:scale-105 group`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sparkles effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Sparkles
          className="absolute inset-0 pointer-events-none"
          color="#3B82F6"
          count={15}
          speed="fast"
          size="small"
        />
      </div>
      
      <div className="flex flex-col items-center justify-center mb-2 relative z-10">
        <div className="relative mb-2">
          {profileImage ? (
            <img 
              src={profileImage} 
              alt={name} 
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-500 shadow-sm transition-transform duration-300 group-hover:scale-110" 
            />
          ) : (
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center bg-gray-300 transition-transform duration-300 group-hover:scale-110"
              style={{ background: avatar_color }}
            >
              <span className="text-white text-2xl font-bold select-none">{avatar_initials}</span>
            </div>
          )}
        </div>
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 text-center leading-tight">{name}</h3>
        <p className="text-base font-semibold text-blue-700 dark:text-blue-400 text-center leading-tight mb-1">{role}</p>
        {team && <p className="text-xs text-gray-500 dark:text-gray-400 text-center truncate max-w-[120px]">{team}</p>}
      </div>
      <div className="flex flex-wrap gap-2 justify-center mt-2 relative z-10">
        {skills && skills.slice(0, 2).map(skill => (
          <span 
            key={skill} 
            className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md font-medium transition-colors duration-200 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/50"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};