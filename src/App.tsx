/// <reference types="vite/client" />
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { PeopleGrid } from './components/PeopleGrid';
import peopleGemini from './data/people_gemini_fixed.json';
import { ProfileFullScreen } from './components/ProfileFullScreen';
import { Sidebar } from './components/Layout/Sidebar';
import { Settings } from 'lucide-react';
import { searchUsersWithAI } from './utils/aiSearch';
import { ThemeProvider } from './components/theme-provider';
import { ModeToggle } from './components/mode-toggle';
import { BlurFade, ShimmerButton, Sparkles } from './components/ui';

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

// Helper to normalize skill names for consistency
function normalizeSkill(skill: string): string {
  if (!skill) return skill;
  
  const normalized = skill.trim();
  
  // Common skill normalizations
  const skillMap: { [key: string]: string } = {
    'JS': 'JavaScript',
    'TS': 'TypeScript',
    'ML': 'Machine Learning',
    'NLP': 'Natural Language Processing',
    'DS': 'Data Science',
    'AI': 'Artificial Intelligence',
    'UI': 'User Interface',
    'UX': 'User Experience',
    'API': 'API Development',
    'DB': 'Database',
    'DevOps': 'DevOps',
    'QA': 'Quality Assurance',
    'PM': 'Product Management',
    'PR': 'Public Relations',
    'sns Marketing': 'Social Media Marketing',
    'SNS Marketing': 'Social Media Marketing',
    'フロントエンド': 'Frontend',
    'バックエンド': 'Backend',
    'フルスタック': 'Full Stack',
    'ゲーム開発': 'Game Development',
    'ロボティクス': 'Robotics',
    'データサイエンス': 'Data Science',
    'エンジニア': 'Engineering'
  };
  
  return skillMap[normalized] || normalized;
}

// Helper to normalize and split roles
function normalizeRoles(rawRoles: any[], lang: 'en' | 'ja'): string[] {
  const roleSet = new Set<string>();
  rawRoles.forEach(role => {
    if (!role) return;
    const val = typeof role === 'string' ? role : role[lang];
    if (!val) return;
    // Split by slash, comma, or ampersand
    val.split(/[/,&，／]/).forEach((part: string) => {
      let r = part.trim();
      
      // Normalize common role variations
      if (/^developer$/i.test(r)) r = 'Engineer';
      if (/^dev$/i.test(r)) r = 'Engineer';
      if (/engineer\/developer/i.test(r)) r = 'Engineer';
      if (/developer\/engineer/i.test(r)) r = 'Engineer';
      
      // Normalize PM variations
      if (/^pm$/i.test(r)) r = 'Product Manager';
      if (/^product\s*manager$/i.test(r)) r = 'Product Manager';
      
      // Normalize PdM to Product Manager
      if (/^pdm$/i.test(r)) r = 'Product Manager';
      if (/^product\s*data\s*management$/i.test(r)) r = 'Product Manager';
      
      // Normalize PR variations
      if (/^pr$/i.test(r)) r = 'Public Relations';
      if (/^pr\s*\/\s*public\s*relations$/i.test(r)) r = 'Public Relations';
      if (/^広報$/i.test(r)) r = 'Public Relations';
      
      // Normalize Business Development
      if (/^bizdev$/i.test(r)) r = 'Business Development';
      if (/^biz\s*dev$/i.test(r)) r = 'Business Development';
      
      // Handle Design/Designer consistency
      if (/^design$/i.test(r)) r = 'Designer';
      if (/^designer$/i.test(r)) r = 'Designer';
      
      // Split Planning/Design into separate roles
      if (/^planning\s*\/\s*design$/i.test(r)) {
        roleSet.add('Planning');
        roleSet.add('Designer');
        return;
      }
      if (/^planning(\s*\/\s*design)?$/i.test(r)) r = 'Planning';
      if (/^企画\s*\/\s*デザイン$/i.test(r)) {
        roleSet.add('Planning');
        roleSet.add('Designer');
        return;
      }
      if (/^企画兼開発$/i.test(r)) {
        roleSet.add('Planning');
        roleSet.add('Engineer');
        return;
      }
      if (/^企画$/i.test(r)) r = 'Planning';
      
      // Normalize other roles
      if (/^founder$/i.test(r)) r = 'Founder';
      if (/^creator$/i.test(r)) r = 'Creator';
      if (/^営業$/i.test(r)) r = 'Sales';
      if (/^フルスタック$/i.test(r)) r = 'Full Stack Engineer';
      
      if (r) roleSet.add(r);
    });
  });
  return Array.from(roleSet).sort();
}

