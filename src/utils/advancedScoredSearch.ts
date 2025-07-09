// Advanced Scored Search System with Weighted Scoring, Spell Correction, and Enhanced Synonyms
import { expandSearchTerms } from './synonymMapping';

export interface ScoredResult {
  id: string;
  score: number;
  matchDetails: {
    titleExactMatch: number;
    titlePartialMatch: number;
    skillsMatch: number;
    bioMatch: number;
    experienceMatch: number;
    interestsMatch: number;
    githubMatch: number;
    totalScore: number;
  };
  person: any;
  matchedTerms: string[];
}

export interface ScoredSearchResponse {
  results: ScoredResult[];
  totalFound: number;
  query: string;
  correctedQuery?: string;
  expandedTerms: string[];
  processingTime: number;
}

// Scoring weights based on relevance hierarchy
const SCORING_WEIGHTS = {
  TITLE_EXACT: 100,        // 完全一致 (Designer = Designer)
  TITLE_PARTIAL: 70,       // 部分一致 (UI Designer contains Designer)
  SKILLS_MATCH: 50,        // スキル一致
  BIO_MATCH: 30,           // Bio一致
  EXPERIENCE_MATCH: 25,    // 経験一致 (ideas/projects)
  INTERESTS_MATCH: 20,     // 興味一致
  GITHUB_MATCH: 15,        // GitHub一致
  MINIMUM_THRESHOLD: 25    // 最小表示閾値
};

// Enhanced spell correction patterns (Japanese + English)
const SPELL_CORRECTIONS: Record<string, string[]> = {
  // English corrections
  'designer': ['desiner', 'dezigner', 'designr', 'desginer', 'desinger', 'designeer'],
  'developer': ['devloper', 'develper', 'developr', 'develope', 'develooper', 'developper'],
  'engineer': ['engneer', 'enginee', 'enginer', 'engieer', 'enginear', 'enginir'],
  'manager': ['manger', 'managr', 'maneger', 'mangaer', 'manageer', 'managar'],
  'product': ['prodcut', 'porduct', 'proudct', 'produkt', 'prodact', 'producct'],
  'frontend': ['front-end', 'front end', 'frontent', 'frontned', 'front-ned', 'frontand'],
  'backend': ['back-end', 'back end', 'backned', 'bakend', 'back-ned', 'backand'],
  'fullstack': ['full-stack', 'full stack', 'fulstack', 'fullstak', 'full-stak', 'fullstac'],
  'javascript': ['java script', 'javascrpt', 'javasript', 'javscript', 'javascript', 'java-script'],
  'typescript': ['type script', 'typescrpt', 'typescrit', 'typerscript', 'type-script', 'typscript'],
  'react': ['raect', 'recat', 'reactt', 'react.js', 'reactjs', 'reakt'],
  'vue': ['vue.js', 'vuejs', 'veu', 'view', 'vue js', 'vu'],
  'angular': ['angualr', 'anglar', 'angular.js', 'angularjs', 'angulr', 'anguar'],
  'python': ['pyhton', 'phyton', 'pythn', 'pythom', 'pyton', 'pythoon'],
  'java': ['jav', 'javaa', 'jva', 'jaava', 'jawa'],
  'node': ['nodejs', 'node.js', 'nod', 'node js', 'noed'],
  'database': ['databse', 'databas', 'datbase', 'data base', 'databaze'],
  'machine': ['machne', 'machin', 'mashine', 'machien', 'machinee'],
  'learning': ['lerning', 'learnig', 'learing', 'learnnig', 'leaning'],
  'artificial': ['artifical', 'artifcial', 'artficial', 'artificail', 'artificiall'],
  'intelligence': ['inteligence', 'intelligance', 'inteligance', 'intellgence', 'intelligense'],
  
  // Japanese corrections
  'デザイナー': ['デザイナ', 'デザイン', 'デザイナー', 'デザイナ―', 'デザイナ－'],
  'エンジニア': ['エンジニ', 'エンジニヤ', 'エンジニアー', 'エンジニア―', 'エンジニア－'],
  'プログラマー': ['プログラマ', 'プログラマー', 'プログラム', 'プログラマ―', 'プログラマ－'],
  'マネージャー': ['マネージャ', 'マネジャー', 'マネジャ', 'マネージャ―', 'マネージャ－'],
  'プロダクトマネージャー': ['プロダクトマネージャ', 'プロダクトマネジャー', 'プロダクトマネジャ', 'プロダクトマネージャ―'],
  'フロントエンド': ['フロント', 'フロントエンド', 'フロントエンドエンジニア', 'フロントエンド開発'],
  'バックエンド': ['バック', 'バックエンド', 'バックエンドエンジニア', 'バックエンド開発'],
  'フルスタック': ['フル', 'フルスタック', 'フルスタックエンジニア', 'フルスタック開発'],
  'スタートアップ': ['スタート', 'スタートアップ', 'ベンチャー', 'ベンチャー企業'],
  'ビジネス': ['ビジネス', 'ビジネス開発', 'ビジネスデベロップメント', 'ビジネス戦略'],
  'マーケティング': ['マーケ', 'マーケティング', 'マーケット', 'マーケティング戦略'],
  'クリエイティブ': ['クリエイティブ', 'クリエーティブ', 'クリエイター', 'クリエーター'],
  'アプリケーション': ['アプリ', 'アプリケーション', 'アプリ開発', 'アプリケーション開発'],
  'データサイエンス': ['データ', 'データサイエンス', 'データ分析', 'データサイエンティスト'],
  'プロジェクト': ['プロジェクト', 'プロジェクト管理', 'プロジェクトマネジメント', 'プロジェクトマネージャー']
};

