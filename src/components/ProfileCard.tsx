import React, { useState } from 'react';
import { MapPin, Sparkles, Calendar, Github, Star, Code } from 'lucide-react';

interface GitHubEnhanced {
  profile: {
    name: string | null;
    bio: string | null;
    company: string | null;
    location: string | null;
    blog: string | null;
    twitter_username: string | null;
    public_repos: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
    avatar_url: string;
    html_url: string;
  };
  stats: {
    totalStars: number;
    totalRepos: number;
    isActive: boolean;
    lastActive: string | null;
  };
  languages: {
    topLanguages: string[];
    languageStats: { [key: string]: number };
  };
  topRepos: Array<{
    name: string;
    description: string | null;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    html_url: string;
    topics: string[];
    updated_at: string;
  }>;
}

interface ProfileCardProps {
  name: string;
  role: string;
  avatar_initials: string;
  avatar_color: string;
  profileImage?: string | null;
  skills: string[];
  hobbies: string[];
  team: string;
  recentActivity: string;
  github_enhanced?: GitHubEnhanced;
  onClick: () => void;
  onTeamClick?: (teamName: string) => void;
  onSkillClick?: (skill: string) => void;
  onInterestClick?: (interest: string) => void;
}

// Updated color palette for skill tags - more vibrant and professional
const skillColors = [
  { bg: 'bg-blue-600 dark:bg-blue-500', text: 'text-white', border: 'border-blue-700 dark:border-blue-400' },
  { bg: 'bg-emerald-600 dark:bg-emerald-500', text: 'text-white', border: 'border-emerald-700 dark:border-emerald-400' },
  { bg: 'bg-purple-600 dark:bg-purple-500', text: 'text-white', border: 'border-purple-700 dark:border-purple-400' },
  { bg: 'bg-orange-600 dark:bg-orange-500', text: 'text-white', border: 'border-orange-700 dark:border-orange-400' },
  { bg: 'bg-pink-600 dark:bg-pink-500', text: 'text-white', border: 'border-pink-700 dark:border-pink-400' },
  { bg: 'bg-indigo-600 dark:bg-indigo-500', text: 'text-white', border: 'border-indigo-700 dark:border-indigo-400' },
  { bg: 'bg-red-600 dark:bg-red-500', text: 'text-white', border: 'border-red-700 dark:border-red-400' },
  { bg: 'bg-teal-600 dark:bg-teal-500', text: 'text-white', border: 'border-teal-700 dark:border-teal-400' },
];

// Hash function to consistently assign colors to skills
const getSkillColor = (skill: string) => {
  let hash = 0;
  for (let i = 0; i < skill.length; i++) {
    hash = skill.charCodeAt(i) + ((hash << 5) - hash);
  }
  return skillColors[Math.abs(hash) % skillColors.length];
};

// Generate AI-like highlights based on available data including GitHub
const generateHighlight = (person: { skills: string[], hobbies: string[], recentActivity: string, role: string, github_enhanced?: GitHubEnhanced }) => {
  // Priority 1: GitHub bio if available
  if (person.github_enhanced?.profile.bio) {
    return person.github_enhanced.profile.bio.length > 80 ? 
      person.github_enhanced.profile.bio.substring(0, 80) + '...' : 
      person.github_enhanced.profile.bio;
  }
  
  // Priority 2: Recent activity
  if (person.recentActivity && person.recentActivity.trim()) {
    return person.recentActivity.length > 60 ? person.recentActivity.substring(0, 60) + '...' : person.recentActivity;
  }
  
  // Priority 3: GitHub activity-based highlights
  if (person.github_enhanced) {
    const gh = person.github_enhanced;
    const topLang = gh.languages.topLanguages[0];
    const topRepo = gh.topRepos[0];
    
    if (topRepo && topLang) {
      return `Building ${topRepo.name} with ${topLang}`;
    }
    
    if (topLang) {
      return `Active ${topLang} developer`;
    }
    
    if (gh.stats.isActive) {
      return `Active on GitHub with ${gh.stats.totalRepos} repositories`;
    }
  }
  
  // Priority 4: Generate highlights based on skills and hobbies
  const allInterests = [...person.skills, ...person.hobbies];
  if (allInterests.length > 0) {
    const topInterest = allInterests[0];
    const highlights = [
      `Passionate about ${topInterest}`,
      `Building with ${topInterest}`,
      `Exploring ${topInterest}`,
      `Creating with ${topInterest}`,
      `Focused on ${topInterest}`,
    ];
    return highlights[Math.floor(Math.random() * highlights.length)];
  }
  
  return `${person.role} making an impact`;
};

