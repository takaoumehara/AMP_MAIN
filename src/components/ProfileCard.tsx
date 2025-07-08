import React, { useState } from 'react';

interface ProfileCardProps {
  name: string;
  role: string;
  avatar_initials: string;
  avatar_color: string;
  profileImage?: string | null;
  skills: string[];
  onClick: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  role,
  avatar_initials,
  avatar_color,
  profileImage,
  skills,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div 
      className={`relative bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-600 p-4 transition-all duration-300 transform-gpu shadow-md hover:shadow-xl hover:scale-105 group cursor-pointer`}
      onClick={onClick}
    >
      {/* Profile section */}
      <div className="flex flex-col items-center justify-center mb-2 relative z-10">
        <div className="relative mb-2">
          {profileImage && !imageError ? (
            <img 
              src={profileImage} 
              alt={name} 
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-500 shadow-sm transition-transform duration-300 group-hover:scale-110" 
              onError={handleImageError}
            />
          ) : (
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: avatar_color }}
            >
              {avatar_initials}
            </div>
          )}
        </div>
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 text-center leading-tight">{name}</h3>
        <p className="text-base font-semibold text-blue-700 dark:text-blue-400 text-center leading-tight mb-1">{role}</p>
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