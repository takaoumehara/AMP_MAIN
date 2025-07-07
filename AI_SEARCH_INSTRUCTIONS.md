# AI Search Feature Implementation

## Overview
The AI search feature has been successfully implemented using the OpenAI API. When a user enters a search query, it sends the query along with the CSV user data to OpenAI and returns only the matching user IDs.

## How It Works

1. **System Prompt**: The CSV data (people_gemini_fixed.csv) is included in the system prompt
2. **User Query**: The search query is sent as the user prompt
3. **AI Response**: OpenAI returns only the IDs of matching users as a JSON array
4. **Frontend Display**: The app filters and displays only the matching user profiles

## Files Modified

- `src/utils/aiSearch.ts` - New utility for AI search functionality
- `src/App.tsx` - Updated to integrate AI search with existing filters
- `public/people_gemini_fixed.csv` - CSV data accessible via HTTP

## Testing the Feature

1. **Make sure your OpenAI API key is set** in the `.env` file:
   ```
   VITE_OPENAI_API_KEY=sk-your-key-here
   ```

2. **Test queries to try**:
   - "Find engineers who work with AI"
   - "Show me people interested in robotics"
   - "Who works on AI podcasts?"
   - "Find designers"
   - "People from Tascale team"

3. **Expected behavior**:
   - Enter a query in the search box
   - Click "AI Search" button
   - See "Searching..." while processing
   - View results showing only matching profiles
   - See a message like "Found X matching users"

## Features

- ✅ Sends CSV data as system prompt to OpenAI
- ✅ Returns only user IDs as JSON array
- ✅ Filters frontend to show only matching profiles
- ✅ Clears regular filters when AI search is active
- ✅ Clears AI results when regular search/filters are used
- ✅ Error handling for API failures
- ✅ Loading states and user feedback

## System Prompt Structure

The system prompt includes:
- Complete CSV data with all user information
- Clear instructions to search all fields
- Requirement to return only IDs as JSON array
- Examples of expected response format

## Integration

The AI search seamlessly integrates with the existing filter system:
- AI search results override regular filters
- Regular search/filter usage clears AI results
- Maintains existing UI/UX patterns
- Works with both sidebar and top filter layouts 