export const ProfileCard: React.FC<ProfileCardProps> = React.memo(({
  name,
  role,
  avatar_initials,
  avatar_color,
  profileImage,
  skills,
  hobbies,
  team,
  recentActivity,
  github_enhanced,
  onClick,
  onTeamClick,
  onSkillClick,
  onInterestClick,
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  // Combine skills and hobbies for tag display
  const allTags = [...skills, ...hobbies];
  const displayTags = allTags.slice(0, 3);
  
  // Generate highlight
  const highlight = generateHighlight({ skills, hobbies, recentActivity, role, github_enhanced });

  return (
    <div 
      className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-600 p-6 transition-all duration-300 transform-gpu shadow-lg hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 cursor-pointer overflow-hidden h-[400px] flex flex-col"
      onClick={onClick}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Profile section */}
        <div className="flex flex-col items-center mb-4">
          {/* Large profile image */}
          <div className="relative mb-3">
            {profileImage && !imageError ? (
              <img 
                src={profileImage} 
                alt={name} 
                className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:border-blue-200 dark:group-hover:border-blue-600" 
                onError={handleImageError}
              />
            ) : (
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl border-4 border-white dark:border-gray-700 group-hover:border-blue-200 dark:group-hover:border-blue-600"
                style={{ backgroundColor: avatar_color }}
              >
                {avatar_initials}
              </div>
            )}
          </div>
          
          {/* Name - Bold and scannable */}
          <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 text-center leading-tight mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {name}
          </h3>
          
          {/* Role - Primary title */}
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 text-center leading-tight mb-3 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300">
            {role}
          </p>
        </div>

        {/* Team label and GitHub stats */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {team && (
            <div 
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300 cursor-pointer border border-transparent hover:border-blue-300 dark:hover:border-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                onTeamClick?.(team);
              }}
            >
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{team}</span>
            </div>
          )}
          
          {/* GitHub activity indicator */}
          {github_enhanced && (
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-900 dark:bg-gray-600 rounded-full text-xs font-medium text-white transition-colors duration-300">
              <Github className="w-3 h-3" />
              {github_enhanced.stats.isActive && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
              <span className="text-xs">{github_enhanced.stats.totalRepos}</span>
            </div>
          )}
        </div>

        {/* Color-coded skill tags */}
        <div className="flex flex-wrap gap-2 justify-center mb-4 min-h-[32px]">
          {displayTags.map((tag, index) => {
            const colors = getSkillColor(tag);
            const isSkill = skills.includes(tag);
            const isHobby = hobbies.includes(tag);
            
            return (
              <span 
                key={`${tag}-${index}`}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-300 hover:scale-110 hover:shadow-md flex items-center justify-center cursor-pointer ${colors.bg} ${colors.text} ${colors.border} hover:brightness-110`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isSkill) {
                    onSkillClick?.(tag);
                  } else if (isHobby) {
                    onInterestClick?.(tag);
                  }
                }}
              >
                {tag.length > 12 ? tag.substring(0, 12) + '...' : tag}
              </span>
            );
          })}
        </div>

        {/* Recent activity highlight - flex-grow to take remaining space */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 group-hover:bg-gray-100 dark:group-hover:bg-gray-600/50 transition-colors duration-300 flex-grow flex flex-col">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-yellow-500 group-hover:text-yellow-600 transition-colors duration-300" />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300 line-clamp-4">
              {highlight}
            </p>
          </div>
        </div>

        {/* Hover animation indicator */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Subtle border glow on hover */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 dark:group-hover:border-blue-600 transition-colors duration-300 pointer-events-none" />
    </div>
  );
});