/// <reference types="vite/client" />
import React, { useState, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { SearchBar } from './components/SearchBar';
import { PeopleGrid } from './components/PeopleGrid';
import { PeopleList } from './components/PeopleList';
import { ViewToggle, ViewMode } from './components/ViewToggle';
import { ProfileFullScreen } from './components/ProfileFullScreen';
import { ThemeProvider } from './components/theme-provider';
import { ModeToggle } from './components/mode-toggle';
import { SettingsDropdown } from './components/SettingsDropdown';
import { TopFilter } from './components/TopFilter';
import { BlurFade, Sparkles } from './components/ui';
import { Sparkles as SparklesIcon } from 'lucide-react';
import peopleGemini from './data/people_with_github.json';
import { AdvancedSearchBar } from './components/AdvancedSearchBar';
import { HybridSearchResponse } from './utils/hybridSearch';
import { SearchResultsDebugPanel } from './components/SearchResultsDebugPanel';
import { performScoredSearch, ScoredSearchResponse } from './utils/advancedScoredSearch';
import SkillMapToggle, { SkillMapViewMode } from './components/SkillMapToggle';
import SkillBubbleMap from './components/SkillBubbleMap';
import { MobileHeader } from './components/MobileHeader';
import { MobileFilterSheet } from './components/MobileFilterSheet';
import { MobileSearch } from './components/MobileSearch';
import { performUnifiedSearch, UnifiedSearchResponse } from './utils/UnifiedSearchEngine';

function uniq(arr: string[]): string[] {
  return Array.from(new Set(arr.filter(Boolean)));
}

export type FilterKey = 'roles' | 'locations' | 'skills' | 'projects' | 'interests';

// GitHub enhanced data types
interface GitHubProfile {
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
}

interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  topics: string[];
  updated_at: string;
}