// Enhanced synonym dictionary with comprehensive mappings
const ENHANCED_SYNONYMS: Record<string, string[]> = {
  // Design roles
  'designer': ['デザイナー', 'クリエーター', 'クリエイター', 'ui designer', 'ux designer', 'visual designer', 'graphic designer', 'web designer', 'product designer', 'interaction designer', 'service designer', 'creative director', 'art director'],
  'デザイナー': ['designer', 'クリエーター', 'クリエイター', 'ui designer', 'ux designer', 'visual designer', 'graphic designer', 'web designer', 'product designer', 'クリエイティブ', 'アートディレクター'],
  'creative': ['クリエイティブ', 'クリエーター', 'クリエイター', 'designer', 'デザイナー', 'artist', 'creator', 'creative director', 'art director'],
  'ui': ['ui designer', 'user interface', 'ユーザーインターフェース', 'interface designer', 'ui/ux', 'frontend designer'],
  'ux': ['ux designer', 'user experience', 'ユーザーエクスペリエンス', 'experience designer', 'ui/ux', 'product designer'],
  
  // Engineering roles
  'developer': ['エンジニア', 'プログラマー', 'coder', 'programmer', 'software engineer', 'web developer', 'app developer', 'full stack developer', 'software developer', 'システムエンジニア', '開発者'],
  'engineer': ['エンジニア', 'developer', 'プログラマー', 'software engineer', 'system engineer', 'devops engineer', 'data engineer', 'machine learning engineer', 'ai engineer', 'システムエンジニア', '開発者'],
  'エンジニア': ['engineer', 'developer', 'プログラマー', 'software engineer', 'system engineer', 'devops engineer', 'data engineer', 'システムエンジニア', '開発者', 'coder', 'programmer'],
  'programmer': ['プログラマー', 'developer', 'engineer', 'エンジニア', 'coder', 'software developer', 'software engineer', '開発者', 'システムエンジニア'],
  'プログラマー': ['programmer', 'developer', 'engineer', 'エンジニア', 'coder', 'software developer', 'software engineer', '開発者', 'システムエンジニア'],
  
  // Technology stack
  'frontend': ['front-end', 'front end', 'フロントエンド', 'ui developer', 'web developer', 'react developer', 'vue developer', 'angular developer', 'javascript developer', 'フロント'],
  'backend': ['back-end', 'back end', 'バックエンド', 'server developer', 'api developer', 'database developer', 'node developer', 'python developer', 'バック'],
  'fullstack': ['full-stack', 'full stack', 'フルスタック', 'full stack developer', 'fullstack developer', 'full-stack engineer', 'フル'],
  'javascript': ['js', 'javascript', 'java script', 'react', 'vue', 'angular', 'node', 'nodejs', 'typescript', 'ts'],
  'typescript': ['ts', 'typescript', 'type script', 'javascript', 'js', 'react', 'angular', 'node'],
  'react': ['reactjs', 'react.js', 'react js', 'javascript', 'frontend', 'ui', 'jsx', 'tsx'],
  'vue': ['vuejs', 'vue.js', 'vue js', 'javascript', 'frontend', 'ui', 'nuxt'],
  'angular': ['angularjs', 'angular.js', 'angular js', 'javascript', 'typescript', 'frontend', 'ui'],
  'node': ['nodejs', 'node.js', 'node js', 'javascript', 'backend', 'server', 'api'],
  'python': ['py', 'python', 'django', 'flask', 'fastapi', 'data science', 'machine learning', 'ai'],
  'java': ['java', 'spring', 'spring boot', 'backend', 'enterprise', 'android'],
  
  // Management roles
  'manager': ['マネージャー', 'pm', 'product manager', 'project manager', 'team lead', 'lead', 'director', 'プロダクトマネージャー', 'プロジェクトマネージャー', 'チームリーダー'],
  'マネージャー': ['manager', 'pm', 'product manager', 'project manager', 'team lead', 'lead', 'director', 'プロダクトマネージャー', 'プロジェクトマネージャー'],
  'pm': ['product manager', 'project manager', 'プロダクトマネージャー', 'プロジェクトマネージャー', 'manager', 'マネージャー', 'lead', 'director'],
  'product manager': ['pm', 'プロダクトマネージャー', 'product owner', 'po', 'manager', 'マネージャー', 'product lead'],
  'プロダクトマネージャー': ['product manager', 'pm', 'product owner', 'po', 'manager', 'マネージャー', 'product lead'],
  
  // AI/ML/Data
  'ai': ['人工知能', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'data science', 'neural network', 'ai engineer', 'ai researcher'],
  '人工知能': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'data science', 'neural network', 'ai engineer'],
  'ml': ['machine learning', 'ai', '人工知能', 'artificial intelligence', 'deep learning', 'data science', 'neural network', 'ml engineer'],
  'machine learning': ['ml', 'ai', '人工知能', 'artificial intelligence', 'deep learning', 'data science', 'neural network', 'ml engineer', 'machine learning engineer'],
  'data science': ['データサイエンス', 'data scientist', 'データサイエンティスト', 'ml', 'ai', 'machine learning', 'analytics', 'big data', 'statistics'],
  'データサイエンス': ['data science', 'data scientist', 'データサイエンティスト', 'ml', 'ai', 'machine learning', 'analytics', 'big data'],
  
  // Business/Startup
  'startup': ['スタートアップ', 'ベンチャー', 'venture', 'entrepreneur', 'founder', 'co-founder', 'startup founder', 'ベンチャー企業'],
  'スタートアップ': ['startup', 'ベンチャー', 'venture', 'entrepreneur', 'founder', 'co-founder', 'startup founder', 'ベンチャー企業'],
  'business': ['ビジネス', 'business development', 'bd', 'sales', 'marketing', 'strategy', 'consulting', 'ビジネス開発', 'ビジネス戦略'],
  'ビジネス': ['business', 'business development', 'bd', 'sales', 'marketing', 'strategy', 'consulting', 'ビジネス開発', 'ビジネス戦略'],
  'marketing': ['マーケティング', 'digital marketing', 'growth', 'marketing strategy', 'brand', 'advertising', 'マーケ', 'マーケティング戦略'],
  'マーケティング': ['marketing', 'digital marketing', 'growth', 'marketing strategy', 'brand', 'advertising', 'マーケ', 'マーケティング戦略'],
  
  // Other roles
  'founder': ['創業者', 'co-founder', 'startup founder', 'entrepreneur', 'ceo', 'startup', 'スタートアップ', 'ベンチャー'],
  'ceo': ['chief executive officer', 'founder', 'co-founder', 'executive', 'president', 'startup founder', '代表取締役', '社長'],
  'consultant': ['コンサルタント', 'consulting', 'advisor', 'strategy consultant', 'business consultant', 'コンサルティング', 'アドバイザー'],
  'researcher': ['研究者', 'research', 'scientist', 'ai researcher', 'data scientist', 'リサーチャー', '研究員', 'サイエンティスト']
};

