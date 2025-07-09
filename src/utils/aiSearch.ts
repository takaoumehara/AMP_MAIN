// AI Search utility for OpenAI API integration
import { createSearchPatterns, expandSearchTerms } from './synonymMapping';

export interface AISearchResponse {
  matchingIds: string[];
  error?: string;
  confidence?: number;
  reasoning?: string;
  scoredResults?: any[];
}

// Enhanced prompt engineering with comprehensive synonym support
function createEnhancedPrompt(csvData: string, query: string): string {
  const searchPatterns = createSearchPatterns(query);
  const expandedTerms = expandSearchTerms(query);
  
  return `You are searching a database of bootcamp participants to find people who match the user's query.

SEARCH QUERY: "${query}"

CONTEXT:
- This is a people search for a bootcamp directory
- Users search for roles, skills, interests, names, or technologies
- Results will be displayed as profile cards to the user
- Accuracy is more important than quantity

SEARCH THESE EQUIVALENT TERMS:
${expandedTerms.join(', ')}

INSTRUCTIONS:
1. Search ALL fields: name, roles, team, skills, interests, ideas, github_bio, github_company, github_languages, github_repos
2. Match both Japanese and English terms
3. Return people who are relevant to the search query
4. Be inclusive - if someone might be a good match, include them

ROLE MATCHING EXAMPLES:
- "デザイナー" or "Designer" → Match: Designer, UI Designer, UX Designer, Creative, クリエーター
- "エンジニア" or "Engineer" → Match: Engineer, Developer, Software Engineer, Programmer, エンジニア
- "PM" or "プロダクトマネージャー" → Match: Product Manager, PM, Manager, プロダクトマネージャー
- "AI" → Match: AI, Machine Learning, ML, 人工知能, Data Science

IMPORTANT:
- For combined roles like "PM, Engineer", match if searching for EITHER role
- Look beyond just the roles field - check skills, interests, and experience too
- Someone interested in design but not titled "Designer" could still match "デザイナー"

DATA FORMAT (CSV):
${csvData}

RESPONSE FORMAT:
Return a valid JSON array of user IDs only: ["1", "2", "3"]
No explanations, no additional text, just the array.

Find users matching: ${query}`;
}

