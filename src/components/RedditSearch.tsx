'use client';

import { useState, useEffect } from 'react';
import { RedditSearchResult } from '@/types/business';
import { searchRedditBusiness, getRedditTrendingTopics, formatRedditDate } from '@/lib/reddit';
import { config } from '@/lib/config';
import { Search, TrendingUp, ExternalLink, MessageCircle, ThumbsUp, Clock } from 'lucide-react';

export default function RedditSearch() {
  const [query, setQuery] = useState('');
  const [selectedSubreddit, setSelectedSubreddit] = useState('');
  const [results, setResults] = useState<RedditSearchResult[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'trending'>('search');

  useEffect(() => {
    loadTrendingTopics();
  }, []);

  const loadTrendingTopics = async () => {
    try {
      const topics = await getRedditTrendingTopics();
      setTrendingTopics(topics);
    } catch (error) {
      console.error('Error loading trending topics:', error);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const searchResults = await searchRedditBusiness(query, selectedSubreddit || undefined);
      setResults(searchResults);
    } catch (error) {
      console.error('Error searching Reddit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrendingTopicClick = (topic: string) => {
    setQuery(topic);
    setActiveTab('search');
  };

  const getSubredditColor = (subreddit: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-red-100 text-red-800',
      'bg-yellow-100 text-yellow-800',
    ];
    const index = config.redditSubreddits.indexOf(subreddit);
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Reddit Business Solutions
        </h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'search'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'trending'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Trending
          </button>
        </div>
      </div>

      {activeTab === 'search' ? (
        <div className="space-y-4">
          {/* Search Form */}
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search for business solutions, tools, automation..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>
            <select
              value={selectedSubreddit}
              onChange={(e) => setSelectedSubreddit(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">All Subreddits</option>
              {config.redditSubreddits.map((subreddit) => (
                <option key={subreddit} value={subreddit}>
                  r/{subreddit}
                </option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result) => (
                <div key={result.subreddit} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubredditColor(result.subreddit)}`}>
                      r/{result.subreddit}
                    </span>
                    <span className="text-sm text-gray-500">
                      {result.posts.length} results
                    </span>
                  </div>
                  <div className="space-y-3">
                    {result.posts.map((post) => (
                      <div key={post.id} className="border-l-4 border-blue-200 pl-4 py-2">
                        <h3 className="font-medium text-gray-800 mb-1 line-clamp-2">
                          {post.title}
                        </h3>
                        {post.selftext && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                            {post.selftext}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            <span>{post.score}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{post.num_comments}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatRedditDate(post.created_utc)}</span>
                          </div>
                          <span>u/{post.author}</span>
                        </div>
                        <a
                          href={post.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mt-2"
                        >
                          View on Reddit
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : query && !isLoading ? (
            <div className="text-center py-8">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No results found</h3>
              <p className="text-gray-400 mb-4">
                Reddit API may be temporarily unavailable or try different keywords
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Reddit&apos;s API has restrictions on serverless functions. 
                  Try searching for broader terms or check back later.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">Search Reddit for Business Solutions</h3>
              <p className="text-gray-400">
                Find tools, automation, and advice from the business community
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-800">Trending Business Topics</h3>
          </div>
          
          {trendingTopics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {trendingTopics.map((topic, index) => (
                <button
                  key={index}
                  onClick={() => handleTrendingTopicClick(topic)}
                  className="text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium text-gray-800 line-clamp-2 mb-1">
                    {topic}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Click to search for this topic
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">Loading trending topics...</h3>
              <p className="text-gray-400">
                Fetching the latest business discussions
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
