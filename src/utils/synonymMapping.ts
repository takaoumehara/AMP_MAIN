// Comprehensive Multilingual and Synonym Mapping System
export interface SynonymGroup {
  canonical: { en: string; ja: string };
  synonyms: {
    en: string[];
    ja: string[];
    mixed: string[];
  };
  category: 'role' | 'skill' | 'technology' | 'domain';
}

// Comprehensive synonym mappings
export const SYNONYM_GROUPS: SynonymGroup[] = [
  // Design & Creative Roles
  {
    canonical: { en: 'Designer', ja: 'デザイナー' },
    synonyms: {
      en: ['designer', 'design', 'ui designer', 'ux designer', 'ui/ux designer', 'creative', 'creator', 'visual designer', 'graphic designer', 'product designer'],
      ja: ['デザイナー', 'デザイン', 'UIデザイナー', 'UXデザイナー', 'UI/UXデザイナー', 'クリエイター', 'クリエーター', 'ビジュアルデザイナー', 'グラフィックデザイナー', 'プロダクトデザイナー'],
      mixed: ['UI/UX', 'Web Designer', 'Webデザイナー']
    },
    category: 'role'
  },
  
  // Engineering Roles
  {
    canonical: { en: 'Engineer', ja: 'エンジニア' },
    synonyms: {
      en: ['engineer', 'developer', 'dev', 'programmer', 'coder', 'software engineer', 'software developer', 'full-stack', 'fullstack', 'backend engineer', 'frontend engineer'],
      ja: ['エンジニア', '開発者', 'プログラマー', 'ソフトウェアエンジニア', 'ソフトウェア開発者', 'フルスタック', 'バックエンドエンジニア', 'フロントエンドエンジニア'],
      mixed: ['Full-stack', 'Backend', 'Frontend', 'Web Developer', 'Webエンジニア']
    },
    category: 'role'
  },
  
  // Management Roles
  {
    canonical: { en: 'Product Manager', ja: 'プロダクトマネージャー' },
    synonyms: {
      en: ['product manager', 'pm', 'product owner', 'po', 'product lead', 'project manager'],
      ja: ['プロダクトマネージャー', 'PM', 'プロダクトオーナー', 'PO', 'プロダクトリード', 'プロジェクトマネージャー'],
      mixed: ['PM', 'PO']
    },
    category: 'role'
  },
  
  // Planning Roles
  {
    canonical: { en: 'Planning', ja: '企画' },
    synonyms: {
      en: ['planning', 'planner', 'strategist', 'strategy', 'business planning', 'product planning'],
      ja: ['企画', 'プランナー', 'ストラテジスト', '戦略', '事業企画', 'プロダクト企画', 'プランニング'],
      mixed: ['Business Planning', 'Product Planning']
    },
    category: 'role'
  },
  
  // Business Development
  {
    canonical: { en: 'Business Development', ja: '事業開発' },
    synonyms: {
      en: ['business development', 'biz dev', 'bizdev', 'bd', 'business developer'],
      ja: ['事業開発', 'ビジネスデベロップメント', 'ビズデブ', '新規事業'],
      mixed: ['BizDev', 'BD']
    },
    category: 'role'
  },
  
  // Sales & Marketing
  {
    canonical: { en: 'Sales', ja: '営業' },
    synonyms: {
      en: ['sales', 'salesperson', 'sales rep', 'account manager'],
      ja: ['営業', 'セールス', '営業担当', 'アカウントマネージャー'],
      mixed: ['Sales Rep', 'Account Manager']
    },
    category: 'role'
  },
  
  // Founder & Leadership
  {
    canonical: { en: 'Founder', ja: 'ファウンダー' },
    synonyms: {
      en: ['founder', 'co-founder', 'ceo', 'entrepreneur', 'startup founder'],
      ja: ['ファウンダー', '創業者', '共同創業者', 'CEO', '起業家', 'スタートアップファウンダー'],
      mixed: ['Co-founder', 'CEO', 'CTO', 'Entrepreneur']
    },
    category: 'role'
  },
  
  // AI & Technology
  {
    canonical: { en: 'Artificial Intelligence', ja: '人工知能' },
    synonyms: {
      en: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'neural networks', 'ai engineer', 'ml engineer'],
      ja: ['AI', '人工知能', '機械学習', 'ML', 'ディープラーニング', '深層学習', 'ニューラルネットワーク', 'AIエンジニア', 'MLエンジニア'],
      mixed: ['AI/ML', 'AI Engineer', 'ML Engineer', 'AIエンジニア', 'MLエンジニア']
    },
    category: 'technology'
  },
  
  // Web Technologies
  {
    canonical: { en: 'Frontend Development', ja: 'フロントエンド開発' },
    synonyms: {
      en: ['frontend', 'front-end', 'frontend development', 'react', 'vue', 'angular', 'javascript', 'typescript', 'web development'],
      ja: ['フロントエンド', 'フロントエンド開発', 'React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'Web開発'],
      mixed: ['React', 'Vue.js', 'Angular', 'JavaScript', 'TypeScript', 'Next.js', 'Nuxt.js']
    },
    category: 'technology'
  },
  
  {
    canonical: { en: 'Backend Development', ja: 'バックエンド開発' },
    synonyms: {
      en: ['backend', 'back-end', 'backend development', 'server', 'api', 'database', 'node.js', 'python', 'java', 'go'],
      ja: ['バックエンド', 'バックエンド開発', 'サーバー', 'API', 'データベース', 'Node.js', 'Python', 'Java', 'Go'],
      mixed: ['API Development', 'Server-side', 'Node.js', 'Express.js', 'Django', 'Spring Boot']
    },
    category: 'technology'
  },
  
  // Mobile Development
  {
    canonical: { en: 'Mobile Development', ja: 'モバイル開発' },
    synonyms: {
      en: ['mobile', 'mobile development', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin'],
      ja: ['モバイル', 'モバイル開発', 'iOS', 'Android', 'React Native', 'Flutter', 'Swift', 'Kotlin'],
      mixed: ['iOS', 'Android', 'React Native', 'Flutter', 'Swift', 'Kotlin']
    },
    category: 'technology'
  },
  
  // Data & Analytics
  {
    canonical: { en: 'Data Science', ja: 'データサイエンス' },
    synonyms: {
      en: ['data science', 'data scientist', 'data analysis', 'analytics', 'big data', 'data engineer', 'data analyst'],
      ja: ['データサイエンス', 'データサイエンティスト', 'データ分析', 'アナリティクス', 'ビッグデータ', 'データエンジニア', 'データアナリスト'],
      mixed: ['Data Science', 'Big Data', 'Data Engineer', 'Data Analyst']
    },
    category: 'technology'
  },
  
  // Extended Creative & Design Terms
  {
    canonical: { en: 'Creative', ja: 'クリエイティブ' },
    synonyms: {
      en: ['creative', 'creative director', 'art director', 'visual artist', 'graphic artist', 'creative professional'],
      ja: ['クリエイティブ', 'クリエイティブディレクター', 'アートディレクター', 'ビジュアルアーティスト', 'グラフィックアーティスト', 'クリエイティブプロフェッショナル'],
      mixed: ['Creative Director', 'Art Director', 'Visual Artist']
    },
    category: 'role'
  },
  
  // Marketing & PR
  {
    canonical: { en: 'Marketing', ja: 'マーケティング' },
    synonyms: {
      en: ['marketing', 'marketer', 'digital marketing', 'content marketing', 'social media marketing', 'growth marketing'],
      ja: ['マーケティング', 'マーケター', 'デジタルマーケティング', 'コンテンツマーケティング', 'ソーシャルメディアマーケティング', 'グロースマーケティング'],
      mixed: ['Digital Marketing', 'Content Marketing', 'Growth Marketing', 'SNS Marketing']
    },
    category: 'role'
  },
  
  // Robotics & IoT
  {
    canonical: { en: 'Robotics', ja: 'ロボティクス' },
    synonyms: {
      en: ['robotics', 'robot', 'automation', 'mechatronics', 'robotic engineering', 'industrial automation'],
      ja: ['ロボティクス', 'ロボット', 'オートメーション', 'メカトロニクス', 'ロボット工学', '産業自動化'],
      mixed: ['Robotics Engineering', 'Industrial Automation', 'Mechatronics']
    },
    category: 'technology'
  },
  
  // Blockchain & Crypto
  {
    canonical: { en: 'Blockchain', ja: 'ブロックチェーン' },
    synonyms: {
      en: ['blockchain', 'cryptocurrency', 'crypto', 'bitcoin', 'ethereum', 'defi', 'nft', 'web3'],
      ja: ['ブロックチェーン', '暗号通貨', 'クリプト', 'ビットコイン', 'イーサリアム', 'DeFi', 'NFT', 'Web3'],
      mixed: ['Blockchain', 'Cryptocurrency', 'DeFi', 'NFT', 'Web3']
    },
    category: 'technology'
  },
  
  // Cloud & DevOps
  {
    canonical: { en: 'Cloud Computing', ja: 'クラウドコンピューティング' },
    synonyms: {
      en: ['cloud', 'cloud computing', 'aws', 'azure', 'gcp', 'devops', 'infrastructure', 'docker', 'kubernetes'],
      ja: ['クラウド', 'クラウドコンピューティング', 'AWS', 'Azure', 'GCP', 'DevOps', 'インフラ', 'Docker', 'Kubernetes'],
      mixed: ['Cloud Computing', 'AWS', 'Azure', 'GCP', 'DevOps', 'Docker', 'Kubernetes']
    },
    category: 'technology'
  },
  
  // Gaming & Entertainment
  {
    canonical: { en: 'Game Development', ja: 'ゲーム開発' },
    synonyms: {
      en: ['game development', 'game developer', 'game design', 'game programmer', 'unity', 'unreal engine', 'indie game'],
      ja: ['ゲーム開発', 'ゲーム開発者', 'ゲームデザイン', 'ゲームプログラマー', 'Unity', 'Unreal Engine', 'インディーゲーム'],
      mixed: ['Game Development', 'Game Design', 'Unity', 'Unreal Engine', 'Indie Game']
    },
    category: 'technology'
  }
];

// Optimized search index with caching and performance improvements
class SynonymSearchIndex {
  private termToGroups = new Map<string, SynonymGroup[]>();
  private expansionCache = new Map<string, string[]>();
  private normalizeCache = new Map<string, string>();
  private synonymCache = new Map<string, boolean>();
  
  constructor() {
    this.buildIndex();
  }
  
  private buildIndex(): void {
    SYNONYM_GROUPS.forEach(group => {
      // Add canonical terms
      this.addTerm(group.canonical.en.toLowerCase(), group);
      this.addTerm(group.canonical.ja.toLowerCase(), group);
      
      // Add all synonyms with optimized iteration
      const allSynonyms = [...group.synonyms.en, ...group.synonyms.ja, ...group.synonyms.mixed];
      allSynonyms.forEach(synonym => {
        this.addTerm(synonym.toLowerCase(), group);
      });
    });
  }
  
  private addTerm(term: string, group: SynonymGroup): void {
    if (!this.termToGroups.has(term)) {
      this.termToGroups.set(term, []);
    }
    this.termToGroups.get(term)!.push(group);
  }
  
  // Find all related terms for a given search term with caching
  findRelatedTerms(searchTerm: string): string[] {
    const lowerTerm = searchTerm.toLowerCase().trim();
    
    // Check cache first
    if (this.expansionCache.has(lowerTerm)) {
      return this.expansionCache.get(lowerTerm)!;
    }
    
    const relatedTerms = new Set<string>();
    
    // Direct matches
    const directGroups = this.termToGroups.get(lowerTerm) || [];
    directGroups.forEach(group => {
      this.addGroupTerms(group, relatedTerms);
    });
    
    // Partial matches (for compound terms) - optimized with early termination
    if (relatedTerms.size === 0) {
      for (const [term, groups] of this.termToGroups.entries()) {
        if (term.includes(lowerTerm) || lowerTerm.includes(term)) {
          groups.forEach(group => {
            this.addGroupTerms(group, relatedTerms);
          });
          // Early termination if we found matches
          if (relatedTerms.size > 0) break;
        }
      }
    }
    
    const result = Array.from(relatedTerms);
    
    // Cache the result
    this.expansionCache.set(lowerTerm, result);
    
    return result;
  }
  
  // Helper method to add all terms from a group
  private addGroupTerms(group: SynonymGroup, termSet: Set<string>): void {
    termSet.add(group.canonical.en.toLowerCase());
    termSet.add(group.canonical.ja.toLowerCase());
    
    const allSynonyms = [...group.synonyms.en, ...group.synonyms.ja, ...group.synonyms.mixed];
    allSynonyms.forEach(synonym => {
      termSet.add(synonym.toLowerCase());
    });
  }
  
  // Normalize a term to its canonical form
  normalizeToCanonical(term: string, language: 'en' | 'ja' = 'en'): string {
    const lowerTerm = term.toLowerCase().trim();
    const groups = this.termToGroups.get(lowerTerm) || [];
    
    if (groups.length > 0) {
      return groups[0].canonical[language];
    }
    
    // Check for partial matches
    for (const [indexTerm, indexGroups] of this.termToGroups.entries()) {
      if (indexTerm.includes(lowerTerm) || lowerTerm.includes(indexTerm)) {
        return indexGroups[0].canonical[language];
      }
    }
    
    return term; // Return original if no match found
  }
  
  // Check if two terms are synonymous
  areSynonymous(term1: string, term2: string): boolean {
    const relatedTerms1 = this.findRelatedTerms(term1);
    const relatedTerms2 = this.findRelatedTerms(term2);
    
    return relatedTerms1.some(t1 => relatedTerms2.some(t2 => t1 === t2));
  }
  
  // Expand a search query with all related terms
  expandQuery(query: string): string[] {
    const words = query.toLowerCase().split(/\s+/);
    const expandedTerms = new Set<string>();
    
    words.forEach(word => {
      expandedTerms.add(word);
      const related = this.findRelatedTerms(word);
      related.forEach(term => expandedTerms.add(term));
    });
    
    return Array.from(expandedTerms);
  }
}

// Export singleton instance
export const synonymIndex = new SynonymSearchIndex();

// Utility functions
export function expandSearchTerms(query: string): string[] {
  return synonymIndex.expandQuery(query);
}

export function normalizeRole(role: string, language: 'en' | 'ja' = 'en'): string {
  return synonymIndex.normalizeToCanonical(role, language);
}

export function areTermsSynonymous(term1: string, term2: string): boolean {
  return synonymIndex.areSynonymous(term1, term2);
}

// Enhanced search function that uses synonym expansion
export function enhancedTextSearch(searchText: string, targetText: string): boolean {
  const searchLower = searchText.toLowerCase();
  const targetLower = targetText.toLowerCase();
  
  // Direct match
  if (targetLower.includes(searchLower)) {
    return true;
  }
  
  // Synonym-based matching
  const expandedSearchTerms = expandSearchTerms(searchText);
  return expandedSearchTerms.some(term => targetLower.includes(term));
}

// Create comprehensive search patterns for AI prompts
export function createSearchPatterns(query: string): string {
  const expandedTerms = expandSearchTerms(query);
  const patterns: string[] = [];
  
  // Group by language and category
  const englishTerms = expandedTerms.filter(term => /^[a-zA-Z\s\-/.]+$/.test(term));
  const japaneseTerms = expandedTerms.filter(term => /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(term));
  
  if (englishTerms.length > 0) {
    patterns.push(`English terms: ${englishTerms.join(', ')}`);
  }
  
  if (japaneseTerms.length > 0) {
    patterns.push(`Japanese terms: ${japaneseTerms.join(', ')}`);
  }
  
  return patterns.join(' | ');
} 