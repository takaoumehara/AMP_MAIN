/// <reference types="vite/client" />
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { PeopleGrid } from './components/PeopleGrid';
import peopleGemini from './data/people_gemini_fixed.json';
import { ProfileFullScreen } from './components/ProfileFullScreen';
import { Sidebar } from './components/Layout/Sidebar';
import { Settings } from 'lucide-react';
import { searchUsersWithAI } from './utils/aiSearch';

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

// Helper to normalize and split roles
function normalizeRoles(rawRoles: any[], lang: 'en' | 'ja'): string[] {
  const roleSet = new Set<string>();
  rawRoles.forEach(role => {
    if (!role) return;
    const val = typeof role === 'string' ? role : role[lang];
    if (!val) return;
    // Split by slash or comma
    val.split(/[/,&]/).forEach((part: string) => {
      let r = part.trim();
      // Merge Developer into Engineer
      if (/developer/i.test(r)) r = 'Engineer';
      // Normalize PM/Engineer, etc.
      if (/^pm$/i.test(r)) r = 'PM';
      if (/^pr(\s*\/\s*public relations)?$/i.test(r)) r = 'PR';
      if (/^bizdev$/i.test(r)) r = 'Bizdev';
      if (/^planning(\s*\/\s*design)?$/i.test(r)) r = 'Planning/Design';
      if (r) roleSet.add(r);
    });
  });
  return Array.from(roleSet);
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
    skillCounts[skill] = (skillCounts[skill] || 0) + 1;
  });
  // Sort skills by frequency, descending
  const sortedSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([skill]) => skill);
  // Take top 12-15
  const TOP_N = 14;
  const topSkills = sortedSkills.slice(0, TOP_N);
  const miscSkills = sortedSkills.slice(TOP_N);
  const skills = topSkills.length < sortedSkills.length ? [...topSkills, 'Misc'] : topSkills;

  // Normalize and deduplicate roles
  const allRawRoles = peopleGemini.participants.flatMap((p: any) => Array.isArray(p.role) ? p.role : (p.role ? [p.role] : []));
  const roles = normalizeRoles(allRawRoles, lang);
  // Debug: Log filter roles
  console.log('Filter dropdown roles:', roles);

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
  if (search) pills.push({ category: 'Search', value: search, key: 'search' });
  (Object.entries(selectedFilters) as [keyof Filters, string[]][]).forEach(([cat, arr]) => {
    arr.forEach((val: string) => {
      pills.push({ category: cat.charAt(0).toUpperCase() + cat.slice(1), value: val, key: `${cat}:${val}` });
    });
  });
  if (pills.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-4 items-center">
      {pills.map(pill => (
        <span key={pill.key} className="flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold animate-fade-in">
          <span className="mr-2">{pill.category}: {pill.value}</span>
          <button
            className="ml-1 rounded-full hover:bg-blue-200 transition-colors p-1"
            onClick={() => onRemove(pill)}
            aria-label="Remove filter"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </span>
      ))}
      <button
        className="ml-2 text-xs text-blue-600 hover:underline"
        onClick={() => onRemove({ key: 'clearAll' })}
      >
        Clear All
      </button>
    </div>
  );
};

