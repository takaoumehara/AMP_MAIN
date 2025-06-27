import React, { useState, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { SearchBar } from './components/SearchBar';
import { PeopleGrid } from './components/PeopleGrid';
import peopleData from './data/people.json';
import { ProfileFullScreen } from './components/ProfileFullScreen';

function uniq(arr: string[]): string[] {
  return Array.from(new Set(arr.filter(Boolean)));
}

// Team color mapping
const teamColors: { [key: string]: string } = {
  'CommunityRadio EchoLab (tentative)': '#1E88E5',
  'come come club (tentative)': '#43A047',
  'altermis (tentative)': '#F4511E',
  'Jinarashi': '#8E24AA',
  'EchoLab (tentative)': '#FDD835',
  'Gabon': '#00ACC1',
  'TBD': '#D81B60',
  'default': '#9E9E9E'
};

// Function to extract profile images from all links
function extractProfileImage(person: any): string | null {
  const links = [
    person.profile_url,
    person.github_account ? `https://github.com/${person.github_account}` : null,
    // Add more potential image sources here
  ].filter(Boolean);

  for (const link of links) {
    if (link && typeof link === 'string') {
      // Check if it's already an image URL
      if (link.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return link;
      }
      
      // For GitHub, try to get avatar
      if (link.includes('github.com') && person.github_account) {
        return `https://github.com/${person.github_account}.png`;
      }
      
      // For LinkedIn, we can't easily get profile images due to restrictions
      // But we could potentially use a service like Gravatar if email is available
    }
  }
  
  // Try to extract from various profile URLs
  if (person.profile_url && person.profile_url !== 'N/A') {
    const url = person.profile_url.toLowerCase();
    
    // Check for common image hosting services
    if (url.includes('imgur.com') || url.includes('flickr.com') || url.includes('500px.com')) {
      return person.profile_url;
    }
    
    // Check for social media profile images (these are usually not accessible)
    if (url.includes('linkedin.com') || url.includes('twitter.com') || url.includes('facebook.com')) {
      // For these, we'll rely on GitHub avatars instead
      if (person.github_account) {
        return `https://github.com/${person.github_account}.png`;
      }
    }
  }
  
  return null;
}

// Process people data to add profile images and team-based colors
const processedPeopleData = peopleData.map(person => {
  const profileImage = extractProfileImage(person);
  const teamColor = person.team ? teamColors[person.team] || teamColors.default : teamColors.default;
  
  return {
    ...person,
    profileImage,
    avatar_color: teamColor, // Override with team-based color
  };
});

interface Filters {
  roles: string[];
  teams: string[];
  specialties: string[];
  interests: string[];
}

function extractFilters(people: any[]): Filters {
  // Use English fields for filter extraction
  return {
    roles: uniq(people.map((p: any) => p.role_en).flatMap((r: string) => r ? r.split(/[、,，/]/).map((s: string) => s.trim()) : [])),
    teams: uniq(people.map((p: any) => p.team_en).flatMap((t: string) => t ? t.split(/[、,，/]/).map((s: string) => s.trim()) : [])),
    specialties: uniq(people.map((p: any) => p.specialty_en).flatMap((s: string) => s ? s.split(/[、,，/]/).map((x: string) => x.trim()) : [])),
    interests: uniq(people.map((p: any) => p.interests_en).flatMap((i: string) => i ? i.split(/[、,，/]/).map((x: string) => x.trim()) : [])),
  };
}

type FilterKey = keyof Filters;

export function App() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showFullPage, setShowFullPage] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Filters>({
    roles: [],
    teams: [],
    specialties: [],
    interests: [],
  });
  const [language, setLanguage] = useState<'en' | 'ja'>('en');

  const filters = useMemo(() => extractFilters(processedPeopleData), []);

  const handleCardClick = useCallback((index: number) => {
    setSelectedIndex(index);
    setShowFullPage(false);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
    setShowFullPage(false);
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev !== null && prev < filteredPeople.length - 1 ? prev + 1 : prev));
  }, []);

  const handleFullPage = useCallback(() => {
    setShowFullPage(true);
  }, []);

  const handleSidebarToggle = () => setSidebarCollapsed(c => !c);

  const handleFilterChange = (type: FilterKey, value: string) => {
    setSelectedFilters(prev => {
      const arr = prev[type];
      return {
        ...prev,
        [type]: arr.includes(value) ? arr.filter((v: string) => v !== value) : [...arr, value],
      };
    });
  };

  // Language switcher handler
  const handleLanguageSwitch = (lang: 'en' | 'ja') => setLanguage(lang);

  // Filter people by search and selected filters, and map fields by language
  const filteredPeople = processedPeopleData.filter(person => {
    const q = search.toLowerCase();
    // Use language-specific fields for search
    const matchesSearch =
      (person[`name_${language}`] && person[`name_${language}`].toLowerCase().includes(q)) ||
      (person[`role_${language}`] && person[`role_${language}`].toLowerCase().includes(q)) ||
      (person[`team_${language}`] && person[`team_${language}`].toLowerCase().includes(q)) ||
      (person[`specialty_${language}`] && person[`specialty_${language}`].toLowerCase().includes(q)) ||
      (person[`ideas_${language}`] && person[`ideas_${language}`].toLowerCase().includes(q)) ||
      (person[`interests_${language}`] && person[`interests_${language}`].toLowerCase().includes(q)) ||
      (person[`skills_${language}`] && person[`skills_${language}`].join(' ').toLowerCase().includes(q)) ||
      (person[`hobbies_${language}`] && person[`hobbies_${language}`].join(' ').toLowerCase().includes(q));
    // Filter by selected filters (language-specific)
    const matchesFilters =
      (selectedFilters.roles.length === 0 || selectedFilters.roles.some(r => person[`role_${language}`] && person[`role_${language}`].includes(r))) &&
      (selectedFilters.teams.length === 0 || selectedFilters.teams.some(t => person[`team_${language}`] && person[`team_${language}`].includes(t))) &&
      (selectedFilters.specialties.length === 0 || selectedFilters.specialties.some(s => person[`specialty_${language}`] && person[`specialty_${language}`].includes(s))) &&
      (selectedFilters.interests.length === 0 || selectedFilters.interests.some(i => person[`interests_${language}`] && person[`interests_${language}`].includes(i)));
    return matchesSearch && matchesFilters;
  }).map(person => ({
    ...person,
    name: person[`name_${language}`] || person[`name_en`] || person[`name_ja`],
    role: person[`role_${language}`] || person[`role_en`] || person[`role_ja`],
    team: person[`team_${language}`] || person[`team_en`] || person[`team_ja`],
    specialty: person[`specialty_${language}`] || person[`specialty_en`] || person[`specialty_ja`],
    ideas: person[`ideas_${language}`] || person[`ideas_en`] || person[`ideas_ja`],
    interests: person[`interests_${language}`] || person[`interests_en`] || person[`interests_ja`],
    skills: person[`skills_${language}`] || person[`skills_en`] || person[`skills_ja`] || [],
    hobbies: person[`hobbies_${language}`] || person[`hobbies_en`] || person[`hobbies_ja`] || [],
    recentActivity: person[`recentActivity_${language}`] || person[`recentActivity_en`] || person[`recentActivity_ja`],
    profile_url: person[`profile_url_${language}`] || person[`profile_url_en`] || person[`profile_url_ja`],
  }));

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        filters={filters}
        selected={selectedFilters}
        onFilterChange={handleFilterChange}
      />
      <div className="flex-1 h-screen flex flex-col overflow-hidden">
        {/* Language Switcher */}
        <div className="flex justify-end items-center p-4 bg-white border-b border-gray-200">
          <button onClick={() => handleLanguageSwitch('en')} className={`px-3 py-1 rounded-l ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>EN</button>
          <button onClick={() => handleLanguageSwitch('ja')} className={`px-3 py-1 rounded-r ${language === 'ja' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>JP</button>
        </div>
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Singularity Society Bootcamp 003</h1>
            <SearchBar value={search} onChange={setSearch} />
            {selectedIndex === null ? (
              <PeopleGrid onCardClick={handleCardClick} people={filteredPeople} language={language} />
            ) : (
              <ProfileFullScreen
                person={filteredPeople[selectedIndex]}
                onClose={handleClose}
                onPrev={handlePrev}
                onNext={handleNext}
                hasPrev={selectedIndex > 0}
                hasNext={selectedIndex < filteredPeople.length - 1}
                onFullPage={handleFullPage}
                showFullPage={showFullPage}
                language={language}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}