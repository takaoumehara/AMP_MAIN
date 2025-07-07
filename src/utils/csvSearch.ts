import Papa from 'papaparse';

// Loads and parses the CSV file
async function loadCSV(url: string): Promise<Record<string, string>[]> {
  const response = await fetch(url);
  const text = await response.text();
  const result = Papa.parse<Record<string, string>>(text, { header: true });
  return result.data;
}

// Searches the CSV data for the query and returns matching IDs
export async function searchPeopleCSV(query: string): Promise<string[]> {
  const data = await loadCSV('/src/data/people_gemini_fixed.csv');
  const lowerQuery = query.toLowerCase();
  return data
    .filter(row =>
      Object.entries(row)
        .filter(([key]) => key.toLowerCase() !== 'id')
        .some(([, value]) => typeof value === 'string' && value.toLowerCase().includes(lowerQuery))
    )
    .map(row => row.id)
    .filter(Boolean);
} 