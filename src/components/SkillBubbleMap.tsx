import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { X, Mail, ExternalLink, Users, TrendingUp, BarChart3, Search, ChevronRight, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { getPillClasses } from '../lib/pillColors';

// 改善されたスキルカテゴリの定義
const SKILL_CATEGORIES = {
  strategy: {
    name: { en: 'Strategy & Business', ja: '戦略・ビジネス' },
    color: '#3B82F6',
    lightColor: '#DBEAFE',
    darkColor: '#1E40AF',
    gradient: 'from-blue-400 to-blue-600',
    icon: '🎯',
    description: { en: 'Strategic planning and business development', ja: '戦略立案・事業開発' }
  },
  design: {
    name: { en: 'Design & UX', ja: 'デザイン・UX' },
    color: '#10B981',
    lightColor: '#D1FAE5',
    darkColor: '#047857',
    gradient: 'from-green-400 to-green-600',
    icon: '🎨',
    description: { en: 'User experience and visual design', ja: 'ユーザー体験・視覚デザイン' }
  },
  futures: {
    name: { en: 'Futures & Innovation', ja: '未来研究・イノベーション' },
    color: '#F59E0B',
    lightColor: '#FEF3C7',
    darkColor: '#D97706',
    gradient: 'from-yellow-400 to-yellow-600',
    icon: '🚀',
    description: { en: 'Future studies and innovation', ja: '未来研究・イノベーション' }
  },
  technology: {
    name: { en: 'Engineering & Technology', ja: 'エンジニアリング・テクノロジー' },
    color: '#8B5CF6',
    lightColor: '#EDE9FE',
    darkColor: '#6D28D9',
    gradient: 'from-purple-400 to-purple-600',
    icon: '💻',
    description: { en: 'Software engineering and technology', ja: 'ソフトウェアエンジニアリング・テクノロジー' }
  },
  business: {
    name: { en: 'Business Operations', ja: 'ビジネス運営' },
    color: '#EF4444',
    lightColor: '#FEE2E2',
    darkColor: '#DC2626',
    gradient: 'from-red-400 to-red-600',
    icon: '📊',
    description: { en: 'Business operations and management', ja: 'ビジネス運営・管理' }
  }
};

// スキルカテゴリマッピング（拡張）
const SKILL_MAPPING: { [key: string]: keyof typeof SKILL_CATEGORIES } = {
  // Strategy
  'Product Management': 'strategy',
  'Business Development': 'strategy',
  'Project Management': 'strategy',
  'プロダクトマネジメント': 'strategy',
  'プロダクトマネージャー': 'strategy',
  '事業開発': 'strategy',
  'ビジネス開発': 'strategy',
  'プロジェクトマネジメント': 'strategy',
  'Marketing': 'strategy',
  'マーケティング': 'strategy',
  'Strategy': 'strategy',
  '戦略': 'strategy',
  'Consulting': 'strategy',
  'コンサルティング': 'strategy',
  
  // Design
  'UI Design': 'design',
  'UX Design': 'design',
  'UI/UX Design': 'design',
  'UIデザイン': 'design',
  'UXデザイン': 'design',
  'UI/UXデザイン': 'design',
  'Graphic Design': 'design',
  'グラフィックデザイン': 'design',
  'Design Thinking': 'design',
  'デザイン思考': 'design',
  'Worldbuilding': 'design',
  'ワールドビルディング': 'design',
  'Visual Design': 'design',
  'ビジュアルデザイン': 'design',
  'Prototyping': 'design',
  'プロトタイピング': 'design',
  
  // Futures Studies
  'Futures Studies': 'futures',
  '未来研究': 'futures',
  'Science Fiction': 'futures',
  'サイエンスフィクション': 'futures',
  'Anticipation Studies': 'futures',
  '予測研究': 'futures',
  'Transition Design': 'futures',
  'トランジションデザイン': 'futures',
  'Innovation': 'futures',
  'イノベーション': 'futures',
  'Foresight': 'futures',
  '先見性': 'futures',
  
  // Technology
  'JavaScript': 'technology',
  'TypeScript': 'technology',
  'Python': 'technology',
  'React': 'technology',
  'Node.js': 'technology',
  'AI': 'technology',
  'Machine Learning': 'technology',
  '機械学習': 'technology',
  '人工知能': 'technology',
  'Web Development': 'technology',
  'Web開発': 'technology',
  'Mobile Development': 'technology',
  'モバイル開発': 'technology',
  'Frontend': 'technology',
  'Backend': 'technology',
  'フロントエンド': 'technology',
  'バックエンド': 'technology',
  'DevOps': 'technology',
  'Cloud': 'technology',
  'クラウド': 'technology',
  'Database': 'technology',
  'データベース': 'technology',
  'Security': 'technology',
  'セキュリティ': 'technology',
  
  // Business
  'Sales': 'business',
  '営業': 'business',
  'セールス': 'business',
  'Finance': 'business',
  '財務': 'business',
  'Accounting': 'business',
  '会計': 'business',
  'HR': 'business',
  '人事': 'business',
  'Operations': 'business',
  '運営': 'business',
  'Management': 'business',
  'マネジメント': 'business',
  'Leadership': 'business',
  'リーダーシップ': 'business'
};

interface SkillData {
  skill: string;
  count: number;
  category: keyof typeof SKILL_CATEGORIES;
  people: Array<{
    id: number;
    name: string;
    avatar?: string;
    role: string;
    team: string;
    email?: string;
    avatar_initials?: string;
    avatar_color?: string;
    profileImage?: string;
  }>;
}

interface CategoryData {
  category: keyof typeof SKILL_CATEGORIES;
  skills: SkillData[];
  totalCount: number;
  averageSkillsPerPerson: number;
  topSkills: SkillData[];
}

interface TreemapNode {
  skill: string;
  count: number;
  category: keyof typeof SKILL_CATEGORIES;
  people: any[];
  x: number;
  y: number;
  width: number;
  height: number;
  area: number;
  categoryX: number;
  categoryY: number;
  categoryWidth: number;
  categoryHeight: number;
}

interface SkillBubbleMapProps {
  people: any[];
  language: 'en' | 'ja';
  onPersonClick?: (person: any) => void;
}

  // 改善されたツリーマップレイアウトアルゴリズム（重複防止、縦スクロール対応）
  function calculateImprovedTreemapLayout(skills: SkillData[], width: number): TreemapNode[] {
    const totalCount = skills.reduce((sum, skill) => sum + skill.count, 0);
    
    // カテゴリ別にスキルをグループ化
    const categories: { [key: string]: SkillData[] } = {};
    skills.forEach(skill => {
      if (!categories[skill.category]) {
        categories[skill.category] = [];
      }
      categories[skill.category].push(skill);
    });
    
    // カテゴリを縦に並べる（重複防止、適切な間隔）
    const result: TreemapNode[] = [];
    let currentY = 0;
    const categorySpacing = 40; // 重複防止のため間隔を拡大
    const minCategoryHeight = 220; // 最小高さを増加
    
    // カテゴリの順序を定義（デザイン的に重要な順）
    const categoryOrder = ['strategy', 'design', 'futures', 'technology', 'business'];
    
    categoryOrder.forEach(categoryKey => {
      if (!categories[categoryKey]) return;
      
      const categorySkills = categories[categoryKey];
      const categoryTotal = categorySkills.reduce((sum, skill) => sum + skill.count, 0);
      const categoryRatio = categoryTotal / totalCount;
      
      // カテゴリの高さを計算（重複防止のため調整）
      const dynamicHeight = Math.max(
        minCategoryHeight, 
        categoryRatio * 500 + 120,
        Math.ceil(categorySkills.length / 4) * 80 + 100 // スキル数に応じた高さ
      );
      
      const categoryNodes = layoutCategorySkills(
        categorySkills,
        0,
        currentY,
        width,
        dynamicHeight,
        { x: 0, y: currentY, width, height: dynamicHeight }
      );
      
      result.push(...categoryNodes);
      currentY += dynamicHeight + categorySpacing;
    });
    
    return result;
  }

// カテゴリ内スキルレイアウト（改善版）
function layoutCategorySkills(
  skills: SkillData[],
  x: number,
  y: number,
  width: number,
  height: number,
  categoryRect: { x: number; y: number; width: number; height: number }
): TreemapNode[] {
  if (skills.length === 0) return [];
  
  const totalCount = skills.reduce((sum, skill) => sum + skill.count, 0);
  
  // パディングを追加
  const padding = 16;
  const headerHeight = 50; // カテゴリヘッダー用の高さ
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2 - headerHeight;
  const innerX = x + padding;
  const innerY = y + padding + headerHeight;
  
  const result: TreemapNode[] = [];
  const sortedSkills = [...skills].sort((a, b) => b.count - a.count);
  
  // フレキシブルグリッドレイアウト
  let currentX = innerX;
  let currentY = innerY;
  let currentRowHeight = 0;
  let remainingWidth = innerWidth;
  
  for (const skill of sortedSkills) {
    const skillRatio = skill.count / totalCount;
    const baseArea = skillRatio * (innerWidth * innerHeight);
    
    // 最小・最大サイズ制約
         const minWidth = 80;
     const maxWidth = 200;
     const minHeight = 40;
     const maxHeight = 80;
     
     let skillWidth = Math.max(minWidth, Math.min(maxWidth, Math.sqrt(baseArea * 2)));
     let skillHeight = Math.max(minHeight, Math.min(maxHeight, baseArea / skillWidth));
     
     // 行の折り返し判定
     if (skillWidth > remainingWidth && currentX > innerX) {
       currentX = innerX;
       currentY += currentRowHeight + 8;
       currentRowHeight = 0;
       remainingWidth = innerWidth;
       
       skillWidth = Math.min(skillWidth, remainingWidth);
       skillHeight = Math.max(minHeight, Math.min(maxHeight, baseArea / skillWidth));
     }
    
    result.push({
      ...skill,
      x: currentX,
      y: currentY,
      width: skillWidth,
      height: skillHeight,
      area: baseArea,
      categoryX: categoryRect.x,
      categoryY: categoryRect.y,
      categoryWidth: categoryRect.width,
      categoryHeight: categoryRect.height
    });
    
    currentX += skillWidth + 8;
    remainingWidth -= skillWidth + 8;
    currentRowHeight = Math.max(currentRowHeight, skillHeight);
  }
  
  return result;
}

const SkillBubbleMap: React.FC<SkillBubbleMapProps> = ({
  people,
  language,
  onPersonClick
}) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillData | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<SkillData | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<keyof typeof SKILL_CATEGORIES | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedSkill, setHighlightedSkill] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // スキル正規化関数
  const normalizeSkill = (skill: string): string => {
    // 基本的な正規化
    let normalized = skill.trim();
    
    // 英語と日本語の統一
    const translations: { [key: string]: string } = {
      'エンジニア': 'Engineering',
      'デザイナー': 'Design',
      'マネージャー': 'Manager',
      'マーケティング': 'Marketing',
      'プロダクト': 'Product',
      'ビジネス': 'Business',
      'データ': 'Data',
      'サイエンス': 'Science',
      'AI': 'Artificial Intelligence',
      'ML': 'Machine Learning',
      'UI': 'User Interface',
      'UX': 'User Experience',
      'プログラミング': 'Programming',
      'ウェブ': 'Web',
      'アプリ': 'App',
      'システム': 'System',
      'データベース': 'Database',
      'フロントエンド': 'Frontend',
      'バックエンド': 'Backend',
      'インフラ': 'Infrastructure',
      'セキュリティ': 'Security',
      'クラウド': 'Cloud'
    };
    
    // 翻訳適用
    Object.keys(translations).forEach(key => {
      normalized = normalized.replace(new RegExp(key, 'gi'), translations[key]);
    });
    
    // 類似スキルの統合
    const synonyms: { [key: string]: string } = {
      'React.js': 'React',
      'ReactJS': 'React',
      'Node.js': 'Node',
      'NodeJS': 'Node',
      'Vue.js': 'Vue',
      'VueJS': 'Vue',
      'Angular.js': 'Angular',
      'AngularJS': 'Angular',
      'JavaScript': 'JavaScript',
      'TypeScript': 'TypeScript',
      'Python': 'Python',
      'Java': 'Java',
      'C++': 'C++',
      'C#': 'C#',
      'Go': 'Go',
      'Rust': 'Rust',
      'Swift': 'Swift',
      'Kotlin': 'Kotlin',
      'Dart': 'Dart',
      'Ruby': 'Ruby',
      'PHP': 'PHP',
      'HTML': 'HTML',
      'CSS': 'CSS',
      'SASS': 'SASS',
      'SCSS': 'SCSS',
      'Product Management': 'Product Management',
      'Project Management': 'Project Management',
      'UI Design': 'UI Design',
      'UX Design': 'UX Design',
      'Web Development': 'Web Development',
      'Mobile Development': 'Mobile Development',
      'Data Science': 'Data Science',
      'Machine Learning': 'Machine Learning',
      'Artificial Intelligence': 'Artificial Intelligence',
      'DevOps': 'DevOps',
      'Cloud Computing': 'Cloud Computing',
      'Cybersecurity': 'Security',
      'Database': 'Database',
      'SQL': 'SQL',
      'NoSQL': 'NoSQL',
      'MongoDB': 'MongoDB',
      'PostgreSQL': 'PostgreSQL',
      'MySQL': 'MySQL',
      'Redis': 'Redis',
      'GraphQL': 'GraphQL',
      'REST API': 'REST API',
      'Microservices': 'Microservices',
      'Docker': 'Docker',
      'Kubernetes': 'Kubernetes',
      'AWS': 'AWS',
      'Google Cloud': 'Google Cloud',
      'Azure': 'Azure',
      'Firebase': 'Firebase',
      'Git': 'Git',
      'GitHub': 'GitHub',
      'GitLab': 'GitLab',
      'Agile': 'Agile',
      'Scrum': 'Scrum',
      'Kanban': 'Kanban'
    };
    
    // 同義語の適用
    Object.keys(synonyms).forEach(key => {
      if (normalized.toLowerCase().includes(key.toLowerCase())) {
        normalized = synonyms[key];
      }
    });
    
    return normalized;
  };

  // 改善されたスキルデータの処理（/区切り対応、正規化）
  const { skillsData, categoriesData, totalStats } = useMemo(() => {
    const skillMap = new Map<string, SkillData>();

    people.forEach(person => {
      const skills = person.skills || [];
      
      // スキルを処理（/区切り対応）
      const processedSkills: string[] = [];
      skills.forEach((skill: string) => {
        if (!skill) return;
        
        // /で区切る
        const splitSkills = skill.split('/').map(s => s.trim()).filter(s => s);
        processedSkills.push(...splitSkills);
      });
      
      // 正規化されたスキルを処理
      processedSkills.forEach((skill: string) => {
        const normalizedSkill = normalizeSkill(skill);
        if (!normalizedSkill) return;
        
        const category = SKILL_MAPPING[normalizedSkill] || 'technology';
        
        if (!skillMap.has(normalizedSkill)) {
          skillMap.set(normalizedSkill, {
            skill: normalizedSkill,
            count: 0,
            category,
            people: []
          });
        }
        
        const skillData = skillMap.get(normalizedSkill)!;
        skillData.count++;
        skillData.people.push({
          id: person.id,
          name: person.name,
          avatar: person.avatar,
          role: person.role,
          team: person.team,
          email: person.email,
          avatar_initials: person.avatar_initials,
          avatar_color: person.avatar_color,
          profileImage: person.profileImage
        });
      });
    });

    const skills = Array.from(skillMap.values());
    
    // 改善されたカテゴリ分析
    const categoriesMap = new Map<keyof typeof SKILL_CATEGORIES, CategoryData>();
    
    skills.forEach(skill => {
      if (!categoriesMap.has(skill.category)) {
        categoriesMap.set(skill.category, {
          category: skill.category,
          skills: [],
          totalCount: 0,
          averageSkillsPerPerson: 0,
          topSkills: []
        });
      }
      
      const categoryData = categoriesMap.get(skill.category)!;
      categoryData.skills.push(skill);
      categoryData.totalCount += skill.count;
    });

    // 統計情報の計算
    categoriesMap.forEach((categoryData, category) => {
      const uniquePeople = new Set();
      categoryData.skills.forEach(skill => {
        skill.people.forEach(person => uniquePeople.add(person.id));
      });
      
      categoryData.averageSkillsPerPerson = categoryData.totalCount / uniquePeople.size;
      categoryData.topSkills = categoryData.skills
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
    });

    const totalStats = {
      totalSkills: skills.length,
      totalPeople: people.length,
      totalCategories: categoriesMap.size,
      averageSkillsPerPerson: skills.reduce((sum, skill) => sum + skill.count, 0) / people.length
    };

    return {
      skillsData: skills,
      categoriesData: Array.from(categoriesMap.values()),
      totalStats
    };
  }, [people]);

  // フィルタリングされたスキルデータ
  const filteredSkills = useMemo(() => {
    if (!searchTerm) return skillsData;
    return skillsData.filter(skill => 
      skill.skill.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [skillsData, searchTerm]);

  // 改善されたツリーマップレイアウト計算（動的高さ）
  const { treemapNodes, totalHeight } = useMemo(() => {
    const nodes = calculateImprovedTreemapLayout(filteredSkills, 1200);
    const maxY = nodes.length > 0 ? Math.max(...nodes.map(n => n.y + n.height)) : 800;
    return {
      treemapNodes: nodes,
      totalHeight: Math.max(maxY + 50, 800)
    };
  }, [filteredSkills]);

  // スキル検索と自動スクロール
  const scrollToSkill = useCallback((skillName: string) => {
    const targetNode = treemapNodes.find(node => 
      node.skill.toLowerCase() === skillName.toLowerCase()
    );
    
    if (targetNode && containerRef.current && svgRef.current) {
      setHighlightedSkill(skillName);
      
      // SVGの座標をコンテナ座標に変換
      const svgRect = svgRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const svgViewBox = svgRef.current.viewBox.baseVal;
      
      const scaleX = svgRect.width / svgViewBox.width;
      const scaleY = svgRect.height / svgViewBox.height;
      
      const targetX = targetNode.x * scaleX;
      const targetY = targetNode.y * scaleY;
      
      // スムーズスクロール
      containerRef.current.scrollTo({
        top: targetY - 100,
        behavior: 'smooth'
      });
      
      // ハイライトを3秒後に解除
      setTimeout(() => setHighlightedSkill(null), 3000);
    }
  }, [treemapNodes]);

  // 検索処理
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      const matchingSkill = skillsData.find(skill => 
        skill.skill.toLowerCase().includes(term.toLowerCase())
      );
      if (matchingSkill) {
        scrollToSkill(matchingSkill.skill);
      }
    }
  }, [skillsData, scrollToSkill]);

  // マウス位置の追跡
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  // 人のクリック処理（完全修正）
  const handlePersonClick = useCallback((person: any, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('Person clicked in skill map:', person); // デバッグ用
    
    setSelectedSkill(null); // スキル詳細を閉じる
    
    // 人の完全なデータを取得（複数の方法で検索）
    let fullPersonData = people.find(p => p.id === person.id);
    
    if (!fullPersonData) {
      fullPersonData = people.find(p => p.name === person.name);
    }
    
    if (!fullPersonData) {
      fullPersonData = person;
    }
    
    console.log('Full person data:', fullPersonData); // デバッグ用
    
    // 少し遅延してコールバックを実行（UIの更新を確実にするため）
    setTimeout(() => {
      if (onPersonClick) {
        onPersonClick(fullPersonData);
      }
    }, 100);
  }, [onPersonClick, people]);

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      {/* 改善された統計情報ヘッダー＋検索機能（150%拡大、コントラスト改善） */}
      <div className="px-8 py-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-7 w-7 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {totalStats.totalSkills} {language === 'ja' ? 'スキル' : 'Skills'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-7 w-7 text-green-600" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {totalStats.totalPeople} {language === 'ja' ? '人' : 'People'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-7 w-7 text-purple-600" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {totalStats.averageSkillsPerPerson.toFixed(1)} {language === 'ja' ? '平均スキル/人' : 'Avg Skills/Person'}
              </span>
            </div>
          </div>
          
          {/* スキル検索 - エンハンスドアニメーション */}
          <div className="relative group">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 transition-all duration-200 ${
              searchTerm ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
            }`} />
            <input
              type="text"
              placeholder={language === 'ja' ? 'スキルを検索...' : 'Search skills...'}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 pr-6 py-3 w-80 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white/95 dark:bg-gray-800/95 text-gray-900 dark:text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:shadow-md hover:border-gray-400 dark:hover:border-gray-500"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setHighlightedSkill(null);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        
        {searchTerm && (
          <div className="text-lg text-gray-800 dark:text-gray-200 font-medium">
            {filteredSkills.length} {language === 'ja' ? 'スキルが見つかりました' : 'skills found'}
            {filteredSkills.length > 0 && language === 'ja' && ' • スキルをクリックして詳細を表示'}
            {filteredSkills.length > 0 && language === 'en' && ' • Click skills for details'}
          </div>
        )}
      </div>

              {/* スクロール対応ツリーマップ */}
        <div 
          ref={containerRef}
          className="flex-1 relative overflow-auto custom-scrollbar"
          onMouseMove={handleMouseMove}
        >
        <svg
          ref={svgRef}
          className="w-full"
          viewBox={`0 0 1200 ${totalHeight}`}
          style={{ height: `${totalHeight}px` }}
          preserveAspectRatio="xMidYMin meet"
        >
          {/* 改善されたグラデーション定義 */}
          <defs>
            {Object.entries(SKILL_CATEGORIES).map(([key, category]) => (
              <React.Fragment key={key}>
                <linearGradient id={`gradient-${key}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={category.color} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={category.darkColor} stopOpacity="0.7" />
                </linearGradient>
                <linearGradient id={`gradient-${key}-hover`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={category.color} stopOpacity="1" />
                  <stop offset="100%" stopColor={category.darkColor} stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id={`gradient-${key}-highlight`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.8" />
                </linearGradient>
              </React.Fragment>
            ))}
            
            <filter id="dropshadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.25" />
            </filter>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="highlight" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* カテゴリ背景とラベル */}
          {Object.entries(SKILL_CATEGORIES).map(([categoryKey, categoryInfo]) => {
            const categoryNodes = treemapNodes.filter(node => node.category === categoryKey);
            if (categoryNodes.length === 0) return null;
            
            const categoryRect = categoryNodes[0];
            
            return (
              <g key={`category-${categoryKey}`}>
                {/* カテゴリ背景 */}
                <rect
                  x={categoryRect.categoryX}
                  y={categoryRect.categoryY}
                  width={categoryRect.categoryWidth}
                  height={categoryRect.categoryHeight}
                  fill={categoryInfo.lightColor}
                  stroke={categoryInfo.color}
                  strokeWidth="2"
                  strokeDasharray="8,4"
                  opacity="0.4"
                  rx="12"
                  className="transition-all duration-300"
                />
                
                {/* カテゴリヘッダー */}
                <rect
                  x={categoryRect.categoryX}
                  y={categoryRect.categoryY}
                  width={categoryRect.categoryWidth}
                  height="44"
                  fill={categoryInfo.color}
                  opacity="0.9"
                  rx="12"
                />
                
                {/* カテゴリラベル（150%拡大） */}
                <text
                  x={categoryRect.categoryX + 20}
                  y={categoryRect.categoryY + 32}
                  className="fill-white font-bold text-xl pointer-events-none"
                  style={{ fontSize: '1.5rem' }}
                >
                  {categoryInfo.icon} {categoryInfo.name[language]}
                </text>
                
                {/* カテゴリ統計 */}
                <text
                  x={categoryRect.categoryX + categoryRect.categoryWidth - 20}
                  y={categoryRect.categoryY + 32}
                  textAnchor="end"
                  className="fill-white text-lg pointer-events-none"
                  style={{ fontSize: '1.1rem' }}
                >
                  {categoryNodes.length} {language === 'ja' ? 'スキル' : 'skills'}
                </text>
              </g>
            );
          })}

          {/* 改善されたスキルボックス */}
          {treemapNodes.map((node) => {
            const category = SKILL_CATEGORIES[node.category];
            const isHovered = hoveredSkill?.skill === node.skill;
            const isHighlighted = highlightedSkill === node.skill;
            const isCategoryHovered = hoveredCategory === node.category;
            
            let fillGradient = `url(#gradient-${node.category})`;
            if (isHighlighted) {
              fillGradient = `url(#gradient-${node.category}-highlight)`;
            } else if (isHovered) {
              fillGradient = `url(#gradient-${node.category}-hover)`;
            }
            
            return (
              <g key={node.skill}>
                {/* スキルボックス - マイクロインタラクション強化 */}
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  fill={fillGradient}
                  stroke={isHighlighted ? "#F59E0B" : isHovered ? category.color : 'rgba(255, 255, 255, 0.4)'}
                  strokeWidth={isHighlighted ? 3 : isHovered ? 2 : 1}
                  filter={isHighlighted ? "url(#highlight)" : isHovered ? "url(#glow)" : "url(#dropshadow)"}
                  rx="8"
                  className="cursor-pointer transition-all duration-300 ease-out hover:brightness-110"
                  onMouseEnter={() => {
                    setHoveredSkill(node);
                    // マイクロフィードバック - 軽い振動効果
                    if (navigator.vibrate) {
                      navigator.vibrate(10);
                    }
                  }}
                  onMouseLeave={() => setHoveredSkill(null)}
                  onClick={() => {
                    setSelectedSkill(node);
                    // クリック時のフィードバック
                    if (navigator.vibrate) {
                      navigator.vibrate(20);
                    }
                  }}
                  style={{
                    opacity: isCategoryHovered ? 1 : isHovered || isHighlighted ? 1 : 0.8,
                    transform: isHovered || isHighlighted ? 'scale(1.03)' : 'scale(1)',
                    transformOrigin: `${node.x + node.width/2}px ${node.y + node.height/2}px`,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isHovered ? `0 0 20px ${category.color}40` : 'none'
                  }}
                />
                
                {/* スキルラベル（150%拡大、コントラスト改善） */}
                {node.width > 60 && node.height > 35 && (
                  <text
                    x={node.x + node.width / 2}
                    y={node.y + node.height / 2 - 6}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-white font-bold pointer-events-none"
                    style={{ 
                      fontSize: `${Math.min(node.width / 8, node.height / 2.5, 16)}px`,
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                    }}
                  >
                    {node.skill.length > 10 ? node.skill.substring(0, 10) + '...' : node.skill}
                  </text>
                )}
                
                {/* 人数表示（150%拡大、コントラスト改善） */}
                {node.width > 50 && node.height > 30 && (
                  <text
                    x={node.x + node.width / 2}
                    y={node.y + node.height / 2 + 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-white font-semibold pointer-events-none"
                    style={{ 
                      fontSize: `${Math.min(node.width / 10, node.height / 3, 14)}px`,
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                    }}
                  >
                    {node.count} {language === 'ja' ? '人' : 'people'}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* 改善されたホバーツールチップ（150%拡大、コントラスト改善） */}
        {hoveredSkill && (
          <div
            className="fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 pointer-events-none max-w-md"
            style={{
              left: mousePosition.x + 20,
              top: mousePosition.y - 15,
              transform: 'translateY(-100%)'
            }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">
                {SKILL_CATEGORIES[hoveredSkill.category].icon}
              </span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {hoveredSkill.skill}
              </h3>
            </div>
            <p className="text-lg text-gray-800 dark:text-gray-200 mb-2">
              {SKILL_CATEGORIES[hoveredSkill.category].name[language]}
            </p>
            <p className="text-lg text-gray-800 dark:text-gray-200 mb-3">
              {hoveredSkill.count} {language === 'ja' ? '人が保有' : 'people have this skill'}
            </p>
            <p className="text-base text-gray-700 dark:text-gray-300 font-medium">
              {language === 'ja' ? 'クリックで詳細を表示' : 'Click for details'}
            </p>
          </div>
        )}
      </div>

      {/* 改善されたスキル詳細サイドパネル（最高z-index、モダンアニメーション） */}
      {selectedSkill && (
        <div className="fixed inset-0 z-[100] flex">
          <div 
            className="flex-1 bg-black/40 backdrop-blur-sm transition-all duration-300"
            onClick={() => setSelectedSkill(null)}
          />
          
          <div className="w-[30rem] bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-gray-200 dark:border-gray-700 custom-scrollbar backdrop-blur-md">
            {/* 改善されたヘッダー（150%拡大、ダークモード完全対応） */}
            <div className="p-8 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div 
                className="p-6 rounded-xl mb-6 border border-gray-200 dark:border-gray-600 relative overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${SKILL_CATEGORIES[selectedSkill.category].lightColor} 0%, ${SKILL_CATEGORIES[selectedSkill.category].color}20 100%)`
                }}
              >
                {/* 暗い背景オーバーレイ（ダークモード用） */}
                <div className="absolute inset-0 bg-black/0 dark:bg-black/40 transition-all duration-300"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white/90 dark:bg-gray-900/90 rounded-xl shadow-sm">
                        <span className="text-3xl">
                          {SKILL_CATEGORIES[selectedSkill.category].icon}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white drop-shadow-sm">
                          {selectedSkill.skill}
                        </h3>
                        <p className="text-lg text-gray-700 dark:text-gray-100 mt-1 font-semibold drop-shadow-sm">
                          {SKILL_CATEGORIES[selectedSkill.category].name[language]}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSkill(null)}
                      className="text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white h-12 w-12 bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                  
                  <div className="mt-6 flex items-center space-x-4">
                    <div className="flex items-center space-x-3 bg-white/90 dark:bg-gray-900/90 px-4 py-2 rounded-xl shadow-sm">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedSkill.count} {language === 'ja' ? '人が保有' : 'people have this skill'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 改善されたメンバーリスト（150%拡大、コントラスト大幅改善） */}
            <div className="p-8">
              <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                {language === 'ja' ? 'このスキルを持つメンバー' : 'Members with this skill'}
              </h4>
              
              <div className="space-y-3">
                {selectedSkill.people.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center space-x-4 p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-600"
                    onClick={(e) => handlePersonClick(person, e)}
                  >
                    <div className="flex-shrink-0">
                      {person.profileImage && !person.profileImage.includes('error') ? (
                        <img
                          src={person.profileImage}
                          alt={person.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                        />
                      ) : (
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shadow-sm border-2 border-white dark:border-gray-700 text-lg"
                          style={{ backgroundColor: person.avatar_color || '#3B82F6' }}
                        >
                          {person.avatar_initials || person.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                        {person.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          className={`${getPillClasses('role', true)} text-base px-3 py-1 font-medium`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          {person.role}
                        </button>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          className={`${getPillClasses('team', true)} text-base px-3 py-1 font-medium`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="truncate max-w-[150px]">
                            {person.team.length > 18 ? `${person.team.substring(0, 18)}...` : person.team}
                          </span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      {person.email && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 h-10 w-10 p-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `mailto:${person.email}`;
                          }}
                        >
                          <Mail className="h-5 w-5" />
                        </Button>
                      )}
                                              <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-700 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 h-10 w-10 p-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePersonClick(person, e);
                          }}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillBubbleMap; 