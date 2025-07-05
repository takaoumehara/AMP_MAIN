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
      className={`relative bg-white rounded-xl border border-gray-200 p-4 transition-all duration-300 transform-gpu shadow-md hover:shadow-xl`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex flex-col items-center justify-center mb-2">
        <div className="relative mb-2">
          {profileImage ? (
            <img 
              src={profileImage} 
              alt={name} 
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm" 
            />
          ) : (
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center bg-gray-300"
              style={{ background: avatar_color }}
            >
              <span className="text-white text-2xl font-bold select-none">{avatar_initials}</span>
            </div>
          )}
        </div>
        <h3 className="font-bold text-lg text-gray-900 text-center leading-tight">{name}</h3>
        <p className="text-base font-semibold text-blue-700 text-center leading-tight mb-1">{role}</p>
        {team && <p className="text-xs text-gray-500 text-center truncate max-w-[120px]">{team}</p>}
      </div>
      <div className="flex flex-wrap gap-2 justify-center mt-2">
        {skills && skills.slice(0, 2).map(skill => (
          <span 
            key={skill} 
            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};