// Spell correction function
function correctSpelling(query: string): string {
  const lowerQuery = query.toLowerCase().trim();
  
  // Check exact matches first
  for (const [correct, variations] of Object.entries(SPELL_CORRECTIONS)) {
    if (variations.includes(lowerQuery) || lowerQuery === correct) {
      return correct;
    }
  }
  
  // Check partial matches for compound terms
  for (const [correct, variations] of Object.entries(SPELL_CORRECTIONS)) {
    for (const variation of variations) {
      if (lowerQuery.includes(variation) || variation.includes(lowerQuery)) {
        return correct;
      }
    }
  }
  
  return query;
}

// Enhanced synonym expansion with spell correction
function expandWithSynonyms(query: string): string[] {
  const correctedQuery = correctSpelling(query);
  const lowerQuery = correctedQuery.toLowerCase().trim();
  
  // Start with the original and corrected query
  const expanded = new Set([query.trim(), correctedQuery]);
  
  // Add synonyms
  for (const [key, synonyms] of Object.entries(ENHANCED_SYNONYMS)) {
    if (key.toLowerCase() === lowerQuery || synonyms.some(syn => syn.toLowerCase() === lowerQuery)) {
      expanded.add(key);
      synonyms.forEach(syn => expanded.add(syn));
    }
  }
  
  // Add partial matches for compound terms
  for (const [key, synonyms] of Object.entries(ENHANCED_SYNONYMS)) {
    if (key.toLowerCase().includes(lowerQuery) || lowerQuery.includes(key.toLowerCase())) {
      expanded.add(key);
      synonyms.forEach(syn => expanded.add(syn));
    }
  }
  
  return Array.from(expanded).filter(term => term.length > 1);
}

