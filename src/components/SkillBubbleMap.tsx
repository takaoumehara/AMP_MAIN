import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { X, Mail, ExternalLink, Users, TrendingUp, BarChart3, Search, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { getPillClasses } from '../lib/pillColors';

// Modern skill categories with vibrant, consistent colors
const SKILL_CATEGORIES = {
  strategy: {
    name: { en: 'Strategy & Business', ja: '戦略・ビジネス' },
    color: '#3B82F6', // Bright Blue
    lightColor: '#DBEAFE',
    darkColor: '#1E40AF',
    gradient: 'from-blue-400 to-blue-600',
    icon: '🎯',
    description: { en: 'Strategic planning and business development', ja: '戦略立案・事業開発' }
  },
  design: {
    name: { en: 'Design & UX', ja: 'デザイン・UX' },
    color: '#10B981', // Bright Green
    lightColor: '#D1FAE5',
    darkColor: '#047857',
    gradient: 'from-emerald-400 to-emerald-600',
    icon: '🎨',
    description: { en: 'User experience and visual design', ja: 'ユーザー体験・視覚デザイン' }
  },
  futures: {
    name: { en: 'Futures & Innovation', ja: '未来研究・イノベーション' },
    color: '#6366F1', // Bright Indigo
    lightColor: '#E0E7FF',
    darkColor: '#4338CA',
    gradient: 'from-indigo-400 to-indigo-600',
    icon: '🚀',
    description: { en: 'Future studies and innovation', ja: '未来研究・イノベーション' }
  },
  technology: {
    name: { en: 'Engineering & Technology', ja: 'エンジニアリング・テクノロジー' },
    color: '#8B5CF6', // Bright Purple
    lightColor: '#EDE9FE',
    darkColor: '#6D28D9',
    gradient: 'from-violet-400 to-violet-600',
    icon: '💻',
    description: { en: 'Software engineering and technology', ja: 'ソフトウェアエンジニアリング・テクノロジー' }
  },
  business: {
    name: { en: 'Business Operations', ja: 'ビジネス運営' },
    color: '#EF4444', // Bright Red
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
  'Java': 'technology',
  'React': 'technology',
  'Vue': 'technology',
  'Angular': 'technology',
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
  'フルスタック': 'technology',
  'Full-stack': 'technology',
  'DevOps': 'technology',
  'Cloud': 'technology',
  'クラウド': 'technology',
  'Database': 'technology',
  'データベース': 'technology',
  'Security': 'technology',
  'セキュリティ': 'technology',
  'Engineer': 'technology',
  'エンジニア': 'technology',
  'CSS': 'technology',
  'HTML': 'technology',
  'Shell': 'technology',
  'Artificial Intelligence': 'technology',
  'DataScience': 'technology',
  'データサイエンス': 'technology',
  'C++': 'technology',
  'Kotlin': 'technology',
  'Go': 'technology',
  'Solidity': 'technology',
  'Processing': 'technology',
  'Ruby': 'technology',
  'Swift': 'technology',
  'Cuda': 'technology',
  'Handlebars': 'technology',
  'Jupyter Notebook': 'technology',
  'AWS': 'technology',
  'Unity': 'technology',
  'XR': 'technology',
  'Web': 'technology',
  'iOS': 'technology',
  'iOSApp': 'technology',
  'Raspi': 'technology',
  'Infrastructure': 'technology',
  'インフラ': 'technology',
  'web3': 'technology',
  'WebApp開発': 'technology',
  'WebFE': 'technology',
  'Mobile': 'technology',
  'backend': 'technology',
  'Engineering': 'technology',
  'PM (CS)': 'strategy',
  'Data分析': 'technology',
  'Infra': 'technology',
  'Geo-expansion': 'strategy',
  'SNSMarketing': 'strategy',
  'FP&A': 'business',
  
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
  'リーダーシップ': 'business',
  
  // 日本語スキル追加
  '政治・政策': 'strategy',
  '出版業界': 'business',
  '動くものをつくること': 'technology',
  '技術営業': 'business',
  'BE': 'technology',
  '自然言語処理': 'technology',
  'コンサル': 'strategy',
  '医学生主体': 'futures',
  '情報工学科3年': 'technology',
  '宇宙': 'futures',
  '広義': 'futures',
  'ゲーム・漫画・アニメ業界': 'design',
  'Founder of N...': 'strategy',
  '運営自動化': 'technology',
  '資源自動化': 'technology'
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
  onPersonClick?: (person: any, skillContext?: { skillName: string; skillPeople: any[] }) => void;
  initialSelectedSkill?: any;
  onSkillStateChange?: (skill: any, scrollPosition: number) => void;
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
  onPersonClick,
  initialSelectedSkill,
  onSkillStateChange
}) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillData | null>(initialSelectedSkill || null);
  const [hoveredSkill, setHoveredSkill] = useState<SkillData | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<keyof typeof SKILL_CATEGORIES | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedSkill, setHighlightedSkill] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // スキル選択状態の変更を親コンポーネントに通知
  const handleSkillSelection = useCallback((skill: SkillData | null) => {
    setSelectedSkill(skill);
    if (onSkillStateChange) {
      onSkillStateChange(skill, window.scrollY);
    }
  }, [onSkillStateChange]);

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
        
        // より柔軟なカテゴリマッピング
        let category: keyof typeof SKILL_CATEGORIES = 'technology';
        
        // 完全一致を最初に試す
        if (SKILL_MAPPING[normalizedSkill]) {
          category = SKILL_MAPPING[normalizedSkill];
        } else {
          // 部分一致でカテゴリを決定
          const skillLower = normalizedSkill.toLowerCase();
          
          // Strategy & Business
          if (skillLower.includes('pm') || skillLower.includes('product') || skillLower.includes('management') || 
              skillLower.includes('business') || skillLower.includes('marketing') || skillLower.includes('strategy') ||
              skillLower.includes('consulting') || skillLower.includes('マネジメント') || skillLower.includes('プロダクト') ||
              skillLower.includes('ビジネス') || skillLower.includes('マーケティング') || skillLower.includes('戦略')) {
            category = 'strategy';
          }
          // Design & UX
          else if (skillLower.includes('design') || skillLower.includes('ui') || skillLower.includes('ux') ||
                   skillLower.includes('デザイン') || skillLower.includes('グラフィック') || skillLower.includes('visual') ||
                   skillLower.includes('prototype') || skillLower.includes('figma') || skillLower.includes('sketch')) {
            category = 'design';
          }
          // Futures & Innovation
          else if (skillLower.includes('future') || skillLower.includes('innovation') || skillLower.includes('research') ||
                   skillLower.includes('未来') || skillLower.includes('イノベーション') || skillLower.includes('研究') ||
                   skillLower.includes('science fiction') || skillLower.includes('foresight') || skillLower.includes('anticipation')) {
            category = 'futures';
          }
          // Business Operations
          else if (skillLower.includes('sales') || skillLower.includes('finance') || skillLower.includes('hr') ||
                   skillLower.includes('operations') || skillLower.includes('accounting') || skillLower.includes('営業') ||
                   skillLower.includes('財務') || skillLower.includes('人事') || skillLower.includes('運営') ||
                   skillLower.includes('会計') || skillLower.includes('セールス')) {
            category = 'business';
          }
          // Technology (default)
          else {
            category = 'technology';
          }
        }
        
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

  // 人のクリック処理（スキル状態を保持）
  const handlePersonClick = useCallback((person: any, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('Person clicked in skill map:', person); // デバッグ用
    
    // スキルの選択状態を保存（閉じない）
    const currentSkill = selectedSkill;
    
    // 人の完全なデータを取得（複数の方法で検索）
    let fullPersonData = people.find(p => p.id === person.id);
    
    if (!fullPersonData) {
      fullPersonData = people.find(p => p.name === person.name);
    }
    
    if (!fullPersonData) {
      fullPersonData = person;
    }
    
    console.log('Full person data:', fullPersonData); // デバッグ用
    
    // 人のプロフィールを開く（スキル詳細は保持）
    if (onPersonClick) {
      // If clicked from skill detail panel, pass skill context
      if (currentSkill) {
        // Get full person data for all people with this skill
        const skillPeopleWithFullData = currentSkill.people.map((skillPerson: any) => {
          const fullData = people.find(p => p.id === skillPerson.id) || 
                          people.find(p => p.name === skillPerson.name) || 
                          skillPerson;
          return fullData;
        });
        
        onPersonClick(fullPersonData, {
          skillName: currentSkill.skill,
          skillPeople: skillPeopleWithFullData
        });
      } else {
        onPersonClick(fullPersonData);
      }
    }
    
    // スキルの選択状態を復元（少し遅延して）
    setTimeout(() => {
      if (currentSkill) {
        setSelectedSkill(currentSkill);
      }
    }, 50);
  }, [onPersonClick, people, selectedSkill]);

          return (
      <div className="w-full h-screen flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
        {/* メインコンテンツエリア */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Minimized Stats Header with Modern Design - Mobile Responsive */}
          <div className="px-2 sm:px-4 py-2 sm:py-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          {/* Compact Stats Pills - Mobile Responsive */}
          <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto">
            <div className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-full whitespace-nowrap">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs sm:text-sm font-semibold text-blue-800 dark:text-blue-200">
                {totalStats.totalSkills} {language === 'ja' ? 'スキル' : 'Skills'}
              </span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-full whitespace-nowrap">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
              <span className="text-xs sm:text-sm font-semibold text-green-800 dark:text-green-200">
                {totalStats.totalPeople} {language === 'ja' ? '人' : 'People'}
              </span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-full whitespace-nowrap">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs sm:text-sm font-semibold text-purple-800 dark:text-purple-200">
                {totalStats.averageSkillsPerPerson.toFixed(1)} {language === 'ja' ? '平均' : 'Avg'}
              </span>
            </div>
          </div>
          
          {/* Compact Search Bar - Mobile Responsive */}
          <div className="relative group flex-1 sm:flex-none min-w-0">
            <Search className={`absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 transition-all duration-200 ${
              searchTerm ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
            }`} />
            <input
              type="text"
              placeholder={language === 'ja' ? 'スキルを検索...' : 'Search skills...'}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-7 sm:pl-9 pr-6 sm:pr-8 py-1.5 sm:py-2 w-full sm:w-64 text-xs sm:text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white/95 dark:bg-gray-800/95 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-500"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setHighlightedSkill(null);
                }}
                className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            )}
          </div>
        </div>
        
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {filteredSkills.length} {language === 'ja' ? 'スキルが見つかりました' : 'skills found'}
            {filteredSkills.length > 0 && (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-500">
                {language === 'ja' ? '• スキルをクリックして詳細を表示' : '• Click skills for details'}
              </span>
            )}
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
                  strokeWidth="1"
                  fillOpacity="0.3"
                  rx="8"
                  className="transition-all duration-300"
                />
                
                {/* Modern Category Header */}
                <rect
                  x={categoryRect.categoryX}
                  y={categoryRect.categoryY}
                  width={categoryRect.categoryWidth}
                  height="36"
                  fill={categoryInfo.color}
                  fillOpacity="0.95"
                  rx="8"
                />
                
                {/* Category Label - Compact */}
                <text
                  x={categoryRect.categoryX + 16}
                  y={categoryRect.categoryY + 24}
                  className="fill-white font-semibold pointer-events-none"
                  style={{ fontSize: '1rem' }}
                >
                  {categoryInfo.icon} {categoryInfo.name[language]}
                </text>
                
                {/* Category Stats - Compact */}
                <text
                  x={categoryRect.categoryX + categoryRect.categoryWidth - 16}
                  y={categoryRect.categoryY + 24}
                  textAnchor="end"
                  className="fill-white/90 font-medium pointer-events-none"
                  style={{ fontSize: '0.875rem' }}
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
            
            let fillColor = category.color;
            let fillOpacity = 0.8;
            
            if (isHighlighted) {
              fillColor = '#F59E0B'; // Highlight color
              fillOpacity = 0.9;
            } else if (isHovered) {
              fillColor = category.color;
              fillOpacity = 1.0;
            }
            
            return (
              <g key={node.skill}>
                {/* スキルボックス - マイクロインタラクション強化 */}
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  fill={fillColor}
                  fillOpacity={fillOpacity}
                  stroke={isHighlighted ? "#F59E0B" : isHovered ? category.color : 'rgba(255, 255, 255, 0.4)'}
                  strokeWidth={isHighlighted ? 3 : isHovered ? 2 : 1}
                  filter={isHighlighted ? "url(#highlight)" : isHovered ? "url(#glow)" : "url(#dropshadow)"}
                  rx="8"
                  className="cursor-pointer transition-all duration-300 ease-out hover:brightness-110"
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    setHoveredSkill(node);
                    // マイクロフィードバック - 軽い振動効果
                    if (navigator.vibrate) {
                      navigator.vibrate(10);
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    setHoveredSkill(null);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSkillSelection(node);
                    // クリック時のフィードバック
                    if (navigator.vibrate) {
                      navigator.vibrate(20);
                    }
                  }}
                  style={{
                    cursor: 'pointer',
                    filter: isHovered ? `drop-shadow(0 4px 8px ${category.color}40)` : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    transform: isHovered || isHighlighted ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: `${node.x + node.width/2}px ${node.y + node.height/2}px`,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
                
                {/* Modern Skill Label */}
                {node.width > 50 && node.height > 28 && (
                  <text
                    x={node.x + node.width / 2}
                    y={node.y + node.height / 2 - 4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-white font-semibold pointer-events-none"
                    style={{ 
                      fontSize: `${Math.min(node.width / 9, node.height / 3, 13)}px`,
                      textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                    }}
                  >
                    {node.skill.length > 12 ? node.skill.substring(0, 12) + '...' : node.skill}
                  </text>
                )}
                
                {/* Compact People Count */}
                {node.width > 40 && node.height > 24 && (
                  <text
                    x={node.x + node.width / 2}
                    y={node.y + node.height / 2 + 8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-white/90 font-medium pointer-events-none"
                    style={{ 
                      fontSize: `${Math.min(node.width / 12, node.height / 4, 11)}px`,
                      textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                    }}
                  >
                    {node.count} {language === 'ja' ? '人' : 'people'}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Modern Compact Tooltip */}
        {hoveredSkill && (
          <div
            className="fixed z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 pointer-events-none max-w-xs"
            style={{
              left: mousePosition.x + 15,
              top: mousePosition.y - 10,
              transform: 'translateY(-100%)'
            }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">
                {SKILL_CATEGORIES[hoveredSkill.category].icon}
              </span>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {hoveredSkill.skill}
              </h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              {SKILL_CATEGORIES[hoveredSkill.category].name[language]}
            </p>
            <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">
              {hoveredSkill.count} {language === 'ja' ? '人が保有' : 'people have this skill'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'ja' ? 'クリックで詳細を表示' : 'Click for details'}
            </p>
          </div>
        )}
        </div>
      </div>

      {/* 改善されたスキル詳細サイドパネル（右側固定、画面分割） */}
      {selectedSkill && (
        <div className="hidden sm:flex w-96 h-screen bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700 flex-col animate-in slide-in-from-right duration-300 overflow-hidden">
            {/* Simple Flat Header - Sticky */}
                          <div className="sticky top-0 z-10 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <div className="p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="p-2 rounded-lg shadow-sm"
                      style={{ backgroundColor: SKILL_CATEGORIES[selectedSkill.category].color }}
                    >
                      <span className="text-xl">
                        {SKILL_CATEGORIES[selectedSkill.category].icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedSkill.skill}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                        {SKILL_CATEGORIES[selectedSkill.category].name[language]}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSkillSelection(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mt-3">
                  <div 
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: `${SKILL_CATEGORIES[selectedSkill.category].color}20` }}
                  >
                    <Users 
                      className="h-4 w-4"
                      style={{ color: SKILL_CATEGORIES[selectedSkill.category].color }}
                    />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {selectedSkill.count} {language === 'ja' ? '人が保有' : 'people have this skill'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Member List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 pb-4 sm:pb-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                {language === 'ja' ? 'このスキルを持つメンバー' : 'Members with this skill'}
              </h4>
              
              <div className="space-y-2">
                {selectedSkill.people.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer hover:shadow-sm hover:border-blue-300 dark:hover:border-blue-600"
                    onClick={(e) => handlePersonClick(person, e)}
                  >
                    <div className="flex-shrink-0">
                      {person.profileImage && !person.profileImage.includes('error') ? (
                        <img
                          src={person.profileImage}
                          alt={person.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                        />
                      ) : (
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-sm border-2 border-white dark:border-gray-700 text-sm"
                          style={{ backgroundColor: person.avatar_color || '#3B82F6' }}
                        >
                          {person.avatar_initials || person.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {person.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex flex-wrap gap-1">
                          {person.role.split(',').map((r: string) => r.trim()).filter(Boolean).slice(0, 2).map((individualRole: string, index: number) => (
                            <button
                              key={index}
                              className={`${getPillClasses('role', true)} text-xs px-2 py-0.5 font-medium`}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              {individualRole.length > 8 ? `${individualRole.substring(0, 8)}...` : individualRole}
                            </button>
                          ))}
                          {person.role.split(',').length > 2 && (
                            <span className={`${getPillClasses('default', false)} text-xs px-2 py-0.5`}>
                              +{person.role.split(',').length - 2}
                            </span>
                          )}
                        </div>
                        <button
                          className={`${getPillClasses('team', true)} text-xs px-2 py-0.5 font-medium`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <span className="truncate max-w-[100px]">
                            {person.team.length > 12 ? `${person.team.substring(0, 12)}...` : person.team}
                          </span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {person.email && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 h-8 w-8 p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `mailto:${person.email}`;
                          }}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-700 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 h-8 w-8 p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePersonClick(person, e);
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* モバイル用オーバーレイパネル */}
        {selectedSkill && (
          <div className="sm:hidden fixed inset-0 z-[100] flex items-end">
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300"
              onClick={() => handleSkillSelection(null)}
            />
            
            <div className="relative w-full max-h-[80vh] bg-white dark:bg-gray-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 border-t border-gray-200 dark:border-gray-700 flex flex-col rounded-t-lg">
              {/* モバイル用ヘッダー */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="p-2 rounded-lg shadow-sm"
                      style={{ backgroundColor: SKILL_CATEGORIES[selectedSkill.category].color }}
                    >
                      <span className="text-lg">
                        {SKILL_CATEGORIES[selectedSkill.category].icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedSkill.skill}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {SKILL_CATEGORIES[selectedSkill.category].name[language]}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSkillSelection(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div 
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: `${SKILL_CATEGORIES[selectedSkill.category].color}20` }}
                >
                  <Users 
                    className="h-4 w-4"
                    style={{ color: SKILL_CATEGORIES[selectedSkill.category].color }}
                  />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedSkill.count} {language === 'ja' ? '人が保有' : 'people have this skill'}
                  </span>
                </div>
              </div>

              {/* モバイル用メンバーリスト */}
              <div className="flex-1 overflow-y-auto p-4">
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {language === 'ja' ? 'このスキルを持つメンバー' : 'Members with this skill'}
                </h4>
                
                <div className="space-y-3">
                  {selectedSkill.people.map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
                      onClick={(e) => handlePersonClick(person, e)}
                    >
                      <div className="flex-shrink-0">
                        {person.profileImage && !person.profileImage.includes('error') ? (
                          <img
                            src={person.profileImage}
                            alt={person.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                          />
                        ) : (
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-sm border-2 border-white dark:border-gray-700 text-sm"
                            style={{ backgroundColor: person.avatar_color || '#3B82F6' }}
                          >
                            {person.avatar_initials || person.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {person.name}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex flex-wrap gap-1">
                            {person.role.split(',').map((r: string) => r.trim()).filter(Boolean).slice(0, 2).map((individualRole: string, index: number) => (
                              <span
                                key={index}
                                className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                              >
                                {individualRole.length > 8 ? `${individualRole.substring(0, 8)}...` : individualRole}
                              </span>
                            ))}
                            {person.role.split(',').length > 2 && (
                              <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                                +{person.role.split(',').length - 2}
                              </span>
                            )}
                          </div>
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded truncate max-w-[120px]">
                            {person.team.length > 15 ? `${person.team.substring(0, 15)}...` : person.team}
                          </span>
                        </div>
                      </div>
                      
                      <ChevronRight className="h-5 w-5 text-gray-400" />
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