interface GitHubEnhanced {
  profile: GitHubProfile;
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
  topRepos: GitHubRepo[];
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
function normalizeSkill(skill: string, lang: 'en' | 'ja' = 'en'): string {
  if (!skill) return skill;
  
  const normalized = skill.trim();
  
  // Create a comprehensive skill mapping with pattern matching
  const skillPatterns: { pattern: RegExp; en: string; ja: string }[] = [
    // Programming Languages
    { pattern: /^(JS|JavaScript)$/i, en: 'JavaScript', ja: 'JavaScript' },
    { pattern: /^(TS|TypeScript)$/i, en: 'TypeScript', ja: 'TypeScript' },
    { pattern: /^(Python|python)$/i, en: 'Python', ja: 'Python' },
    { pattern: /^(Java|java)$/i, en: 'Java', ja: 'Java' },
    { pattern: /^(C\+\+|cpp|c\+\+)$/i, en: 'C++', ja: 'C++' },
    { pattern: /^(C#|csharp)$/i, en: 'C#', ja: 'C#' },
    { pattern: /^(Go|golang)$/i, en: 'Go', ja: 'Go' },
    { pattern: /^(Rust|rust)$/i, en: 'Rust', ja: 'Rust' },
    { pattern: /^(Swift|swift)$/i, en: 'Swift', ja: 'Swift' },
    { pattern: /^(Kotlin|kotlin)$/i, en: 'Kotlin', ja: 'Kotlin' },
    
    // AI/ML
    { pattern: /^(ML|Machine Learning|機械学習|マシンラーニング)$/i, en: 'Machine Learning', ja: '機械学習' },
    { pattern: /^(AI|Artificial Intelligence|人工知能|AI技術)$/i, en: 'Artificial Intelligence', ja: '人工知能' },
    { pattern: /^(AI Agent|AI エージェント|AIエージェント)$/i, en: 'AI Agent', ja: 'AIエージェント' },
    { pattern: /^(NLP|Natural Language Processing|自然言語処理)$/i, en: 'Natural Language Processing', ja: '自然言語処理' },
    { pattern: /^(Deep Learning|ディープラーニング|深層学習)$/i, en: 'Deep Learning', ja: 'ディープラーニング' },
    { pattern: /^(Computer Vision|コンピュータビジョン|画像認識)$/i, en: 'Computer Vision', ja: 'コンピュータビジョン' },
    
    // Data Science
    { pattern: /^(DS|Data Science|データサイエンス)$/i, en: 'Data Science', ja: 'データサイエンス' },
    { pattern: /^(Data Analysis|データ分析|データアナリティクス)$/i, en: 'Data Analysis', ja: 'データ分析' },
    { pattern: /^(Big Data|ビッグデータ)$/i, en: 'Big Data', ja: 'ビッグデータ' },
    
    // Web Development
    { pattern: /^(Web Development|Web開発|ウェブ開発|Web Dev|ウェブ開発)$/i, en: 'Web Development', ja: 'Web開発' },
    { pattern: /^(Mobile\/Web Dev|Mobile\/Web Development|モバイル\/Web開発)$/i, en: 'Web Development', ja: 'Web開発' },
    { pattern: /^(Frontend|フロントエンド|Front-end|フロント開発)$/i, en: 'Frontend', ja: 'フロントエンド' },
    { pattern: /^(Backend|バックエンド|Back-end|バック開発)$/i, en: 'Backend', ja: 'バックエンド' },
    { pattern: /^(Full Stack|フルスタック|Fullstack)$/i, en: 'Full Stack', ja: 'フルスタック' },
    
    // Mobile Development
    { pattern: /^(Mobile Development|モバイル開発|アプリ開発)$/i, en: 'Mobile Development', ja: 'モバイル開発' },
    { pattern: /^(iOS Development|iOS開発)$/i, en: 'iOS Development', ja: 'iOS開発' },
    { pattern: /^(Android Development|Android開発)$/i, en: 'Android Development', ja: 'Android開発' },
    
    // Design
    { pattern: /^(UI|User Interface|ユーザーインターフェース|UI設計)$/i, en: 'UI Design', ja: 'UIデザイン' },
    { pattern: /^(UX|User Experience|ユーザーエクスペリエンス|UX設計)$/i, en: 'UX Design', ja: 'UXデザイン' },
    { pattern: /^(UI\/UX|UX\/UI|UIUXデザイン)$/i, en: 'UI/UX Design', ja: 'UI/UXデザイン' },
    { pattern: /^(Graphic Design|グラフィックデザイン)$/i, en: 'Graphic Design', ja: 'グラフィックデザイン' },
    
    // Infrastructure & DevOps
    { pattern: /^(DevOps|デブオプス)$/i, en: 'DevOps', ja: 'DevOps' },
    { pattern: /^(Cloud|クラウド)$/i, en: 'Cloud Computing', ja: 'クラウドコンピューティング' },
    { pattern: /^(AWS|Amazon Web Services)$/i, en: 'AWS', ja: 'AWS' },
    { pattern: /^(GCP|Google Cloud Platform)$/i, en: 'GCP', ja: 'GCP' },
    { pattern: /^(Azure|Microsoft Azure)$/i, en: 'Azure', ja: 'Azure' },
    { pattern: /^(Docker|ドッカー)$/i, en: 'Docker', ja: 'Docker' },
    { pattern: /^(Kubernetes|k8s|クバネティス)$/i, en: 'Kubernetes', ja: 'Kubernetes' },
    
    // Database
    { pattern: /^(DB|Database|データベース)$/i, en: 'Database', ja: 'データベース' },
    { pattern: /^(SQL|エスキューエル)$/i, en: 'SQL', ja: 'SQL' },
    { pattern: /^(NoSQL|NoSQLデータベース)$/i, en: 'NoSQL', ja: 'NoSQL' },
    
    // Business & Management
    { pattern: /^(PM|Product Management|プロダクトマネジメント|プロダクトマネージャー)$/i, en: 'Product Management', ja: 'プロダクトマネジメント' },
    { pattern: /^(Project Management|プロジェクトマネジメント)$/i, en: 'Project Management', ja: 'プロジェクトマネジメント' },
    { pattern: /^(Business Development|事業開発|ビジネス開発)$/i, en: 'Business Development', ja: '事業開発' },
    { pattern: /^(Marketing|マーケティング)$/i, en: 'Marketing', ja: 'マーケティング' },
    { pattern: /^(Sales|営業|セールス)$/i, en: 'Sales', ja: '営業' },
    
    // Quality & Testing
    { pattern: /^(QA|Quality Assurance|品質保証)$/i, en: 'Quality Assurance', ja: '品質保証' },
    { pattern: /^(Testing|テスト|テスティング)$/i, en: 'Testing', ja: 'テスト' },
    
    // Other Technical
    { pattern: /^(API|API Development|API開発)$/i, en: 'API Development', ja: 'API開発' },
    { pattern: /^(Security|セキュリティ)$/i, en: 'Security', ja: 'セキュリティ' },
    { pattern: /^(Blockchain|ブロックチェーン)$/i, en: 'Blockchain', ja: 'ブロックチェーン' },
    { pattern: /^(IoT|Internet of Things|モノのインターネット)$/i, en: 'IoT', ja: 'IoT' },
    { pattern: /^(Robotics|ロボティクス|ロボット工学)$/i, en: 'Robotics', ja: 'ロボティクス' },
    { pattern: /^(Game Development|ゲーム開発)$/i, en: 'Game Development', ja: 'ゲーム開発' },
    
    // Soft Skills
    { pattern: /^(Leadership|リーダーシップ)$/i, en: 'Leadership', ja: 'リーダーシップ' },
    { pattern: /^(Communication|コミュニケーション)$/i, en: 'Communication', ja: 'コミュニケーション' },
    { pattern: /^(Teamwork|チームワーク)$/i, en: 'Teamwork', ja: 'チームワーク' },
    { pattern: /^(Problem Solving|問題解決)$/i, en: 'Problem Solving', ja: '問題解決' },
    
    // Social Media & PR
    { pattern: /^(PR|Public Relations|広報)$/i, en: 'Public Relations', ja: '広報' },
    { pattern: /^(SNS Marketing|Social Media Marketing|SNSマーケティング|ソーシャルメディアマーケティング)$/i, en: 'Social Media Marketing', ja: 'SNSマーケティング' }
  ];
  
  // Find matching pattern
  for (const { pattern, en, ja } of skillPatterns) {
    if (pattern.test(normalized)) {
      return lang === 'ja' ? ja : en;
    }
  }
  
  return normalized;
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
      if (!r) return;
      
      // Normalize Engineer variations
      if (/^(developer|dev|engineer|developer\/engineer|engineer\/developer|エンジニア|開発者|フルスタック)$/i.test(r)) {
        r = lang === 'ja' ? 'エンジニア' : 'Engineer';
      }
      
      // Normalize Designer variations (including Creator and Creative)
      if (/^(design|designer|creator|creative|デザイン|デザイナー|クリエイター|クリエーター|クリエイティブ)$/i.test(r)) {
        r = lang === 'ja' ? 'デザイナー' : 'Designer';
      }
      
      // Normalize PM variations
      if (/^(pm|product\s*manager|pdm|product\s*data\s*management|プロダクトマネージャー|PM)$/i.test(r)) {
        r = lang === 'ja' ? 'プロダクトマネージャー' : 'Product Manager';
      }
      
      // Normalize AI Agent variations
      if (/^(ai\s*agent|ai\s*エージェント|aiエージェント)$/i.test(r)) {
        r = lang === 'ja' ? 'AIエージェント' : 'AI Agent';
      }
      
      // Normalize PR variations
      if (/^(pr|public\s*relations|広報)$/i.test(r)) {
        r = lang === 'ja' ? '広報' : 'Public Relations';
      }
      
      // Normalize Business Development
      if (/^(bizdev|biz\s*dev|business\s*development|事業開発)$/i.test(r)) {
        r = lang === 'ja' ? '事業開発' : 'Business Development';
      }
      
      // Normalize Sales
      if (/^(sales|営業|セールス)$/i.test(r)) {
        r = lang === 'ja' ? '営業' : 'Sales';
      }
      
      // Normalize Planning
      if (/^(planning|企画|プランニング)$/i.test(r)) {
        r = lang === 'ja' ? '企画' : 'Planning';
      }
      
      // Handle combined roles
      if (/^(planning\s*\/\s*design|企画\s*\/\s*デザイン)$/i.test(r)) {
        roleSet.add(lang === 'ja' ? '企画' : 'Planning');
        roleSet.add(lang === 'ja' ? 'デザイナー' : 'Designer');
        return;
      }
      if (/^企画兼開発$/i.test(r)) {
        roleSet.add(lang === 'ja' ? '企画' : 'Planning');
        roleSet.add(lang === 'ja' ? 'エンジニア' : 'Engineer');
        return;
      }
      
      // Normalize other common roles
      if (/^(founder|ファウンダー|創業者)$/i.test(r)) {
        r = lang === 'ja' ? 'ファウンダー' : 'Founder';
      }
      if (/^(researcher|研究者|リサーチャー)$/i.test(r)) {
        r = lang === 'ja' ? '研究者' : 'Researcher';
      }
      if (/^(consultant|コンサルタント)$/i.test(r)) {
        r = lang === 'ja' ? 'コンサルタント' : 'Consultant';
      }
      if (/^(analyst|アナリスト)$/i.test(r)) {
        r = lang === 'ja' ? 'アナリスト' : 'Analyst';
      }
      if (/^(student|学生)$/i.test(r)) {
        r = lang === 'ja' ? '学生' : 'Student';
      }
      
      if (r) roleSet.add(r);
    });
  });
  return Array.from(roleSet).sort();
}