// Advanced scoring function with detailed breakdown
function calculatePersonScore(person: any, query: string, expandedTerms: string[]): ScoredResult {
  const lowerQuery = query.toLowerCase().trim();
  const searchTerms = expandedTerms.map(term => term.toLowerCase().trim());
  
  let titleExactMatch = 0;
  let titlePartialMatch = 0;
  let skillsMatch = 0;
  let bioMatch = 0;
  let experienceMatch = 0;
  let interestsMatch = 0;
  let githubMatch = 0;
  const matchedTerms: string[] = [];
  
  // Extract and normalize person data
  const roles = (person.roles || '').toLowerCase();
  const skills = (person.skills || '').toLowerCase();
  const bio = (person.github_bio || '').toLowerCase();
  const interests = (person.interests || '').toLowerCase();
  const ideas = (person.ideas || '').toLowerCase();
  const githubLanguages = (person.github_languages || '').toLowerCase();
  const githubRepos = (person.github_repos || '').toLowerCase();
  const name = (person.name || '').toLowerCase();
  
  // Score title matches (roles) - highest priority
  searchTerms.forEach(term => {
    const termLower = term.toLowerCase().trim();
    if (roles.includes(termLower)) {
             // Check for exact role match (word boundary)
       const roleWords = roles.split(/[,\s\-/]+/).map((w: string) => w.trim()).filter((w: string) => w.length > 0);
      if (roleWords.includes(termLower)) {
        titleExactMatch += SCORING_WEIGHTS.TITLE_EXACT;
        matchedTerms.push(`Role Exact: ${term}`);
      } else {
        titlePartialMatch += SCORING_WEIGHTS.TITLE_PARTIAL;
        matchedTerms.push(`Role Partial: ${term}`);
      }
    }
  });
  
  // Score skills matches
  searchTerms.forEach(term => {
    const termLower = term.toLowerCase().trim();
    if (skills.includes(termLower)) {
      skillsMatch += SCORING_WEIGHTS.SKILLS_MATCH;
      matchedTerms.push(`Skills: ${term}`);
    }
  });
  
  // Score bio matches
  searchTerms.forEach(term => {
    const termLower = term.toLowerCase().trim();
    if (bio.includes(termLower)) {
      bioMatch += SCORING_WEIGHTS.BIO_MATCH;
      matchedTerms.push(`Bio: ${term}`);
    }
  });
  
  // Score experience matches (ideas/projects field)
  searchTerms.forEach(term => {
    const termLower = term.toLowerCase().trim();
    if (ideas.includes(termLower)) {
      experienceMatch += SCORING_WEIGHTS.EXPERIENCE_MATCH;
      matchedTerms.push(`Experience: ${term}`);
    }
  });
  
  // Score interests matches
  searchTerms.forEach(term => {
    const termLower = term.toLowerCase().trim();
    if (interests.includes(termLower)) {
      interestsMatch += SCORING_WEIGHTS.INTERESTS_MATCH;
      matchedTerms.push(`Interests: ${term}`);
    }
  });
  
  // Score GitHub matches (languages and repositories)
  searchTerms.forEach(term => {
    const termLower = term.toLowerCase().trim();
    if (githubLanguages.includes(termLower) || githubRepos.includes(termLower)) {
      githubMatch += SCORING_WEIGHTS.GITHUB_MATCH;
      matchedTerms.push(`GitHub: ${term}`);
    }
  });
  
  // Score name matches (bonus for direct name search)
  searchTerms.forEach(term => {
    const termLower = term.toLowerCase().trim();
    if (name.includes(termLower)) {
      titleExactMatch += SCORING_WEIGHTS.TITLE_EXACT / 2; // Half weight for name matches
      matchedTerms.push(`Name: ${term}`);
    }
  });
  
  const totalScore = titleExactMatch + titlePartialMatch + skillsMatch + bioMatch + experienceMatch + interestsMatch + githubMatch;
  
  return {
    id: String(person.id),
    score: totalScore,
    matchDetails: {
      titleExactMatch,
      titlePartialMatch,
      skillsMatch,
      bioMatch,
      experienceMatch,
      interestsMatch,
      githubMatch,
      totalScore
    },
    person,
    matchedTerms: [...new Set(matchedTerms)] // Remove duplicates
  };
}

 // Main scored search function
 export async function performScoredSearch(query: string, maxResults = 20): Promise<ScoredSearchResponse> {
  const startTime = Date.now();
  
  try {
    // Load people data
    const response = await fetch('/people_with_github.json');
    const jsonData = await response.json();
    const participants = jsonData.participants || jsonData;
    
    // Correct spelling and expand synonyms
    const correctedQuery = correctSpelling(query);
    const expandedTerms = expandWithSynonyms(correctedQuery);
    
    console.log('Scored Search Query:', query);
    console.log('Corrected Query:', correctedQuery);
    console.log('Expanded Terms:', expandedTerms);
    
    // Process each person and calculate scores
    const scoredResults: ScoredResult[] = [];
    
    participants.forEach((person: any) => {
      // Create searchable person object
      const searchablePerson = {
        id: person.id,
        name: `${person.name?.ja || ''} ${person.name?.en || ''}`.trim(),
        roles: `${person.role?.map((r: any) => `${r.ja} ${r.en}`).join(', ') || ''}`,
        skills: `${person.specialty?.map((s: any) => `${s.ja} ${s.en}`).join(', ') || ''}`,
        interests: `${person.interests?.map((i: any) => `${i.ja} ${i.en}`).join(', ') || ''}`,
        ideas: `${person.ideas?.map((i: any) => `${i.ja} ${i.en}`).join(', ') || ''}`,
        github_bio: person.github_enhanced?.profile.bio || '',
        github_languages: person.github_enhanced?.languages.topLanguages?.join(', ') || '',
        github_repos: person.github_enhanced?.topRepos?.map((repo: any) => `${repo.name} ${repo.description || ''}`).join(', ') || '',
        team: `${person.team?.ja || ''} ${person.team?.en || ''}`.trim(),
        originalPerson: person
      };
      
      const scoredResult = calculatePersonScore(searchablePerson, query, expandedTerms);
      
      // Only include results above minimum threshold
      if (scoredResult.score >= SCORING_WEIGHTS.MINIMUM_THRESHOLD) {
        scoredResults.push(scoredResult);
      }
    });
    
    // Sort by score (descending) and limit results
    const sortedResults = scoredResults
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
    
    const processingTime = Date.now() - startTime;
    
    console.log(`Scored Search Results (${sortedResults.length}/${scoredResults.length}):`, 
      sortedResults.map(r => ({ 
        id: r.id, 
        name: r.person.name, 
        score: r.score, 
        matches: r.matchedTerms 
      }))
    );
    
    return {
      results: sortedResults,
      totalFound: scoredResults.length,
      query,
      correctedQuery: correctedQuery !== query ? correctedQuery : undefined,
      expandedTerms,
      processingTime
    };
    
  } catch (error) {
    console.error('Scored search error:', error);
    return {
      results: [],
      totalFound: 0,
      query,
      expandedTerms: [query],
      processingTime: Date.now() - startTime
    };
  }
}

// Helper function to format score details for debugging
export function formatScoreDetails(result: ScoredResult): string {
  const { matchDetails } = result;
  const details = [];
  
  if (matchDetails.titleExactMatch > 0) details.push(`Title Exact: +${matchDetails.titleExactMatch}`);
  if (matchDetails.titlePartialMatch > 0) details.push(`Title Partial: +${matchDetails.titlePartialMatch}`);
  if (matchDetails.skillsMatch > 0) details.push(`Skills: +${matchDetails.skillsMatch}`);
  if (matchDetails.bioMatch > 0) details.push(`Bio: +${matchDetails.bioMatch}`);
  if (matchDetails.experienceMatch > 0) details.push(`Experience: +${matchDetails.experienceMatch}`);
  if (matchDetails.interestsMatch > 0) details.push(`Interests: +${matchDetails.interestsMatch}`);
  if (matchDetails.githubMatch > 0) details.push(`GitHub: +${matchDetails.githubMatch}`);
  
  return `Total: ${matchDetails.totalScore} (${details.join(', ')})`;
} 