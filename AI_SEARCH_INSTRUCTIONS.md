# AI Search Feature Implementation

## Overview
The AI search feature has been successfully implemented using the OpenAI API. When a user enters a search query and clicks "AI Search", it sends the query along with the CSV user data to OpenAI and returns only the matching user IDs.

## How It Works

1. **System Prompt**: The CSV data (people_gemini_fixed.csv) is loaded and compressed, then included in the system prompt
2. **User Query**: The search query is sent as the user prompt to OpenAI
3. **AI Response**: OpenAI returns only the IDs of matching users as a JSON array
4. **Frontend Display**: The app filters and displays only the matching user profiles

## Features

- ✅ Natural language search in English or Japanese
- ✅ Searches across all user fields (name, roles, skills, interests, team, etc.)
- ✅ Returns only user IDs for efficient filtering
- ✅ Loading states and error handling
- ✅ Keyboard shortcuts (Enter to search, Cmd/Ctrl+K to focus)
- ✅ AI search status indicator with results count
- ✅ Clears regular filters when AI search is active
- ✅ Clears AI results when regular search/filters are used

## Usage

1. **Make sure your OpenAI API key is set** in the `.env` file:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

2. **Test queries to try**:
   - "Find engineers who work with AI"
   - "Show me people interested in robotics"
   - "Who works on AI podcasts?"
   - "Find designers"
   - "People from Tascale team"
   - "誰がロボティクスに興味がありますか？" (Japanese)

3. **How to use**:
   - Enter a query in the search box
   - Click "AI Search" button or press Enter
   - See "Searching..." while processing
   - View results showing only matching profiles
   - See status message "AI Search Results: Found X matching users"

## Technical Implementation

### Files Modified

- `src/utils/aiSearch.ts` - AI search utility with OpenAI integration
- `src/components/SearchBar.tsx` - Updated with AI search button and handlers
- `src/App.tsx` - Integrated AI search state management
- `public/people_gemini_fixed.csv` - CSV data accessible via HTTP

### SearchBar Component

The SearchBar now includes:
- AI Search button with loading states
- Error handling and display
- Keyboard shortcuts (Enter for search, Cmd/Ctrl+K for focus)
- Disabled state during search

### State Management

- `aiSearchResults`: Array of user IDs returned by AI
- `isAISearchActive`: Boolean flag to show AI search status
- Automatic clearing of regular filters when AI search is used
- Automatic clearing of AI results when regular search/filters are used

### System Prompt Structure

The system prompt includes:
- Compressed CSV data with essential fields only
- Clear instructions to search all fields
- Requirement to return only IDs as JSON array
- Examples of expected response format

## Error Handling

- API key validation
- Network error handling
- Invalid response format handling
- Empty query validation
- User-friendly error messages

## Performance Optimizations

- CSV data compression (only essential fields sent to AI)
- Efficient JSON parsing
- Minimal token usage with gpt-4o-mini model
- Loading states for better UX

## Integration

The AI search seamlessly integrates with the existing filter system:
- AI search results override regular filters
- Regular search/filter usage clears AI results
- Maintains existing UI/UX patterns
- Works with both sidebar and top filter layouts 