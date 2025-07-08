// AI Search utility for OpenAI API integration
export interface AISearchResponse {
  matchingIds: string[];
  error?: string;
}

// Load and compress CSV data for system prompt
async function loadCompressedCSVData(): Promise<string> {
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
    const compressedLines = ['id,name,roles,team,skills,interests,ideas'];
    
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
      
      compressedLines.push(`${id},"${name}","${roles}","${team}","${skills}","${interests}","${ideas}"`);
    }
    
    return compressedLines.join('\n');
  } catch (error) {
    console.error('Failed to load CSV data:', error);
    throw new Error('Failed to load user data');
  }
}

// Search users using OpenAI API
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
    // Load compressed CSV data for system prompt
    const csvData = await loadCompressedCSVData();
    
    console.log('Compressed CSV size:', csvData.length, 'characters');
    
    const systemPrompt = `You are a search assistant. Below is CSV data with user information:

${csvData}

Search through this data based on the user's query. Look for matches in names, roles, teams, skills, interests, and ideas.

Return ONLY a JSON array of matching user IDs. Examples:
- Query: "designer" → ["1", "5", "12"]
- Query: "robotics" → ["3", "8"]
- No matches → []

Be flexible with matching - include partial matches and related terms.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Use model with larger context window
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_completion_tokens: 200, // Use new parameter name
        temperature: 0.1, // Low temperature for consistent results
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

    try {
      // Parse the JSON response
      const matchingIds = JSON.parse(aiResponse);
      
      // Ensure it's an array
      if (!Array.isArray(matchingIds)) {
        console.error('AI response is not an array:', aiResponse);
        return {
          matchingIds: [],
          error: 'Invalid response format from AI'
        };
      }

      // Convert all IDs to strings for consistency
      const stringIds = matchingIds.map(id => String(id));
      
      console.log('AI search results:', stringIds);
      
      return {
        matchingIds: stringIds
      };

    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse, parseError);
      return {
        matchingIds: [],
        error: 'Failed to parse AI response'
      };
    }

  } catch (error) {
    console.error('AI search error:', error);
    return {
      matchingIds: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
} 