// Helper to truncate team names
function truncateTeam(team: string, maxLen = 20) {
  if (!team) return '';
  return team.length > maxLen ? team.slice(0, maxLen - 1) + '…' : team;
}

// Process people data from people_gemini_fixed.json
function processPeopleData(lang: 'en' | 'ja') {
  const people = peopleGemini.participants.map((person: any) => {
    const name = flattenLangObj(person.name, lang) || '';
    let team = flattenLangObj(person.team, lang) || '';
    team = truncateTeam(team, 20);
    // Normalize roles
    const roleArr = Array.isArray(person.role) ? person.role : (person.role ? [person.role] : []);
    const roles = normalizeRoles(roleArr, lang);
    const role = roles.join(', ');
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
      roles: roles,
      avatar_initials: String(avatar_initials),
      avatar_color: String(avatar_color),
      profileImage,
      skills: Array.isArray(skills) ? skills.map(skill => normalizeSkill(String(skill))) : [],
      hobbies: Array.isArray(hobbies) ? hobbies.map(hobby => normalizeSkill(String(hobby))) : [],
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
      support_activities: person.support_activities ? flattenLangObj(person.support_activities, lang) : undefined
    };
  });
  // Debug: Log roles for each person
  console.log('People roles:', people.map(p => ({ id: p.id, name: p.name, roles: p.roles })));
  return people;
}

interface Filters {
  roles: string[];
  locations: string[];
  skills: string[];
}

type FilterKey = keyof Filters;

// Filters extraction for new structure
function extractFilters(people: any[], lang: 'en' | 'ja'): Filters {
  // Extract unique locations from team and/or a location field if available
  const locations = uniq(
    peopleGemini.participants
      .map((p: any) => p.location ? flattenLangObj(p.location, lang) : undefined)
      .filter(Boolean)
  );
  const fallbackLocations = uniq(people.map((p: any) => p.team).filter(Boolean));
  const allLocations = locations.length > 0 ? locations : fallbackLocations;

  // Count skill frequencies
  const allSkills = [
    ...people.flatMap((p: any) => (Array.isArray(p.skills) ? p.skills : [])),
    ...people.flatMap((p: any) => (Array.isArray(p.hobbies) ? p.hobbies : [])),
  ];
  const skillCounts: Record<string, number> = {};
  allSkills.forEach(skill => {
    if (!skill) return;
    const normalizedSkill = normalizeSkill(skill);
    skillCounts[normalizedSkill] = (skillCounts[normalizedSkill] || 0) + 1;
  });
  
  // Sort skills by frequency, descending
  const sortedSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([skill]) => skill);
  
  // Take top skills and create Misc category for the rest
  const TOP_N = 12;
  const topSkills = sortedSkills.slice(0, TOP_N);
  const miscSkills = sortedSkills.slice(TOP_N);
  
  // Store misc skills globally for filtering
  (window as any).miscSkills = miscSkills;
  
  // Add Misc category if there are remaining skills
  const skills = miscSkills.length > 0 ? [...topSkills, 'Misc'] : topSkills;

  // Normalize and deduplicate roles
  const allRawRoles = peopleGemini.participants.flatMap((p: any) => Array.isArray(p.role) ? p.role : (p.role ? [p.role] : []));
  const roles = normalizeRoles(allRawRoles, lang);
  
  // Debug: Log filter information
  console.log('Filter dropdown roles:', roles);
  console.log('Top skills:', topSkills);
  console.log('Misc skills count:', miscSkills.length);

  return {
    roles,
    locations: allLocations,
    skills,
  };
}

