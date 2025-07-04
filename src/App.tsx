import React, { useState, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { SearchBar } from './components/SearchBar';
import { PeopleGrid } from './components/PeopleGrid';
import peopleGemini from './data/people_gemini_fixed.json';
import { ProfileFullScreen } from './components/ProfileFullScreen';

function uniq(arr: string[]): string[] {
  return Array.from(new Set(arr.filter(Boolean)));
}

// Helper to flatten array of {ja, en} to string or array
function flattenLangArray(arr: any[], lang: 'en' | 'ja', asArray = false) {
  if (!Array.isArray(arr)) return asArray ? [] : '';
  const vals = arr.map(item => item[lang]).filter(Boolean);
  return asArray ? vals : vals.join(', ');
}

// Helper to flatten {ja, en} object
function flattenLangObj(obj: any, lang: 'en' | 'ja') {
  if (!obj) return '';
  return obj[lang] || '';
}

// Helper to flatten boolean/option fields
function flattenOptionField(obj: any) {
  if (!obj) return undefined;
  if (typeof obj.value !== 'undefined') return obj.value;
  return undefined;
}

// Helper to get initials from name
function getInitials(name: string) {
  if (!name) return '';
  const parts = name.split(/\s+/);
  if (parts.length === 1) return parts[0][0] || '';
  return parts[0][0] + (parts[1]?.[0] || '');
}

// Team color mapping
const teamColors: { [key: string]: string } = {
  'CommunityRadio EchoLab (Provisional)': '#1E88E5',
  'come come club (Provisional)': '#43A047',
  'altermis (Provisional)': '#F4511E',
  'Jinarashi': '#8E24AA',
  'EchoLab (Provisional)': '#FDD835',
  'Gabon': '#00ACC1',
  'Undecided': '#D81B60',
  'default': '#9E9E9E'
};

// Process people data from people_gemini_fixed.json
function processPeopleData(lang: 'en' | 'ja') {
  return peopleGemini.participants.map((person: any) => {
    const name = flattenLangObj(person.name, lang) || '';
    const team = flattenLangObj(person.team, lang) || '';
    const role = flattenLangArray(person.role, lang) || '';
    const specialty = flattenLangArray(person.specialty, lang) || '';
    const ideas = flattenLangArray(person.ideas, lang) || '';
    const interests = flattenLangArray(person.interests, lang) || '';
    const skills = flattenLangArray(person.specialty, lang, true) || [];
    const hobbies = flattenLangArray(person.interests, lang, true) || [];
    const recentActivity = flattenLangArray(person.ideas, lang) || '';
    const profile_url = person.profile_url;
    const github_account = person.github_account;
    const avatar_initials = getInitials(name);
    const teamColor = teamColors[team] || teamColors.default;
    const avatar_color = teamColor;
    const profileImage = person.profileImage ? person.profileImage : (github_account ? `https://github.com/${github_account}.png` : null);
    return {
      id: person.id,
      name: String(name),
      role: String(role),
      avatar_initials: String(avatar_initials),
      avatar_color: String(avatar_color),
      profileImage,
      skills: Array.isArray(skills) ? skills.map(String) : [],
      hobbies: Array.isArray(hobbies) ? hobbies.map(String) : [],
      recentActivity: String(recentActivity),
      profile_url: profile_url || '',
      github_account: github_account || '',
      team: String(team),
      specialty: String(specialty),
      ideas: String(ideas),
      interests: String(interests),
      concurrent_possible: flattenOptionField(person.concurrent_possible),
      rocket_incubator: flattenOptionField(person.rocket_incubator),
      graphai_ai_podcaster: flattenOptionField(person.graphai_ai_podcaster),
      summary: person.summary ? flattenLangObj(person.summary, lang) : undefined,
      project_details: person.project_details ? flattenLangObj(person.project_details, lang) : undefined,
      contributions: person.contributions ? flattenLangObj(person.contributions, lang) : undefined,
      support_activities: person.support_activities ? flattenLangObj(person.support_activities, lang) : undefined,
    };
  });
}

interface Filters {
  roles: string[];
  teams: string[];
  specialties: string[];
  interests: string[];
}

// Filters extraction for new structure
function extractFilters(people: any[], lang: 'en' | 'ja'): Filters {
  return {
    roles: uniq(people.flatMap((p: any) => (Array.isArray(p.role) ? p.role : p.role?.split(',') || []).map((s: string) => s.trim()))),
    teams: uniq(people.map((p: any) => p.team).filter(Boolean)),
    specialties: uniq(people.flatMap((p: any) => (Array.isArray(p.specialty) ? p.specialty : p.specialty?.split(',') || []).map((s: string) => s.trim()))),
    interests: uniq(people.flatMap((p: any) => (Array.isArray(p.interests) ? p.interests : p.interests?.split(',') || []).map((s: string) => s.trim()))),
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

  // Processed people data for current language
  const processedPeopleData = useMemo(() => processPeopleData(language), [language]);
  const filters = useMemo(() => extractFilters(processedPeopleData, language), [processedPeopleData, language]);

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
      (typeof person.name === 'string' && person.name.toLowerCase().includes(q)) ||
      (typeof person.role === 'string' && person.role.toLowerCase().includes(q)) ||
      (typeof person.team === 'string' && person.team.toLowerCase().includes(q)) ||
      (typeof person.specialty === 'string' && person.specialty.toLowerCase().includes(q)) ||
      (typeof person.ideas === 'string' && person.ideas.toLowerCase().includes(q)) ||
      (typeof person.interests === 'string' && person.interests.toLowerCase().includes(q)) ||
      (Array.isArray(person.skills) && person.skills.join(' ').toLowerCase().includes(q)) ||
      (Array.isArray(person.hobbies) && person.hobbies.join(' ').toLowerCase().includes(q));
    // Filter by selected filters (language-specific)
    const matchesFilters =
      (selectedFilters.roles.length === 0 || selectedFilters.roles.some(r => typeof person.role === 'string' && person.role.includes(r))) &&
      (selectedFilters.teams.length === 0 || selectedFilters.teams.some(t => typeof person.team === 'string' && person.team.includes(t))) &&
      (selectedFilters.specialties.length === 0 || selectedFilters.specialties.some(s => typeof person.specialty === 'string' && person.specialty.includes(s))) &&
      (selectedFilters.interests.length === 0 || selectedFilters.interests.some(i => typeof person.interests === 'string' && person.interests.includes(i)));
    return matchesSearch && matchesFilters;
  });

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