// Add new FilterDropdownGrid component for modern UX
const FilterDropdownGrid = ({
  label,
  options,
  selected,
  onChange,
  searchPlaceholder
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (value: string) => void;
  searchPlaceholder: string;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const btnRef = useRef<HTMLButtonElement>(null);
  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));
  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);
  return (
    <div className="relative">
      <button
        ref={btnRef}
        className={`flex items-center gap-2 px-5 py-2 rounded-lg border text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-[140px] ${open || selected.length > 0 ? 'bg-blue-900 text-white border-blue-900' : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-50'}`}
        onClick={() => setOpen(o => !o)}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {label}
        {selected.length > 0 && (
          <span className="ml-2 bg-white/20 rounded px-2 py-0.5 text-xs font-semibold">{selected.length}</span>
        )}
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
      </button>
      {open && (
        <div className="absolute left-0 mt-2 z-30 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[320px] max-w-[420px] w-max animate-fade-in p-4">
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full mb-3 px-4 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-100"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="grid grid-cols-3 gap-2">
            {filteredOptions.map(option => (
              <button
                key={option}
                className={`flex items-center justify-between px-4 py-2 rounded-lg border text-base font-medium transition-colors ${selected.includes(option) ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-800 hover:bg-blue-50'}`}
                onClick={() => onChange(option)}
                type="button"
              >
                {option}
                {selected.includes(option) && (
                  <svg className="w-4 h-4 ml-2 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Replace FilterBar in top layout with new modern filter bar
const FilterBar: React.FC<{
  filters: Filters;
  selected: Filters;
  onFilterChange: (type: FilterKey, value: string) => void;
}> = ({ filters, selected, onFilterChange }) => (
  <div className="flex flex-wrap gap-4 mb-4 w-full">
    <FilterDropdownGrid label="Role" options={filters.roles} selected={selected.roles} onChange={(v: string) => onFilterChange('roles', v)} searchPlaceholder="Search role..." />
    <FilterDropdownGrid label="Team" options={filters.locations} selected={selected.locations} onChange={(v: string) => onFilterChange('locations', v)} searchPlaceholder="Search team..." />
    <FilterDropdownGrid label="Skills" options={filters.skills} selected={selected.skills} onChange={(v: string) => onFilterChange('skills', v)} searchPlaceholder="Search skills..." />
  </div>
);

// SVG icon components for filter layout
const PanelLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-left-icon lucide-panel-left" {...props}><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
);
const PanelTopIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-top-icon lucide-panel-top" {...props}><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/></svg>
);

export function App() {
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
  const [filterLayout, setFilterLayout] = useState<'sidebar' | 'top'>('top');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [aiResult, setAiResult] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<string[]>([]);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);

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
      filtered = filtered.filter(person =>
        person.name.toLowerCase().includes(search.toLowerCase()) ||
        person.role.toLowerCase().includes(search.toLowerCase()) ||
        person.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase())) ||
        person.hobbies.some(hobby => hobby.toLowerCase().includes(search.toLowerCase()))
      );
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
      filtered = filtered.filter(person =>
        selectedFilters.skills.some(s => person.skills.some(skill => skill.toLowerCase().includes(s.toLowerCase())))
      );
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

  const handleFilterChangeWithClear = (type: FilterKey, value: string) => {
    handleFilterChange(type, value);
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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (settingsBtnRef.current && !settingsBtnRef.current.contains(e.target as Node)) {
        setShowFilterMenu(false);
      }
    }
    if (showFilterMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showFilterMenu]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar filter layout */}
      {filterLayout === 'sidebar' && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={handleSidebarToggle}
          filters={filters}
          selected={selectedFilters}
          onFilterChange={handleFilterChange}
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Discover</h1>
            {/* Filter layout toggle and language switcher */}
            <div className="flex gap-4 items-center relative">
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-gray-700">Filter:</span>
                <button
                  onClick={() => setFilterLayout('top')}
                  className={`p-2 rounded-full border transition-colors ${filterLayout === 'top' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-50'}`}
                  title="Filters above the results"
                  aria-label="Show filters at the top"
                >
                  <PanelTopIcon />
                </button>
                <button
                  onClick={() => setFilterLayout('sidebar')}
                  className={`p-2 rounded-full border transition-colors ${filterLayout === 'sidebar' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-50'}`}
                  title="Filters in the left panel"
                  aria-label="Show filters in the sidebar"
                >
                  <PanelLeftIcon />
                </button>
              </div>
              <button onClick={() => handleLanguageSwitch('en')} className={`px-3 py-1 rounded ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>EN</button>
              <button onClick={() => handleLanguageSwitch('ja')} className={`px-3 py-1 rounded ${language === 'ja' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>JA</button>
            </div>
          </div>
          {/* Top filter layout */}
          {filterLayout === 'top' && (
            <>
              <div className="flex gap-4 mb-6">
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ask AI about people, skill"
                    className="w-full h-14 pl-14 pr-6 text-xl font-semibold text-gray-900 placeholder-gray-400 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                    value={search}
                    onChange={e => handleSearchChange(e.target.value)}
                  />
                  <button
                    className="px-8 h-14 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-lg rounded-xl transition-colors"
                    onClick={() => handleAISearch(search)}
                    disabled={aiLoading}
                  >
                    {aiLoading ? 'Searching...' : 'AI Search'}
                  </button>
                </div>
                {/* View switcher placeholder */}
                <div className="flex gap-2 items-center bg-white border border-gray-200 rounded-xl px-2 h-14">
                  <button className="px-3 py-2 rounded-lg font-semibold text-blue-900 bg-blue-100">Grid</button>
                  <button className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">List</button>
                  <button className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Canvas</button>
                </div>
              </div>
              {/* AI Search Result */}
              {aiResult && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">AI Search Result</h3>
                  <p className="text-blue-800">{aiResult}</p>
                </div>
              )}
              <div className="flex gap-2 mb-4">
                <FilterDropdownGrid label="Role" options={filters.roles} selected={selectedFilters.roles} onChange={(v: string) => handleFilterChangeWithClear('roles', v)} searchPlaceholder="Search role..." />
                <FilterDropdownGrid label="Team" options={filters.locations} selected={selectedFilters.locations} onChange={(v: string) => handleFilterChangeWithClear('locations', v)} searchPlaceholder="Search team..." />
                <FilterDropdownGrid label="Skill" options={filters.skills} selected={selectedFilters.skills} onChange={(v: string) => handleFilterChangeWithClear('skills', v)} searchPlaceholder="Search skill..." />
                <FilterDropdownGrid label="Interest" options={filters.skills} selected={selectedFilters.skills} onChange={(v: string) => handleFilterChangeWithClear('skills', v)} searchPlaceholder="Search interest..." />
              </div>
              <FilterPillsBar search={search} selectedFilters={selectedFilters} onRemove={handleRemovePill} />
            </>
          )}
          {/* Pills bar for sidebar layout */}
          {filterLayout === 'sidebar' && (
            <>
              <SearchBar value={search} onChange={handleSearchChange} />
              <FilterPillsBar search={search} selectedFilters={selectedFilters} onRemove={handleRemovePill} />
            </>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-6 pt-0">
          <PeopleGrid onCardClick={handleCardClick} people={filteredPeople} language={language} />
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
  );
}