// New: FilterPillsBar component
interface FilterPill {
  category: string;
  value: string;
  key: string;
}
interface FilterPillsBarProps {
  search: string;
  selectedFilters: Filters;
  onRemove: (pill: FilterPill | { key: string }) => void;
}
const FilterPillsBar: React.FC<FilterPillsBarProps> = ({ search, selectedFilters, onRemove }) => {
  const pills: FilterPill[] = [];
  
  // Add search pill
  if (search) {
    pills.push({ category: 'Search', value: search, key: 'search' });
  }
  
  // Add filter pills
  Object.entries(selectedFilters).forEach(([category, values]: [string, string[]]) => {
    values.forEach((value: string) => {
      pills.push({ category, value, key: `${category}:${value}` });
    });
  });
  
  if (pills.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {pills.map(pill => (
        <span key={pill.key} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-sm border border-blue-200 dark:border-blue-700">
          <span className="font-medium capitalize">{pill.category}:</span>
          <span className="max-w-32 truncate">{pill.value}</span>
          <button 
            onClick={() => onRemove(pill)} 
            className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-1 transition-colors"
            aria-label={`Remove ${pill.category} filter`}
          >
            ×
          </button>
        </span>
      ))}
      {pills.length > 1 && (
        <button 
          onClick={() => onRemove({ key: 'clearAll' })} 
          className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors"
        >
          Clear All
        </button>
      )}
    </div>
  );
};