// Load and compress JSON data for system prompt with GitHub data
async function loadCompressedJSONData(): Promise<string> {
  try {
    const response = await fetch('/people_with_github.json');
    const jsonData = await response.json();
    
    // Extract participants array
    const participants = jsonData.participants || jsonData;
    
    // Create compressed data with essential fields including GitHub data
    const compressedData = participants.map((person: any) => {
      const nameJa = person.name?.ja || '';
      const nameEn = person.name?.en || '';
      const rolesJa = person.role?.map((r: any) => r.ja).join(', ') || '';
      const rolesEn = person.role?.map((r: any) => r.en).join(', ') || '';
      const teamJa = person.team?.ja || '';
      const teamEn = person.team?.en || '';
      const specialtiesJa = person.specialty?.map((s: any) => s.ja).join(', ') || '';
      const specialtiesEn = person.specialty?.map((s: any) => s.en).join(', ') || '';
      const interestsJa = person.interests?.map((i: any) => i.ja).join(', ') || '';
      const interestsEn = person.interests?.map((i: any) => i.en).join(', ') || '';
      const ideasJa = person.ideas?.map((i: any) => i.ja).join(', ') || '';
      const ideasEn = person.ideas?.map((i: any) => i.en).join(', ') || '';
      
      // GitHub enhanced data
      const githubBio = person.github_enhanced?.profile.bio || '';
      const githubCompany = person.github_enhanced?.profile.company || '';
      const githubLanguages = person.github_enhanced?.languages.topLanguages?.join(', ') || '';
      const githubRepos = person.github_enhanced?.topRepos?.map((repo: any) => 
        `${repo.name} (${repo.description || 'No description'})`
      ).join(', ') || '';
      
      return {
        id: person.id,
        name: `${nameJa} ${nameEn}`.trim(),
        roles: `${rolesJa} ${rolesEn}`.trim(),
        team: `${teamJa} ${teamEn}`.trim(),
        skills: `${specialtiesJa} ${specialtiesEn}`.trim(),
        interests: `${interestsJa} ${interestsEn}`.trim(),
        ideas: `${ideasJa} ${ideasEn}`.trim(),
        github_bio: githubBio,
        github_company: githubCompany,
        github_languages: githubLanguages,
        github_repos: githubRepos
      };
    });
    
    // Convert to CSV format for AI processing
    const csvLines = ['id,name,roles,team,skills,interests,ideas,github_bio,github_company,github_languages,github_repos'];
    
    compressedData.forEach((person: any) => {
      csvLines.push([
        person.id,
        `"${person.name.replace(/"/g, '""')}"`, // Escape quotes
        `"${person.roles.replace(/"/g, '""')}"`,
        `"${person.team.replace(/"/g, '""')}"`,
        `"${person.skills.replace(/"/g, '""')}"`,
        `"${person.interests.replace(/"/g, '""')}"`,
        `"${person.ideas.replace(/"/g, '""')}"`,
        `"${person.github_bio.replace(/"/g, '""')}"`,
        `"${person.github_company.replace(/"/g, '""')}"`,
        `"${person.github_languages.replace(/"/g, '""')}"`,
        `"${person.github_repos.replace(/"/g, '""')}"`
      ].join(','));
    });
    
    return csvLines.join('\n');
  } catch (error) {
    console.error('Failed to load JSON data:', error);
    // Fallback to CSV if JSON fails
    try {
      const response = await fetch('/people_gemini_fixed.csv');
      const csvText = await response.text();
      
      // Parse CSV and extract only essential fields for search
      const lines = csvText.split('\n');
      const headers = lines[0].split(',');
      
      // Find indices of essential fields
      const idIndex = headers.findIndex(h => h.includes('id'));
      const nameJaIndex = headers.findIndex(h => h.includes('name_ja'));
      const nameEnIndex = headers.findIndex(h => h.includes('name_en'));
      const rolesJaIndex = headers.findIndex(h => h.includes('roles_ja'));
      const rolesEnIndex = headers.findIndex(h => h.includes('roles_en'));
      const teamJaIndex = headers.findIndex(h => h.includes('team_ja'));
      const teamEnIndex = headers.findIndex(h => h.includes('team_en'));
      const specialtiesJaIndex = headers.findIndex(h => h.includes('specialties_ja'));
      const specialtiesEnIndex = headers.findIndex(h => h.includes('specialties_en'));
      const interestsJaIndex = headers.findIndex(h => h.includes('interests_ja'));
      const interestsEnIndex = headers.findIndex(h => h.includes('interests_en'));
      const ideasJaIndex = headers.findIndex(h => h.includes('ideas_ja'));
      const ideasEnIndex = headers.findIndex(h => h.includes('ideas_en'));
      
      // Create compressed CSV with only essential fields
      const compressedLines = ['id,name,roles,team,skills,interests,ideas,github_bio,github_company,github_languages,github_repos'];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        const fields = line.split(',');
        const id = fields[idIndex] || '';
        const name = `${fields[nameJaIndex] || ''} ${fields[nameEnIndex] || ''}`.trim();
        const roles = `${fields[rolesJaIndex] || ''} ${fields[rolesEnIndex] || ''}`.trim();
        const team = `${fields[teamJaIndex] || ''} ${fields[teamEnIndex] || ''}`.trim();
        const skills = `${fields[specialtiesJaIndex] || ''} ${fields[specialtiesEnIndex] || ''}`.trim();
        const interests = `${fields[interestsJaIndex] || ''} ${fields[interestsEnIndex] || ''}`.trim();
        const ideas = `${fields[ideasJaIndex] || ''} ${fields[ideasEnIndex] || ''}`.trim();
        
        compressedLines.push(`${id},"${name}","${roles}","${team}","${skills}","${interests}","${ideas}","","","",""`);
      }
      
      return compressedLines.join('\n');
    } catch (csvError) {
      console.error('Failed to load CSV data as fallback:', csvError);
      throw new Error('Failed to load user data');
    }
  }
}