// Helper to normalize team names
function normalizeTeam(team: string, lang: 'en' | 'ja'): string {
  if (!team) return '';
  
  // Normalize "未定" variations
  if (/^(未定|未定\(個人\?\)|未定\(個人？\)|未定\s*\(or\s*個人\)|未定\s*\(\s*or\s*個人\s*\)|TBD|To Be Determined|Undecided)$/i.test(team)) {
    return lang === 'ja' ? '未定' : 'TBD';
  }
  
  // Normalize team name variations
  if (/^(プナホウ|punahou)$/i.test(team)) {
    return lang === 'ja' ? 'プナホウ' : 'punahou';
  }
  
  if (/^(altermis|アルテミス)$/i.test(team)) {
    return lang === 'ja' ? 'altermis' : 'altermis';
  }
  
  if (/^(come\s*come\s*club|カムカムクラブ)$/i.test(team)) {
    return lang === 'ja' ? 'come come club' : 'come come club';
  }
  
  if (/^(CommunityRadio\s*EchoLab|コミュニティラジオエコーラボ)$/i.test(team)) {
    return lang === 'ja' ? 'CommunityRadio EchoLab' : 'CommunityRadio EchoLab';
  }
  
  if (/^(EchoLab|エコーラボ)$/i.test(team)) {
    return lang === 'ja' ? 'EchoLab' : 'EchoLab';
  }
  
  if (/^(Jinarashi|ジナラシ)$/i.test(team)) {
    return lang === 'ja' ? 'Jinarashi' : 'Jinarashi';
  }
  
  if (/^(Gabon|ガボン)$/i.test(team)) {
    return lang === 'ja' ? 'Gabon' : 'Gabon';
  }
  
  return team;
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
    team = normalizeTeam(team, lang);
    team = truncateTeam(team, 20);
    // Normalize roles and split multiple roles
    const roleArr = Array.isArray(person.role) ? person.role : (person.role ? [person.role] : []);
    const roles = normalizeRoles(roleArr, lang);
    
    // Split roles that contain commas or 、
    const splitRoles: string[] = [];
    roles.forEach(role => {
      if (role.includes(',') || role.includes('、')) {
        const parts = role.split(/[,、]/).map(part => part.trim()).filter(Boolean);
        splitRoles.push(...parts);
      } else {
        splitRoles.push(role);
      }
    });
    
    const role = splitRoles.join(', ');
    const uniqueRoles = Array.from(new Set(splitRoles));
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
    
    // Process GitHub enhanced data
    const githubEnhanced = person.github_enhanced as GitHubEnhanced | undefined;
    
    // Merge GitHub languages with existing skills
    const githubLanguages = githubEnhanced?.languages.topLanguages || [];
    const mergedSkills = [...skills, ...githubLanguages].map(skill => normalizeSkill(String(skill), lang));
    const uniqueSkills = Array.from(new Set(mergedSkills));
    
    // Create enhanced profile with GitHub data
    const enhancedProfile = {
      id: person.id,
      name: String(name),
      role: String(role),
      roles: uniqueRoles, // Store unique roles
      avatar_initials: String(avatar_initials),
      avatar_color: String(avatar_color),
      profileImage,
      skills: uniqueSkills,
      hobbies: Array.isArray(hobbies) ? hobbies.map(hobby => normalizeSkill(String(hobby), lang)) : [],
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
      
      // GitHub enhanced data
      github_enhanced: githubEnhanced
    };
    
    return enhancedProfile;
  });
  // Debug: Log roles for each person
  console.log('People roles:', people.map(p => ({ id: p.id, name: p.name, roles: p.roles })));
  return people;
}

interface Filters {
  roles: string[];
  locations: string[];
  skills: string[];
  projects: string[];
  interests: string[];
}