const FilterBar: React.FC<{
  filters: Filters;
  selected: Filters;
  onFilterChange: (type: FilterKey, value: string) => void;
}> = ({ filters, selected, onFilterChange }) => (
  <div className="flex gap-4 mb-4">
    {Object.entries(filters).map(([key, options]: [string, string[]]) => (
      <div key={key} className="flex flex-wrap gap-2">
        <span className="font-semibold text-gray-700 capitalize">{key}:</span>
        {options.map((option: string) => (
          <button
            key={option}
            onClick={() => onFilterChange(key as FilterKey, option)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              (selected as any)[key].includes(option)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    ))}
  </div>
);

function AppContent() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showFullPage, setShowFullPage] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Filters>({
    roles: [],
    locations: [],
    skills: [],
  });
  const [language, setLanguage] = useState<'en' | 'ja'>('en');
  const [aiResult, setAiResult] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<string[]>([]);

  // Processed people data for current language
  const processedPeopleData = useMemo(() => processPeopleData(language), [language]);
  const filters = useMemo(() => extractFilters(processedPeopleData, language), [processedPeopleData, language]);

  // AI search function using OpenAI API
  const handleAISearch = async (query: string) => {
    if (!query.trim()) {
      setAiResult('');
      setAiLoading(false);
      setAiSearchResults([]);
      return;
    }

    setAiLoading(true);
    setAiResult('');
    setAiSearchResults([]);

    try {
      const result = await searchUsersWithAI(query);
      
      if (result.error) {
        setAiResult(`Error: ${result.error}`);
        setAiLoading(false);
        return;
      }

      if (result.matchingIds.length === 0) {
        setAiResult('No matching users found.');
        setAiLoading(false);
        return;
      }

      // Store the matching IDs for filtering
      setAiSearchResults(result.matchingIds);
      
      // Clear regular search and filters when showing AI results
      setSearch('');
      setSelectedFilters({ roles: [], locations: [], skills: [] });
      
      // Set a success message
      setAiResult(`Found ${result.matchingIds.length} matching users`);
      setAiLoading(false);
      
    } catch (error) {
      console.error('AI search failed:', error);
      setAiResult('AI search failed. Please try again.');
      setAiLoading(false);
    }
  };

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

  // Update filteredPeople to handle AI search results
  const filteredPeople = useMemo(() => {
    let filtered = processedPeopleData;

    // If we have AI search results, show only those
    if (aiSearchResults.length > 0) {
      filtered = filtered.filter(person =>
        aiSearchResults.includes(String(person.id))
      );
      return filtered;
    }

    // Otherwise, apply regular filters
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(person => {
        // Search in name
        const nameMatch = person.name.toLowerCase().includes(searchLower);
        
        // Search in role (display role)
        const roleMatch = person.role.toLowerCase().includes(searchLower);
        
        // Search in normalized roles array
        const rolesMatch = Array.isArray(person.roles) && 
          person.roles.some(role => role.toLowerCase().includes(searchLower));
        
        // Search in skills
        const skillsMatch = person.skills.some(skill => 
          skill.toLowerCase().includes(searchLower));
        
        // Search in hobbies
        const hobbiesMatch = person.hobbies.some(hobby => 
          hobby.toLowerCase().includes(searchLower));
        
        // Search in team
        const teamMatch = person.team.toLowerCase().includes(searchLower);
        
        // Search in specialty, ideas, interests
        const specialtyMatch = person.specialty.toLowerCase().includes(searchLower);
        const ideasMatch = person.ideas.toLowerCase().includes(searchLower);
        const interestsMatch = person.interests.toLowerCase().includes(searchLower);
        
        return nameMatch || roleMatch || rolesMatch || skillsMatch || hobbiesMatch || 
               teamMatch || specialtyMatch || ideasMatch || interestsMatch;
      });
    }

    // Apply role filter
    if (selectedFilters.roles.length > 0) {
      filtered = filtered.filter(person =>
        selectedFilters.roles.some(r => Array.isArray(person.roles) && person.roles.includes(r))
      );
    }

    // Apply location filter
    if (selectedFilters.locations.length > 0) {
      filtered = filtered.filter(person =>
        selectedFilters.locations.some(l => person.team && person.team.toLowerCase().includes(l.toLowerCase()))
      );
    }

    // Apply skills filter
    if (selectedFilters.skills.length > 0) {
      filtered = filtered.filter(person => {
        return selectedFilters.skills.some(selectedSkill => {
          if (selectedSkill === 'Misc') {
            // For Misc, check if person has any skills that are in the misc skills list
            const miscSkills = (window as any).miscSkills || [];
            return person.skills.some(skill => miscSkills.includes(skill)) ||
                   person.hobbies.some(hobby => miscSkills.includes(hobby));
          } else {
            // For regular skills, check if person has this skill
            return person.skills.some(skill => skill.toLowerCase().includes(selectedSkill.toLowerCase())) ||
                   person.hobbies.some(hobby => hobby.toLowerCase().includes(selectedSkill.toLowerCase()));
          }
        });
      });
    }

    return filtered;
  }, [processedPeopleData, search, selectedFilters, aiSearchResults]);

  // Clear AI search results when regular search/filters are used
  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    if (aiSearchResults.length > 0) {
      setAiSearchResults([]);
      setAiResult('');
    }
  };

  // New: Remove pill handler
  const handleRemovePill = (pill: FilterPill | { key: string }) => {
    if (pill.key === 'search') setSearch('');
    else if (pill.key === 'clearAll') {
      setSearch('');
      setSelectedFilters({ roles: [], locations: [], skills: [] });
    } else {
      const [cat, val] = pill.key.split(':');
      setSelectedFilters(prev => ({ ...prev, [cat]: (prev as any)[cat].filter((v: string) => v !== val) }));
    }
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-foreground relative">
        {/* Simple gradient background */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-950 dark:to-slate-950 z-0"></div>
        
        <div className="flex h-screen relative z-10">
          {/* Sidebar filter layout */}
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={handleSidebarToggle}
            filters={filters}
            selected={selectedFilters}
            onFilterChange={handleFilterChange}
            peopleData={processedPeopleData}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <BlurFade delay={0.1}>
                  <Sparkles className="inline-block">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      Discover Amazing People
                    </h1>
                  </Sparkles>
                </BlurFade>
                {/* Language switcher and theme toggle */}
                <BlurFade delay={0.2}>
                  <div className="flex gap-4 items-center">
                    <div className="relative">
                      <select 
                        value={language}
                        onChange={(e) => handleLanguageSwitch(e.target.value as 'en' | 'ja')}
                        className="px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition-all outline-none cursor-pointer"
                      >
                        <option value="en">English</option>
                        <option value="ja">日本語</option>
                      </select>
                    </div>
                    <ModeToggle />
                  </div>
                </BlurFade>
              </div>
              {/* Search bar and filter pills */}
              <BlurFade delay={0.3}>
                <SearchBar value={search} onChange={handleSearchChange} />
              </BlurFade>
              <BlurFade delay={0.4}>
                <FilterPillsBar search={search} selectedFilters={selectedFilters} onRemove={handleRemovePill} />
              </BlurFade>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
              <BlurFade delay={0.5}>
                <PeopleGrid onCardClick={handleCardClick} people={filteredPeople} language={language} />
              </BlurFade>
            </div>
          </div>
          {/* Profile modal/fullscreen logic unchanged */}
          {selectedIndex !== null && (
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
      </div>
    </ThemeProvider>
  );
}

export function App() {
  return <AppContent />;
}