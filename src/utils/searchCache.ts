// Search Cache System for Performance Optimization
import { HybridSearchResponse } from './hybridSearch';

interface CacheEntry {
  query: string;
  results: HybridSearchResponse;
  timestamp: number;
  hits: number;
}

class SearchCache {
  private cache = new Map<string, CacheEntry>();
  private readonly maxEntries = 100;
  private readonly maxAge = 5 * 60 * 1000; // 5 minutes
  
  // Generate cache key from query
  private generateKey(query: string): string {
    return query.toLowerCase().trim();
  }
  
  // Check if cache entry is still valid
  private isValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.maxAge;
  }
  
  // Clean expired entries
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(key);
      }
    }
  }
  
  // Evict least recently used entries if cache is full
  private evictLRU(): void {
    if (this.cache.size <= this.maxEntries) return;
    
    // Find entry with lowest hits and oldest timestamp
    let lruKey = '';
    let lruScore = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      const score = entry.hits + (Date.now() - entry.timestamp) / 1000;
      if (score < lruScore) {
        lruScore = score;
        lruKey = key;
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }
  
  // Get cached results
  get(query: string): HybridSearchResponse | null {
    const key = this.generateKey(query);
    const entry = this.cache.get(key);
    
    if (!entry || !this.isValid(entry)) {
      if (entry) {
        this.cache.delete(key);
      }
      return null;
    }
    
    // Update hit count and timestamp
    entry.hits += 1;
    entry.timestamp = Date.now();
    
    console.log(`Cache hit for query: "${query}"`);
    return entry.results;
  }
  
  // Store results in cache
  set(query: string, results: HybridSearchResponse): void {
    const key = this.generateKey(query);
    
    // Don't cache error results
    if (results.error) {
      return;
    }
    
    this.cleanup();
    this.evictLRU();
    
    this.cache.set(key, {
      query: key,
      results,
      timestamp: Date.now(),
      hits: 1
    });
    
    console.log(`Cached results for query: "${query}"`);
  }
  
  // Clear all cache
  clear(): void {
    this.cache.clear();
    console.log('Search cache cleared');
  }
  
  // Get cache statistics
  getStats() {
    const entries = Array.from(this.cache.values());
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    const avgAge = entries.length > 0 
      ? entries.reduce((sum, entry) => sum + (Date.now() - entry.timestamp), 0) / entries.length
      : 0;
    
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      totalHits,
      avgAge: Math.round(avgAge / 1000), // in seconds
      hitRate: totalHits / (totalHits + this.cache.size) // approximation
    };
  }
  
  // Get popular queries
  getPopularQueries(limit = 10) {
    return Array.from(this.cache.values())
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit)
      .map(entry => ({
        query: entry.query,
        hits: entry.hits,
        lastUsed: new Date(entry.timestamp)
      }));
  }
}

// Export singleton instance
export const searchCache = new SearchCache();

// Search with caching wrapper
export async function searchWithCache(
  query: string,
  searchFunction: (query: string) => Promise<HybridSearchResponse>
): Promise<HybridSearchResponse> {
  // Try to get from cache first
  const cached = searchCache.get(query);
  if (cached) {
    return {
      ...cached,
      searchTime: 0 // Cache hit is instant
    };
  }
  
  // Execute search
  const results = await searchFunction(query);
  
  // Cache successful results
  if (!results.error) {
    searchCache.set(query, results);
  }
  
  return results;
}

// Prefetch popular queries
export async function prefetchPopularQueries(
  searchFunction: (query: string) => Promise<HybridSearchResponse>
): Promise<void> {
  const popularQueries = [
    'designer', 'developer', 'engineer', 'manager', 'PM',
    'React', 'Vue', 'Python', 'JavaScript', 'TypeScript',
    'AI', 'machine learning', 'frontend', 'backend', 'fullstack'
  ];
  
  console.log('Prefetching popular queries...');
  
  // Prefetch in batches to avoid overwhelming the API
  for (let i = 0; i < popularQueries.length; i += 3) {
    const batch = popularQueries.slice(i, i + 3);
    await Promise.all(
      batch.map(async (query) => {
        try {
          const results = await searchFunction(query);
          if (!results.error) {
            searchCache.set(query, results);
          }
        } catch (error) {
          console.warn(`Failed to prefetch query: ${query}`, error);
        }
      })
    );
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('Prefetching completed');
}

// Background cache maintenance
export function startCacheMaintenanceTask(): void {
  // Run cleanup every minute
  setInterval(() => {
    const stats = searchCache.getStats();
    console.log('Cache maintenance:', stats);
    
    // Force cleanup if cache is getting too large
    if (stats.size > stats.maxEntries * 0.8) {
      searchCache.clear();
      console.log('Cache cleared due to size limit');
    }
  }, 60 * 1000);
} 