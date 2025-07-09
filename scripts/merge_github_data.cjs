const fs = require('fs');
const path = require('path');

async function main() {
  try {
    // ファイルパスを定義
    const peopleJsonPath = path.join(__dirname, '../src/data/people_gemini_fixed.json');
    const githubDataPath = path.join(__dirname, '../src/data/github_enhanced_data.json');
    const outputPath = path.join(__dirname, '../src/data/people_with_github.json');

    // ファイルを読み込み
    const peopleFile = JSON.parse(fs.readFileSync(peopleJsonPath, 'utf-8'));
    const githubData = JSON.parse(fs.readFileSync(githubDataPath, 'utf-8'));

    // participantsを取得
    const peopleData = peopleFile.participants || peopleFile;

    console.log(`People data: ${peopleData.length} entries`);
    console.log(`GitHub data: ${Object.keys(githubData).length} entries`);

    // people.jsonを拡張
    const enhancedPeople = peopleData.map(person => {
      const githubAccount = person.github_account;
      
      // GitHubアカウントが存在し、GitHubデータが取得できている場合
      if (githubAccount && githubAccount !== 'N/A' && githubData[githubAccount]) {
        const ghData = githubData[githubAccount];
        
        if (ghData && ghData.profile) {
          // GitHubデータを統合
          return {
            ...person,
            github_enhanced: {
              // プロフィール情報
              profile: {
                name: ghData.profile.name,
                bio: ghData.profile.bio,
                company: ghData.profile.company,
                location: ghData.profile.location,
                blog: ghData.profile.blog,
                twitter_username: ghData.profile.twitter_username,
                public_repos: ghData.profile.public_repos,
                followers: ghData.profile.followers,
                following: ghData.profile.following,
                created_at: ghData.profile.created_at,
                updated_at: ghData.profile.updated_at,
                avatar_url: ghData.profile.avatar_url,
                html_url: ghData.profile.html_url
              },
              // 統計情報
              stats: {
                totalStars: ghData.totalStars,
                totalRepos: ghData.topRepos.length,
                isActive: ghData.isActive,
                lastActive: ghData.lastActive
              },
              // 言語情報
              languages: {
                topLanguages: ghData.topLanguages,
                languageStats: ghData.languages
              },
              // トップリポジトリ（簡略化）
              topRepos: ghData.topRepos.map(repo => ({
                name: repo.name,
                description: repo.description,
                language: repo.language,
                stargazers_count: repo.stargazers_count,
                forks_count: repo.forks_count,
                html_url: repo.html_url,
                topics: repo.topics,
                updated_at: repo.updated_at
              }))
            }
          };
        }
      }
      
      // GitHubデータがない場合はそのまま返す
      return person;
    });

    // 統計情報を表示
    const withGithubCount = enhancedPeople.filter(person => person.github_enhanced).length;
    const withoutGithubCount = enhancedPeople.length - withGithubCount;

    console.log('\n=== GitHub Integration Summary ===');
    console.log(`Total people: ${enhancedPeople.length}`);
    console.log(`With GitHub data: ${withGithubCount}`);
    console.log(`Without GitHub data: ${withoutGithubCount}`);

    // 言語統計
    const allLanguages = new Set();
    enhancedPeople.forEach(person => {
      if (person.github_enhanced && person.github_enhanced.languages.topLanguages) {
        person.github_enhanced.languages.topLanguages.forEach(lang => allLanguages.add(lang));
      }
    });

    console.log(`\nUnique programming languages found: ${allLanguages.size}`);
    console.log('Languages:', Array.from(allLanguages).sort());

    // アクティブユーザー統計
    const activeUsers = enhancedPeople.filter(person => 
      person.github_enhanced && person.github_enhanced.stats.isActive
    ).length;

    console.log(`\nActive GitHub users (last 6 months): ${activeUsers}`);

    // 結果を保存（元の構造を保持）
    const outputData = peopleFile.participants ? 
      { ...peopleFile, participants: enhancedPeople } : 
      enhancedPeople;
    
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    console.log(`\nEnhanced data saved to: ${outputPath}`);

    // 成功例を表示
    console.log('\n=== Sample Enhanced Profiles ===');
    enhancedPeople
      .filter(person => person.github_enhanced)
      .slice(0, 3)
      .forEach(person => {
        const gh = person.github_enhanced;
        console.log(`\n${person.name_en || person.name_ja}:`);
        console.log(`  GitHub: ${person.github_account}`);
        console.log(`  Bio: ${gh.profile.bio || 'N/A'}`);
        console.log(`  Languages: ${gh.languages.topLanguages.join(', ')}`);
        console.log(`  Repos: ${gh.stats.totalRepos}, Stars: ${gh.stats.totalStars}`);
        console.log(`  Active: ${gh.stats.isActive ? 'Yes' : 'No'}`);
      });

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 