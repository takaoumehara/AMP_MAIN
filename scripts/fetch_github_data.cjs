const fs = require('fs');
const path = require('path');
const https = require('https');

// GitHub API service implementation in CommonJS
class GitHubService {
  constructor(token) {
    this.baseURL = 'https://api.github.com';
    this.token = token;
    this.cache = new Map();
    this.cacheTimeout = 1000 * 60 * 60; // 1時間
  }

  async request(endpoint) {
    // キャッシュチェック
    const cacheKey = endpoint;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const options = {
      hostname: 'api.github.com',
      path: endpoint,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'PeopleDiscoveryApp/1.0'
      }
    };

    if (this.token) {
      options.headers['Authorization'] = `Bearer ${this.token}`;
    }

    return new Promise((resolve, reject) => {
      const req = https.get(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const remaining = res.headers['x-ratelimit-remaining'];
            if (remaining && parseInt(remaining) < 10) {
              console.warn(`GitHub API rate limit low: ${remaining} requests remaining`);
            }

            if (res.statusCode === 404) {
              resolve(null);
              return;
            }

            if (res.statusCode === 403) {
              console.warn('GitHub API rate limit exceeded');
              resolve(null);
              return;
            }

            if (res.statusCode !== 200) {
              reject(new Error(`GitHub API error: ${res.statusCode} ${res.statusMessage}`));
              return;
            }

            const result = JSON.parse(data);
            
            // キャッシュに保存
            this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
            
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        console.error(`GitHub API request failed for ${endpoint}:`, error);
        resolve(null);
      });

      req.setTimeout(10000, () => {
        req.destroy();
        resolve(null);
      });
    });
  }

  async getUserProfile(username) {
    return this.request(`/users/${username}`);
  }

  async getUserRepos(username, limit = 10) {
    const repos = await this.request(`/users/${username}/repos?sort=stars&per_page=${limit}&type=owner`);
    return repos || [];
  }

  async getRepoLanguages(username, repoName) {
    return this.request(`/repos/${username}/${repoName}/languages`);
  }

  async getUserLanguages(username) {
    const repos = await this.getUserRepos(username, 20);
    if (!repos || repos.length === 0) return {};

    const languageStats = {};

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
          languageStats[lang] = (languageStats[lang] || 0) + bytes;
        });
      }
    });

    return languageStats;
  }

  async getEnhancedUserData(username) {
    try {
      console.log(`Fetching data for ${username}...`);
      
      const [profile, repos, languages] = await Promise.all([
        this.getUserProfile(username),
        this.getUserRepos(username, 10),
        this.getUserLanguages(username)
      ]);

      if (!profile) {
        console.log(`No profile found for ${username}`);
        return null;
      }

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

      console.log(`✓ Successfully fetched data for ${username}`);

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
      return null;
    }
  }

  async batchGetEnhancedData(usernames) {
    const results = {};
    
    // バッチサイズを制限してレート制限を回避
    const batchSize = 3; // より保守的に
    for (let i = 0; i < usernames.length; i += batchSize) {
      const batch = usernames.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(usernames.length/batchSize)} (${batch.join(', ')})`);
      
      const batchPromises = batch.map(async (username) => {
        const data = await this.getEnhancedUserData(username);
        return { username, data };
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(({ username, data }) => {
        results[username] = data;
      });

      // バッチ間で少し待機（レート制限対策）
      if (i + batchSize < usernames.length) {
        console.log('Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return results;
  }
}

// CSVファイルを読み込んでGitHubアカウントを抽出
function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  const githubAccountIndex = headers.indexOf('github_account');
  
  if (githubAccountIndex === -1) {
    throw new Error('github_account column not found in CSV');
  }

  const githubAccounts = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      const columns = line.split(',');
      const githubAccount = columns[githubAccountIndex];
      if (githubAccount && githubAccount !== 'N/A' && githubAccount.trim()) {
        githubAccounts.push(githubAccount.trim());
      }
    }
  }

  return [...new Set(githubAccounts)]; // 重複を除去
}

async function main() {
  try {
    // 環境変数からGitHub tokenを取得
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.warn('GITHUB_TOKEN not found. Running without authentication (rate limited).');
    }

    // CSVファイルを読み込み
    const csvPath = path.join(__dirname, '../src/data/people_gemini_fixed.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // GitHubアカウントを抽出
    const githubAccounts = parseCSV(csvContent);
    console.log(`Found ${githubAccounts.length} GitHub accounts to process`);
    console.log('Accounts:', githubAccounts);

    // GitHub APIサービスを初期化
    const githubService = new GitHubService(token);

    // バッチでデータを取得
    const githubData = await githubService.batchGetEnhancedData(githubAccounts);

    // 結果を保存
    const outputPath = path.join(__dirname, '../src/data/github_enhanced_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(githubData, null, 2));

    // 統計を表示
    const successCount = Object.values(githubData).filter(data => data !== null).length;
    const failCount = Object.values(githubData).filter(data => data === null).length;

    console.log('\n=== GitHub Data Fetch Summary ===');
    console.log(`Total accounts processed: ${githubAccounts.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed/Not found: ${failCount}`);
    console.log(`Data saved to: ${outputPath}`);

    // 成功したアカウントの詳細
    const successfulAccounts = Object.entries(githubData)
      .filter(([, data]) => data !== null)
      .map(([username, data]) => ({
        username,
        repos: data.topRepos.length,
        languages: data.topLanguages.length,
        stars: data.totalStars,
        active: data.isActive
      }));

    console.log('\n=== Successful Accounts ===');
    successfulAccounts.forEach(account => {
      console.log(`${account.username}: ${account.repos} repos, ${account.languages} languages, ${account.stars} stars, ${account.active ? 'active' : 'inactive'}`);
    });

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 