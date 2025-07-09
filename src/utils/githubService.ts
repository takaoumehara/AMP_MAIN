export interface GitHubUser {
  login: string;
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
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  html_url: string;
  updated_at: string;
  topics: string[];
}

export interface GitHubEnhancedData {
  profile: GitHubUser | null;
  topRepos: GitHubRepo[];
  languages: { [key: string]: number };
  topLanguages: string[];
  totalStars: number;
  lastActive: string | null;
  isActive: boolean;
}

class GitHubService {
  private baseURL = 'https://api.github.com';
  private token?: string;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 1000 * 60 * 60; // 1時間

  constructor(token?: string) {
    this.token = token;
  }

  private async request(endpoint: string): Promise<any> {
    // キャッシュチェック
    const cacheKey = endpoint;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'PeopleDiscoveryApp/1.0'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, { headers });

      // レート制限チェック
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const resetTime = response.headers.get('X-RateLimit-Reset');
      
      if (remaining && parseInt(remaining) < 10) {
        console.warn(`GitHub API rate limit low: ${remaining} requests remaining`);
      }

      if (!response.ok) {
        if (response.status === 404) {
          return null; // ユーザーまたはリソースが見つからない
        }
        if (response.status === 403) {
          console.warn('GitHub API rate limit exceeded');
          return null;
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // キャッシュに保存
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.error(`GitHub API request failed for ${endpoint}:`, error);
      return null;
    }
  }

  async getUserProfile(username: string): Promise<GitHubUser | null> {
    return this.request(`/users/${username}`);
  }

  async getUserRepos(username: string, limit = 10): Promise<GitHubRepo[]> {
    const repos = await this.request(`/users/${username}/repos?sort=stars&per_page=${limit}&type=owner`);
    return repos || [];
  }

  async getRepoLanguages(username: string, repoName: string): Promise<{ [key: string]: number } | null> {
    return this.request(`/repos/${username}/${repoName}/languages`);
  }

  // ユーザーの主要言語を計算
  async getUserLanguages(username: string): Promise<{ [key: string]: number }> {
    const repos = await this.getUserRepos(username, 20);
    if (!repos || repos.length === 0) return {};

    const languageStats: { [key: string]: number } = {};

    // 並列処理でパフォーマンス向上
    const languagePromises = repos.map(async (repo) => {
      if (repo.language) {
        const languages = await this.getRepoLanguages(username, repo.name);
        return languages;
      }
      return null;
    });

    const languageResults = await Promise.all(languagePromises);

    languageResults.forEach((languages) => {
      if (languages) {
        Object.entries(languages).forEach(([lang, bytes]) => {
          languageStats[lang] = (languageStats[lang] || 0) + (bytes as number);
        });
      }
    });

    return languageStats;
  }

  // 完全な拡張データを取得
  async getEnhancedUserData(username: string): Promise<GitHubEnhancedData> {
    try {
      const [profile, repos, languages] = await Promise.all([
        this.getUserProfile(username),
        this.getUserRepos(username, 10),
        this.getUserLanguages(username)
      ]);

      // 言語を使用量でソート
      const sortedLanguages = Object.entries(languages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      const topLanguages = sortedLanguages.map(([lang]) => lang);

      // 総スター数を計算
      const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

      // 最後のアクティビティを取得
      const lastActive = repos.length > 0 
        ? repos.reduce((latest, repo) => {
            const repoDate = new Date(repo.updated_at);
            const latestDate = new Date(latest);
            return repoDate > latestDate ? repo.updated_at : latest;
          }, repos[0].updated_at)
        : null;

      // アクティビティチェック（過去6ヶ月以内）
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const isActive = lastActive ? new Date(lastActive) > sixMonthsAgo : false;

      return {
        profile,
        topRepos: repos,
        languages,
        topLanguages,
        totalStars,
        lastActive,
        isActive
      };
    } catch (error) {
      console.error(`Failed to get enhanced data for ${username}:`, error);
      return {
        profile: null,
        topRepos: [],
        languages: {},
        topLanguages: [],
        totalStars: 0,
        lastActive: null,
        isActive: false
      };
    }
  }

  // 複数ユーザーのバッチ処理
  async batchGetEnhancedData(usernames: string[]): Promise<{ [username: string]: GitHubEnhancedData }> {
    const results: { [username: string]: GitHubEnhancedData } = {};
    
    // バッチサイズを制限してレート制限を回避
    const batchSize = 5;
    for (let i = 0; i < usernames.length; i += batchSize) {
      const batch = usernames.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (username) => {
        const data = await this.getEnhancedUserData(username);
        return { username, data };
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(({ username, data }) => {
        results[username] = data;
      });

      // バッチ間で少し待機
      if (i + batchSize < usernames.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}

export default GitHubService; 