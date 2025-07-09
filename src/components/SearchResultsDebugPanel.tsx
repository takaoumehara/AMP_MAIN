import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Brain, Zap, Clock, Target, TrendingUp } from 'lucide-react';
import { HybridSearchResponse, SearchResult } from '../utils/hybridSearch';

interface SearchResultsDebugPanelProps {
  results: HybridSearchResponse | null;
  query: string;
}

export const SearchResultsDebugPanel = ({ results, query }: SearchResultsDebugPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'structured' | 'ai' | 'hybrid'>('overview');

  if (!results) return null;

  const renderResultsList = (resultsList: SearchResult[], title: string) => (
    <div className="space-y-2">
      <h4 className="font-medium text-gray-900 dark:text-gray-100">{title}</h4>
      {resultsList.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No results</p>
      ) : (
        <div className="space-y-1">
          {resultsList.map((result, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs bg-gray-200 dark:bg-gray-600 px-1 rounded">
                  ID:{result.id}
                </span>
                <span className="text-gray-600 dark:text-gray-300">
                  Score: {result.score.toFixed(2)}
                </span>
                <span className="text-gray-600 dark:text-gray-300">
                  Confidence: {(result.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                {result.source === 'structured' && <Search className="h-3 w-3 text-blue-500" />}
                {result.source === 'ai' && <Brain className="h-3 w-3 text-purple-500" />}
                {result.source === 'hybrid' && <Zap className="h-3 w-3 text-green-500" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMatchedFields = (result: SearchResult) => (
    <div className="mt-1">
      <div className="flex flex-wrap gap-1">
        {result.matchedFields.map((field, index) => (
          <span
            key={index}
            className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-1 py-0.5 rounded"
          >
            {field}
          </span>
        ))}
      </div>
    </div>
  );

  const getPerformanceColor = (time: number) => {
    if (time < 500) return 'text-green-600 dark:text-green-400';
    if (time < 1000) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 mb-4">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Search Debug Panel
            </span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            "{query}"
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {results.totalResults} results
          </span>
          <span className={`text-sm ${getPerformanceColor(results.searchTime)}`}>
            {results.searchTime}ms
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'structured', label: 'Structured', icon: Search },
              { id: 'ai', label: 'AI', icon: Brain },
              { id: 'hybrid', label: 'Hybrid', icon: Zap }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                <span className="ml-1 text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                  {tab.id === 'overview' ? results.totalResults : 
                   tab.id === 'structured' ? results.sources.structured.length :
                   tab.id === 'ai' ? results.sources.ai.length :
                   results.sources.hybrid.length}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Structured
                      </span>
                    </div>
                    <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {results.sources.structured.length}
                    </span>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                        AI
                      </span>
                    </div>
                    <span className="text-lg font-bold text-purple-900 dark:text-purple-100">
                      {results.sources.ai.length}
                    </span>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">
                        Hybrid
                      </span>
                    </div>
                    <span className="text-lg font-bold text-green-900 dark:text-green-100">
                      {results.sources.hybrid.length}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Time
                      </span>
                    </div>
                    <span className={`text-lg font-bold ${getPerformanceColor(results.searchTime)}`}>
                      {results.searchTime}ms
                    </span>
                  </div>
                </div>

                {/* Search Quality Metrics */}
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Search Quality Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Average Confidence:</span>
                      <span className="ml-2 font-medium">
                        {results.results.length > 0 
                          ? (results.results.reduce((sum, r) => sum + r.confidence, 0) / results.results.length * 100).toFixed(1) + '%'
                          : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Top Score:</span>
                      <span className="ml-2 font-medium">
                        {results.results.length > 0 ? results.results[0].score.toFixed(2) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {results.error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg">
                    <h4 className="font-medium text-red-900 dark:text-red-100 mb-1">Error</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">{results.error}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'structured' && (
              <div>
                {renderResultsList(results.sources.structured, 'Structured Search Results')}
                {results.sources.structured.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Matched Fields
                    </h4>
                    {results.sources.structured.slice(0, 5).map((result, index) => (
                      <div key={index} className="mb-2">
                        <span className="text-sm font-mono text-gray-600 dark:text-gray-300">
                          ID:{result.id}
                        </span>
                        {renderMatchedFields(result)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ai' && (
              <div>
                {renderResultsList(results.sources.ai, 'AI Search Results')}
                {results.sources.ai.length > 0 && (
                  <div className="mt-4 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                      AI Search Info
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      AI search uses OpenAI's GPT-4o-mini model to understand natural language queries
                      and find semantically related matches across all user fields.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'hybrid' && (
              <div>
                {renderResultsList(results.sources.hybrid, 'Hybrid Search Results')}
                {results.sources.hybrid.length > 0 && (
                  <div className="mt-4 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                      Hybrid Search Info
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Hybrid results combine structured and AI search results, with weighted scoring
                      to provide the most relevant matches.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 