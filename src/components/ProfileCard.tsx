import React, { useEffect, useState, useRef } from 'react';
import { MessageCircleIcon, UserPlusIcon, MoreVerticalIcon } from 'lucide-react';
interface ProfileCardProps {
  name: string;
  role: string;
  avatar: string;
  skills: string[];
  hobbies: string[];
  recentActivity: string;
}
export const ProfileCard = ({
  name,
  role,
  avatar,
  skills,
  hobbies,
  recentActivity
}: ProfileCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
  return <div ref={cardRef} className={`relative bg-white rounded-xl border border-gray-200 p-6 transition-all duration-300 transform-gpu 
        ${isExpanded ? 'scale-[1.02] shadow-xl' : 'hover:shadow-lg'}
        ${showMobileMenu ? 'translate-x-[-100px]' : 'translate-x-0'}`} onMouseEnter={() => setIsExpanded(true)} onMouseLeave={() => setIsExpanded(false)} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="relative">
            <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover transform-gpu transition-transform hover:scale-105" />
            <span className="absolute bottom-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{role}</p>
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
        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-2">SKILLS</h4>
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => <span key={skill} className="relative px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded-md 
                  transition-all duration-300 hover:bg-gradient-to-r from-blue-50 to-blue-100
                  before:absolute before:inset-0 before:rounded-md before:bg-blue-400/0
                  hover:before:bg-blue-400/10 before:transition-colors">
                {skill}
              </span>)}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-2">HOBBIES</h4>
          <div className="flex flex-wrap gap-2">
            {hobbies.map(hobby => <span key={hobby} className="px-2 py-1 bg-gray-50 text-gray-600 text-sm rounded-md transition-colors hover:bg-gray-100">
                {hobby}
              </span>)}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-2">
            RECENT ACTIVITY
          </h4>
          <p className="text-sm text-gray-600">{recentActivity}</p>
        </div>
      </div>
      {longPressActive && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
        </div>}
    </div>;
};