// Filters extraction for new structure
function extractFilters(people: any[], lang: 'en' | 'ja'): Filters {
  // Extract unique locations from team and/or a location field if available
  const locations = uniq(
    peopleGemini.participants
      .map((p: any) => p.location ? flattenLangObj(p.location, lang) : undefined)
      .filter(Boolean)
  );
  const fallbackLocations = uniq(
    peopleGemini.participants
      .map((p: any) => {
        const team = flattenLangObj(p.team, lang);
        return team ? normalizeTeam(team, lang) : undefined;
      })
      .filter((team): team is string => Boolean(team))
  );
  const allLocations = locations.length > 0 ? locations : fallbackLocations;

  // Count skill frequencies
  const allSkills = [
    ...people.flatMap((p: any) => (Array.isArray(p.skills) ? p.skills : [])),
    ...people.flatMap((p: any) => (Array.isArray(p.hobbies) ? p.hobbies : [])),
  ];
  const skillCounts: Record<string, number> = {};
  allSkills.forEach(skill => {
    if (!skill) return;
    const normalizedSkill = normalizeSkill(skill, lang);
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

  // Extract projects and interests from hobbies
  const projects: string[] = [];
  const interests: string[] = [];
  
  people.forEach(person => {
    if (person.hobbies && Array.isArray(person.hobbies)) {
      person.hobbies.forEach((hobby: string) => {
        if (hobby) {
          // Categorize hobbies into projects or interests
          if (hobby.includes('プロジェクト') || hobby.includes('Project') || 
              hobby.includes('開発') || hobby.includes('Development') ||
              hobby.includes('作成') || hobby.includes('制作')) {
            projects.push(hobby);
          } else {
            interests.push(hobby);
          }
        }
      });
    }
  });

  return {
    roles,
    locations: allLocations,
    skills,
    projects: uniq(projects),
    interests: uniq(interests)
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
  onMiscSkillToggle?: (skill: string) => void;
  selectedMiscSkills?: string[];
  language?: 'en' | 'ja';
}
const FilterPillsBar: React.FC<FilterPillsBarProps> = ({ 
  search, 
  selectedFilters, 
  onRemove, 
  onMiscSkillToggle,
  selectedMiscSkills = [],
  language = 'en'
}) => {
  const [miscExpanded, setMiscExpanded] = useState(false);
  const pills: FilterPill[] = [];
  
  // Get localized category names
  const getCategoryName = (key: string): string => {
    const categoryNames = {
      roles: language === 'ja' ? '役職' : 'Role',
      locations: language === 'ja' ? 'チーム' : 'Team',
      skills: language === 'ja' ? 'スキル・興味' : 'Expertise',
      projects: language === 'ja' ? 'プロジェクト' : 'Projects',
      interests: language === 'ja' ? '興味・趣味' : 'Interests',
      search: language === 'ja' ? '検索' : 'Search'
    };
    return categoryNames[key as keyof typeof categoryNames] || key;
  };
  
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
  
  if (pills.length === 0 && selectedMiscSkills.length === 0) return null;
  
  const miscLabel = language === 'ja' ? 'その他' : 'Misc';
  const expandLabel = language === 'ja' ? '展開' : 'Expand';
  const collapseLabel = language === 'ja' ? '折りたたみ' : 'Collapse';
  
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 mb-2">
        {pills.map(pill => (
          <span key={pill.key} className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-sm border border-blue-200 dark:border-blue-700">
            <span className="font-medium">{getCategoryName(pill.category)}:</span>
            <span className="max-w-32 truncate">{pill.value}</span>
            <button 
              onClick={() => onRemove(pill)} 
              className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-1 transition-colors"
              aria-label={`Remove ${getCategoryName(pill.category)} filter`}
            >
              ×
            </button>
          </span>
        ))}
        {pills.length > 1 && (
          <button 
            onClick={() => onRemove({ key: 'clearAll' })} 
            className="flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
      
      {/* Misc Skills Section */}
      {selectedMiscSkills.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {miscLabel} ({selectedMiscSkills.length})
            </span>
            <button
              onClick={() => setMiscExpanded(!miscExpanded)}
              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {miscExpanded ? collapseLabel : expandLabel}
            </button>
          </div>
          
          {miscExpanded && (
            <div className="flex flex-wrap gap-1">
              {selectedMiscSkills.map(skill => (
                <button
                  key={skill}
                  onClick={() => onMiscSkillToggle?.(skill)}
                  className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="max-w-24 truncate">{skill}</span>
                  <span className="text-gray-500 dark:text-gray-400">×</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};



function AppContent() {
  const [language, setLanguage] = useState<'en' | 'ja'>('ja');
  const [search, setSearch] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Filters>({ roles: [], locations: [], skills: [], projects: [], interests: [] });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFullPage, setShowFullPage] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filterView, setFilterView] = useState<'sidebar' | 'top'>('top');
  const [selectedMiscSkills, setSelectedMiscSkills] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [skillMapViewMode, setSkillMapViewMode] = useState<SkillMapViewMode>('people');
  
  // Unified search state
  const [unifiedSearchResults, setUnifiedSearchResults] = useState<UnifiedSearchResponse | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  // Mobile-specific state
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const processedPeopleData = useMemo(() => processPeopleData(language), [language]);
  const filters = useMemo(() => extractFilters(processedPeopleData, language), [processedPeopleData, language]);

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
    if (type === 'skills' && value === 'Misc') {
      // Handle Misc category selection by showing all misc skills as individual filters
      const miscSkills = (window as any).miscSkills || [];
      setSelectedMiscSkills(prev => 
        prev.length === miscSkills.length ? [] : [...miscSkills]
      );
    } else {
      setSelectedFilters(prev => {
        const arr = prev[type];
        return {
          ...prev,
          [type]: arr.includes(value) ? arr.filter((v: string) => v !== value) : [...arr, value],
        };
      });
    }
    // Clear unified search results when regular filters are used
    if (unifiedSearchResults) {
      setUnifiedSearchResults(null);
      setIsSearchActive(false);
    }
  };

  // Handler for role pill clicks
  const handleRoleClick = (role: string) => {
    handleFilterChange('roles', role);
  };

  // Handler for team name clicks
  const handleTeamClick = (teamName: string) => {
    handleFilterChange('locations', teamName);
  };

  // Handler for skill/interest pill clicks
  const handleSkillClick = (skill: string) => {
    handleFilterChange('skills', skill);
  };

  const handleInterestClick = (interest: string) => {
    handleFilterChange('interests', interest);
  };

  // Function to find related people by skill or interest
  const findRelatedPeople = (skill: string, currentPersonId: number, type: 'skill' | 'interest') => {
    return processedPeopleData.filter(person => {
      if (person.id === currentPersonId) return false; // Exclude current person
      
      if (type === 'skill') {
        return person.skills.some(s => s.toLowerCase() === skill.toLowerCase());
      } else {
        return person.hobbies.some(h => h.toLowerCase() === skill.toLowerCase());
      }
    }).slice(0, 4); // Limit to 4 people
  };
  
  const handleMiscSkillToggle = (skill: string) => {
    setSelectedMiscSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  // Language switcher handler
  const handleLanguageSwitch = (lang: 'en' | 'ja') => setLanguage(lang);

  // View mode handler
  const handleViewModeChange = (mode: ViewMode) => setViewMode(mode);

  // Skill map view mode handler
  const handleSkillMapViewModeChange = (mode: SkillMapViewMode) => {
    setSkillMapViewMode(mode);
  };



  // Handle unified search results (replaces hybrid search)
  const handleUnifiedSearchResults = async (query: string) => {
    if (!query.trim()) {
      setUnifiedSearchResults(null);
      setIsSearchActive(false);
      return;
    }
    
    try {
      const results = await performUnifiedSearch(query);
      setUnifiedSearchResults(results);
      setIsSearchActive(true);
      console.log('🎯 Unified search completed:', results);
    } catch (error) {
      console.error('❌ Unified search failed:', error);
      setUnifiedSearchResults(null);
      setIsSearchActive(false);
    }
  };

  // Update filteredPeople to handle unified search results
  const filteredPeople = useMemo(() => {
    let filtered = processedPeopleData;

    // If we have unified search results, show only those
    if (unifiedSearchResults && unifiedSearchResults.results.length > 0) {
      console.log('🎯 Using unified search results:', unifiedSearchResults.results.length);
      return unifiedSearchResults.results.map(result => result.person);
    }

    // Otherwise, apply regular filters with enhanced search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(person => {
        // Search in name
        const nameMatch = person.name.toLowerCase().includes(searchLower);
        
        // Search in role (display role)
        const roleMatch = person.role.toLowerCase().includes(searchLower);
        
        // Search in normalized roles array with synonym support
        const rolesMatch = Array.isArray(person.roles) && 
          person.roles.some(role => {
            const roleLower = role.toLowerCase();
            // Direct match
            if (roleLower.includes(searchLower)) return true;
            
            // Synonym matching for common cases
            if (searchLower.includes('クリエーター') || searchLower.includes('creator')) {
              return roleLower.includes('デザイナー') || roleLower.includes('designer');
            }
            if (searchLower.includes('デザイナー') || searchLower.includes('designer')) {
              return roleLower.includes('クリエーター') || roleLower.includes('creator') || 
                     roleLower.includes('クリエイター') || roleLower.includes('creative');
            }
            if (searchLower.includes('エンジニア') || searchLower.includes('engineer')) {
              return roleLower.includes('developer') || roleLower.includes('programmer') || 
                     roleLower.includes('開発者') || roleLower.includes('dev');
            }
            if (searchLower.includes('developer') || searchLower.includes('programmer')) {
              return roleLower.includes('エンジニア') || roleLower.includes('engineer');
            }
            return false;
          });
        
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
    
    // Apply projects filter
    if (selectedFilters.projects.length > 0) {
      filtered = filtered.filter(person => {
        return selectedFilters.projects.some(selectedProject => {
          return person.hobbies.some(hobby => 
            hobby.toLowerCase().includes(selectedProject.toLowerCase()) &&
            (hobby.includes('プロジェクト') || hobby.includes('Project') || 
             hobby.includes('開発') || hobby.includes('Development') ||
             hobby.includes('作成') || hobby.includes('制作'))
          );
        });
      });
    }

    // Apply interests filter
    if (selectedFilters.interests.length > 0) {
      filtered = filtered.filter(person => {
        return selectedFilters.interests.some(selectedInterest => {
          return person.hobbies.some(hobby => 
            hobby.toLowerCase().includes(selectedInterest.toLowerCase()) &&
            !(hobby.includes('プロジェクト') || hobby.includes('Project') || 
              hobby.includes('開発') || hobby.includes('Development') ||
              hobby.includes('作成') || hobby.includes('制作'))
          );
        });
      });
    }
    
    // Apply misc skills filter
    if (selectedMiscSkills.length > 0) {
      filtered = filtered.filter(person => {
        return selectedMiscSkills.some(selectedSkill => {
          return person.skills.some(skill => skill.toLowerCase().includes(selectedSkill.toLowerCase())) ||
                 person.hobbies.some(hobby => hobby.toLowerCase().includes(selectedSkill.toLowerCase()));
        });
      });
    }

    return filtered;
  }, [processedPeopleData, search, selectedFilters, unifiedSearchResults, selectedMiscSkills]);

  const handleCardClick = useCallback((indexOrPerson: number | any) => {
    let personIndex: number;
    
    // Handle both index (from grid/list) and person object (from skill map)
    if (typeof indexOrPerson === 'number') {
      // Direct index from grid/list views
      personIndex = indexOrPerson;
    } else {
      // Person object from skill map - find the index in filteredPeople
      personIndex = filteredPeople.findIndex(p => p.id === indexOrPerson.id);
      
      // If not found in filtered people, try to find in all processed people
      if (personIndex === -1) {
        personIndex = processedPeopleData.findIndex(p => p.id === indexOrPerson.id);
        
        // If still not found, try by name as fallback
        if (personIndex === -1) {
          personIndex = processedPeopleData.findIndex(p => p.name === indexOrPerson.name);
        }
      }
    }
    
    // Validation: ensure the index is valid
    if (personIndex >= 0 && personIndex < filteredPeople.length) {
      setSelectedIndex(personIndex);
      setShowFullPage(false);
    } else {
      console.error('Person not found in filtered people:', indexOrPerson);
      // Show error message or handle gracefully
      // For now, we'll just not open the modal
    }
  }, [filteredPeople, processedPeopleData]);

  // Handle unified search (replaces AI search)
  const handleUnifiedSearch = async (query: string) => {
    await handleUnifiedSearchResults(query);
  };

  // Clear unified search results when regular search/filters are used
  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    if (newSearch.trim()) {
      // Trigger unified search for non-empty queries
      handleUnifiedSearchResults(newSearch);
    } else {
      // Clear search results for empty queries
      setUnifiedSearchResults(null);
      setIsSearchActive(false);
    }
  };

  // New: Remove pill handler
  const handleRemovePill = (pill: FilterPill | { key: string }) => {
    if (pill.key === 'search') {
      setSearch('');
      setUnifiedSearchResults(null);
      setIsSearchActive(false);
    } else if (pill.key === 'clearAll') {
      setSearch('');
      setSelectedFilters({ roles: [], locations: [], skills: [], projects: [], interests: [] });
      setSelectedMiscSkills([]);
      setUnifiedSearchResults(null);
      setIsSearchActive(false);
    } else {
      const [cat, val] = pill.key.split(':');
      setSelectedFilters(prev => ({ ...prev, [cat]: (prev as any)[cat].filter((v: string) => v !== val) }));
    }
  };

  // Mobile-specific handlers
  const handleMobileViewChange = (view: 'people' | 'skills') => {
    if (view === 'people') {
      setSkillMapViewMode('people');
    } else {
      setSkillMapViewMode('skills');
    }
  };

  const handleMobileGridListChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  const handleMobileFiltersToggle = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  const handleMobileFilterClearAll = () => {
    setSelectedFilters({ roles: [], locations: [], skills: [], projects: [], interests: [] });
    setSelectedMiscSkills([]);
    if (hybridSearchResults || aiSearchResults.length > 0) {
      setHybridSearchResults(null);
      setAiSearchResults([]);
      setIsAISearchActive(false);
    }
  };

  const getMobileFilterCount = () => {
    return Object.values(selectedFilters).reduce((total, arr) => total + arr.length, 0) + selectedMiscSkills.length;
  };

  // Scroll detection for mobile search auto-hide
  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setShowMobileSearch(false);
      } else {
        // Scrolling up
        setShowMobileSearch(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Only enable on mobile
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    if (mediaQuery.matches) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-foreground relative">
        {/* Simple gradient background */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-950 dark:to-slate-950 z-0"></div>
        
        {/* Mobile Layout */}
        <div className="md:hidden relative z-10">
          {/* Mobile Header */}
          <MobileHeader
            title={skillMapViewMode === 'skills' ? (language === 'ja' ? 'スキルマップ' : 'Skill Map') : 'People Discovery'}
            peopleCount={filteredPeople.length}
            currentView={skillMapViewMode}
            onViewChange={handleMobileViewChange}
            gridListMode={viewMode}
            onGridListChange={handleMobileGridListChange}
            language={language}
            onLanguageChange={handleLanguageSwitch}
            filterCount={getMobileFilterCount()}
            onFiltersToggle={handleMobileFiltersToggle}
          />

          {/* Mobile Search */}
          {skillMapViewMode === 'people' && (
            <MobileSearch
              value={search}
              onChange={handleSearchChange}
              onSearchResults={handleHybridSearchResults}
              onAISearch={setAiSearchResults}
              language={language}
              isVisible={showMobileSearch}
            />
          )}

          {/* Mobile Content */}
          <div className="pb-6 pt-4">
            <BlurFade delay={0.2}>
              {skillMapViewMode === 'skills' ? (
                <div className="px-2">
                  <SkillBubbleMap
                    people={processedPeopleData}
                    language={language}
                    onPersonClick={handleCardClick}
                  />
                </div>
              ) : (
                <div className="px-3">
                  {viewMode === 'grid' ? (
                    <PeopleGrid 
                      people={filteredPeople} 
                      onCardClick={handleCardClick}
                      onRoleClick={handleRoleClick}
                      onTeamClick={handleTeamClick}
                      onSkillClick={handleSkillClick}
                      onInterestClick={handleInterestClick}
                    />
                  ) : (
                    <PeopleList 
                      people={filteredPeople} 
                      onCardClick={handleCardClick}
                      onRoleClick={handleRoleClick}
                      onTeamClick={handleTeamClick}
                      onSkillClick={handleSkillClick}
                      onInterestClick={handleInterestClick}
                    />
                  )}
                </div>
              )}
            </BlurFade>
          </div>

          {/* Mobile Filter Sheet */}
          <MobileFilterSheet
            isOpen={showMobileFilters}
            onClose={() => setShowMobileFilters(false)}
            filters={filters}
            selected={selectedFilters}
            onFilterChange={handleFilterChange}
            onClearAll={handleMobileFilterClearAll}
            language={language}
            peopleData={processedPeopleData}
          />
        </div>

        {/* Desktop Layout - Hidden on Mobile */}
        <div className="hidden md:block">
          {filterView === 'sidebar' ? (
            // Sidebar Layout - Overlay Mode
            <div className="h-screen relative z-10">
              {/* Sidebar Backdrop */}
              <div 
                className={`sidebar-backdrop ${!sidebarCollapsed ? 'open' : ''}`}
                onClick={handleSidebarToggle}
              />
              
              {/* Overlay Sidebar */}
              <div className={`sidebar-overlay ${!sidebarCollapsed ? 'open' : ''}`}>
                <Sidebar
                  collapsed={false}
                  onToggle={handleSidebarToggle}
                  filters={filters}
                  selected={selectedFilters}
                  onFilterChange={handleFilterChange}
                  peopleData={processedPeopleData}
                  language={language}
                />
              </div>
              
              {/* Main Content - Full Width */}
              <div className="flex flex-col h-screen overflow-hidden">
                <div className="p-3 sm:p-6 pb-2 sm:pb-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md relative z-50">
                  {/* Modern Top Navigation Hierarchy - Mobile Optimized */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <BlurFade delay={0.1}>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                          {skillMapViewMode === 'skills' ? (language === 'ja' ? 'スキルマップ' : 'Skill Map') : 'People Discovery'}
                        </h1>
                        
                        {/* Separate People Count Badge - Mobile Optimized */}
                        <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-full w-fit">
                          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300">
                            {filteredPeople.length} {language === 'ja' ? '人' : 'people'}
                          </span>
                        </div>
                      </div>
                    </BlurFade>
                    
                    {/* Mobile-First Action Group */}
                    <div className="flex items-center gap-2 sm:gap-4 relative z-50">
                      <div className="flex items-center gap-1 sm:gap-2 relative z-50">
                        <SettingsDropdown
                          language={language}
                          onLanguageChange={handleLanguageSwitch}
                          filterView={filterView}
                          onFilterViewChange={setFilterView}
                        />
                        <ModeToggle />
                      </div>
                    </div>
                  </div>
                  
                  {/* Compact Navigation Row - Mobile Optimized */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    {/* People Group (Grid | List) */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-600 shadow-sm">
                        {/* People Toggle */}
                        <button
                          onClick={() => handleSkillMapViewModeChange('people')}
                          className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            skillMapViewMode === 'people'
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                        >
                          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                          <span>{language === 'ja' ? '人材一覧' : 'People'}</span>
                        </button>
                        
                        {/* Grid/List Sub-options - Only show when People is active */}
                        {skillMapViewMode === 'people' && (
                          <div className="flex items-center ml-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-0.5">
                            {/* Grid Button */}
                            <button
                              onClick={() => handleViewModeChange('grid')}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                                viewMode === 'grid'
                                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                              }`}
                              title={language === 'ja' ? 'グリッド表示' : 'Grid View'}
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                              </svg>
                              <span className="hidden sm:inline">{language === 'ja' ? 'グリッド' : 'Grid'}</span>
                            </button>
                            
                            {/* List Button */}
                            <button
                              onClick={() => handleViewModeChange('list')}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                                viewMode === 'list'
                                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                              }`}
                              title={language === 'ja' ? 'リスト表示' : 'List View'}
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
                              </svg>
                              <span className="hidden sm:inline">{language === 'ja' ? 'リスト' : 'List'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Separator */}
                    <div className="hidden sm:flex items-center">
                      <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
                    </div>
                    
                    {/* Skill Map Group */}
                    <div className="flex items-center">
                      <button
                        onClick={() => handleSkillMapViewModeChange('skills')}
                        className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                          skillMapViewMode === 'skills'
                            ? 'bg-purple-600 text-white shadow-md border-purple-600'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                        </svg>
                        <span>{language === 'ja' ? 'スキルマップ' : 'Skill Map'}</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Hide search/filter UI when in skill map mode */}
                {skillMapViewMode !== 'skills' && (
                  <div className="px-3 sm:px-6 pb-2 sm:pb-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md relative z-40">
                    <BlurFade delay={0.2}>
                      <div className="mb-3 sm:mb-4">
                        <AdvancedSearchBar
                          value={search}
                          onChange={handleSearchChange}
                          onSearchResults={handleHybridSearchResults}
                          onAISearch={setAiSearchResults}
                        />
                      </div>
                    </BlurFade>
                    
                    <BlurFade delay={0.3}>
                      <div className="mb-3 sm:mb-4 relative z-10">
                        <TopFilter
                          filters={filters}
                          selected={selectedFilters}
                          onFilterChange={handleFilterChange}
                          peopleData={processedPeopleData}
                          language={language}
                        />
                      </div>
                    </BlurFade>
                    
                    <FilterPillsBar
                      search={search}
                      selectedFilters={selectedFilters}
                      onRemove={handleRemovePill}
                      onMiscSkillToggle={handleMiscSkillToggle}
                      selectedMiscSkills={selectedMiscSkills}
                      language={language}
                    />
                    
                    {/* Enhanced Search Results Display */}
                    {hybridSearchResults && (
                      <SearchResultsDebugPanel
                        results={hybridSearchResults}
                        query={search}
                      />
                    )}
                    
                    {isAISearchActive && !hybridSearchResults && (
                      <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                          <SparklesIcon className="h-3 sm:h-4 w-3 sm:w-4" />
                          <span className="text-xs sm:text-sm font-medium">
                            AI Search Results: Found {filteredPeople.length} matching user{filteredPeople.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              
                <div className="flex-1 overflow-auto px-2 sm:px-3 lg:px-6 pb-4 sm:pb-6 pt-2 sm:pt-4 relative z-0 custom-scrollbar">
                  <BlurFade delay={0.4}>
                    {skillMapViewMode === 'skills' ? (
                      <SkillBubbleMap
                        people={processedPeopleData}
                        language={language}
                        onPersonClick={handleCardClick}
                      />
                    ) : (
                      viewMode === 'grid' ? (
                        <PeopleGrid 
                          people={filteredPeople} 
                          onCardClick={handleCardClick}
                          onRoleClick={handleRoleClick}
                          onTeamClick={handleTeamClick}
                          onSkillClick={handleSkillClick}
                          onInterestClick={handleInterestClick}
                        />
                      ) : (
                        <PeopleList 
                          people={filteredPeople} 
                          onCardClick={handleCardClick}
                          onRoleClick={handleRoleClick}
                          onTeamClick={handleTeamClick}
                          onSkillClick={handleSkillClick}
                          onInterestClick={handleInterestClick}
                        />
                      )
                    )}
                  </BlurFade>
                </div>
              </div>
            </div>
          ) : (
            // Top Filter Layout - Mobile Optimized
            <div className="h-screen relative z-0 flex flex-col">
              <div className="p-3 sm:p-6 pb-2 sm:pb-4 relative z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
                {/* Modern Top Navigation Hierarchy - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <BlurFade delay={0.1}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                        {skillMapViewMode === 'skills' ? (language === 'ja' ? 'スキルマップ' : 'Skill Map') : 'People Discovery'}
                      </h1>
                      
                      {/* Separate People Count Badge - Mobile Optimized */}
                      <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-full w-fit">
                        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300">
                          {filteredPeople.length} {language === 'ja' ? '人' : 'people'}
                        </span>
                      </div>
                    </div>
                  </BlurFade>
                  
                  {/* Mobile Navigation Layout */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 relative z-50">
                    {/* Primary Navigation - Two Clear Groups */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      {/* People Group (Grid | List) */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-600 shadow-sm">
                          {/* People Toggle */}
                          <button
                            onClick={() => handleSkillMapViewModeChange('people')}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                              skillMapViewMode === 'people'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                          >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                            <span>{language === 'ja' ? '人材一覧' : 'People'}</span>
                          </button>
                          
                          {/* Grid/List Sub-options - Only show when People is active */}
                          {skillMapViewMode === 'people' && (
                            <div className="flex items-center ml-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-0.5">
                              {/* Grid Button */}
                              <button
                                onClick={() => handleViewModeChange('grid')}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                                  viewMode === 'grid'
                                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                                title={language === 'ja' ? 'グリッド表示' : 'Grid View'}
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                <span className="hidden sm:inline">{language === 'ja' ? 'グリッド' : 'Grid'}</span>
                              </button>
                              
                              {/* List Button */}
                              <button
                                onClick={() => handleViewModeChange('list')}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                                  viewMode === 'list'
                                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                                title={language === 'ja' ? 'リスト表示' : 'List View'}
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
                                </svg>
                                <span className="hidden sm:inline">{language === 'ja' ? 'リスト' : 'List'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Separator */}
                      <div className="hidden sm:flex items-center">
                        <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
                      </div>
                      
                      {/* Skill Map Group */}
                      <div className="flex items-center">
                        <button
                          onClick={() => handleSkillMapViewModeChange('skills')}
                          className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                            skillMapViewMode === 'skills'
                              ? 'bg-purple-600 text-white shadow-md border-purple-600'
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                          </svg>
                          <span>{language === 'ja' ? 'スキルマップ' : 'Skill Map'}</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Secondary Action Group - Settings - Mobile Optimized */}
                    <div className="flex items-center gap-1 sm:gap-2 justify-end sm:justify-start relative z-50">
                      <SettingsDropdown
                        language={language}
                        onLanguageChange={handleLanguageSwitch}
                        filterView={filterView}
                        onFilterViewChange={setFilterView}
                      />
                      <ModeToggle />
                    </div>
                  </div>
                </div>
                
                {/* Hide search/filter UI when in skill map mode */}
                {skillMapViewMode !== 'skills' && (
                  <div className="pb-3 sm:pb-4 relative z-40">
                    <BlurFade delay={0.2}>
                      <div className="mb-3 sm:mb-4">
                        <AdvancedSearchBar
                          value={search}
                          onChange={handleSearchChange}
                          onSearchResults={handleHybridSearchResults}
                          onAISearch={setAiSearchResults}
                        />
                      </div>
                    </BlurFade>
                    
                    <BlurFade delay={0.3}>
                      <div className="mb-3 sm:mb-4 relative z-10">
                        <TopFilter
                          filters={filters}
                          selected={selectedFilters}
                          onFilterChange={handleFilterChange}
                          peopleData={processedPeopleData}
                          language={language}
                        />
                      </div>
                    </BlurFade>
                    
                    <FilterPillsBar
                      search={search}
                      selectedFilters={selectedFilters}
                      onRemove={handleRemovePill}
                      onMiscSkillToggle={handleMiscSkillToggle}
                      selectedMiscSkills={selectedMiscSkills}
                      language={language}
                    />
                    
                    {/* Enhanced Search Results Display */}
                    {hybridSearchResults && (
                      <SearchResultsDebugPanel
                        results={hybridSearchResults}
                        query={search}
                      />
                    )}
                    
                    {isAISearchActive && !hybridSearchResults && (
                      <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                          <SparklesIcon className="h-3 sm:h-4 w-3 sm:w-4" />
                          <span className="text-xs sm:text-sm font-medium">
                            AI Search Results: Found {filteredPeople.length} matching user{filteredPeople.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex-1 overflow-auto px-2 sm:px-3 lg:px-6 pb-4 sm:pb-6 pt-2 sm:pt-4 relative z-0 custom-scrollbar">
                <BlurFade delay={0.4}>
                  {skillMapViewMode === 'skills' ? (
                    <SkillBubbleMap
                      people={processedPeopleData}
                      language={language}
                      onPersonClick={handleCardClick}
                    />
                  ) : (
                    viewMode === 'grid' ? (
                      <PeopleGrid 
                        people={filteredPeople} 
                        onCardClick={handleCardClick}
                        onRoleClick={handleRoleClick}
                        onTeamClick={handleTeamClick}
                        onSkillClick={handleSkillClick}
                        onInterestClick={handleInterestClick}
                      />
                    ) : (
                      <PeopleList 
                        people={filteredPeople} 
                        onCardClick={handleCardClick}
                        onRoleClick={handleRoleClick}
                        onTeamClick={handleTeamClick}
                        onSkillClick={handleSkillClick}
                        onInterestClick={handleInterestClick}
                      />
                    )
                  )}
                </BlurFade>
              </div>
            </div>
          )}
        </div>
        
        {/* Sparkles background effect */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <Sparkles
            className="absolute inset-0"
            color="#3B82F6"
            count={50}
            speed="slow"
            size="small"
          />
        </div>
        
        {/* Profile Modal */}
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
            onRoleClick={handleRoleClick}
            onTeamClick={handleTeamClick}
            onSkillClick={handleSkillClick}
            onInterestClick={handleInterestClick}
            findRelatedPeople={findRelatedPeople}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export function App() {
  return <AppContent />;
}