// Enhanced JSON parsing with multiple fallback strategies
function parseAIResponse(response: string): string[] {
  // Strategy 1: Direct JSON parsing
  try {
    const parsed = JSON.parse(response);
    if (Array.isArray(parsed)) {
      return parsed.map(id => String(id));
    }
  } catch (e) {
    // Continue to next strategy
  }
  
  // Strategy 2: Extract JSON array from response
  const jsonArrayMatch = response.match(/\[[\s\S]*?\]/);
  if (jsonArrayMatch) {
    try {
      const parsed = JSON.parse(jsonArrayMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed.map(id => String(id));
      }
    } catch (e) {
      // Continue to next strategy
    }
  }
  
  // Strategy 3: Extract numbers/IDs from response
  const numberMatches = response.match(/\d+/g);
  if (numberMatches) {
    return numberMatches.map(id => String(id));
  }
  
  // Strategy 4: Look for quoted strings that might be IDs
  const quotedMatches = response.match(/"(\d+)"/g);
  if (quotedMatches) {
    return quotedMatches.map(match => match.replace(/"/g, ''));
  }
  
  console.warn('Failed to parse AI response:', response);
  return [];
}

// Search users using OpenAI API with enhanced error handling
export async function searchUsersWithAI(query: string): Promise<AISearchResponse> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    return {
      matchingIds: [],
      error: 'OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.'
    };
  }

  if (!query.trim()) {
    return {
      matchingIds: [],
      error: 'Search query is empty'
    };
  }

  try {
    // Load compressed JSON data for system prompt
    const csvData = await loadCompressedJSONData();
    
    console.log('Compressed CSV size:', csvData.length, 'characters');
    
    // Create enhanced prompt
    const enhancedPrompt = createEnhancedPrompt(csvData, query);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful search assistant for a bootcamp directory. Return only valid JSON arrays of user IDs that match the search query. Focus on being accurate and inclusive.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        max_completion_tokens: 300,
        temperature: 0.1, // Very low temperature for consistent results
        // Removed response_format to avoid confusion between JSON object vs array
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content?.trim();

    if (!aiResponse) {
      return {
        matchingIds: [],
        error: 'No response from AI'
      };
    }

    // Enhanced parsing with fallback strategies
    const matchingIds = parseAIResponse(aiResponse);
    
    console.log('AI search query:', query);
    console.log('AI raw response:', aiResponse);
    console.log('AI parsed results:', matchingIds);
    
    return {
      matchingIds,
      confidence: matchingIds.length > 0 ? 0.8 : 0.1,
      reasoning: `Found ${matchingIds.length} matches for "${query}"`
    };

  } catch (error) {
    console.error('AI search error:', error);
    return {
      matchingIds: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Fallback search function
export async function searchUsersWithFallback(query: string): Promise<AISearchResponse> {
  // Try AI search first
  const aiResult = await searchUsersWithAI(query);
  
  if (!aiResult.error && aiResult.matchingIds.length > 0) {
    return aiResult;
  }
  
  // If AI fails, try structured search as fallback
  try {
    const response = await fetch('/people_with_github.json');
    const jsonData = await response.json();
    const participants = jsonData.participants || jsonData;
    
    const lowerQuery = query.toLowerCase();
    const matchingIds: string[] = [];
    
    participants.forEach((person: any) => {
      const searchableText = [
        person.name?.ja || '',
        person.name?.en || '',
        person.role?.map((r: any) => `${r.ja} ${r.en}`).join(' ') || '',
        person.team?.ja || '',
        person.team?.en || '',
        person.specialty?.map((s: any) => `${s.ja} ${s.en}`).join(' ') || '',
        person.interests?.map((i: any) => `${i.ja} ${i.en}`).join(' ') || '',
        person.ideas?.map((i: any) => `${i.ja} ${i.en}`).join(' ') || '',
        person.github_enhanced?.profile.bio || '',
        person.github_enhanced?.profile.company || '',
        person.github_enhanced?.languages.topLanguages?.join(' ') || '',
        person.github_enhanced?.topRepos?.map((repo: any) => `${repo.name} ${repo.description || ''}`).join(' ') || ''
      ].join(' ').toLowerCase();
      
      if (searchableText.includes(lowerQuery)) {
        matchingIds.push(String(person.id));
      }
    });
    
    return {
      matchingIds,
      confidence: 0.6, // Lower confidence for fallback
      reasoning: `Fallback search found ${matchingIds.length} matches`
    };
    
  } catch (fallbackError) {
    console.error('Fallback search also failed:', fallbackError);
    return {
      matchingIds: [],
      error: 'Both AI and fallback search failed'
    };
  }
} 