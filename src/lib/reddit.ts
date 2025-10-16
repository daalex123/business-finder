import { RedditPost, RedditSearchResult } from '@/types/business';
import { config } from './config';

export const searchRedditBusiness = async (
    query: string,
    subreddit?: string
): Promise<RedditSearchResult[]> => {
    const subreddits = subreddit ? [subreddit] : config.redditSubreddits;
    const results: RedditSearchResult[] = [];

    for (const sub of subreddits) {
        try {
            // Use our API route to bypass CORS
            const response = await fetch(
                `/api/reddit/search?q=${encodeURIComponent(query)}&subreddit=${sub}`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.children) {
                    const posts: RedditPost[] = data.data.children.map((child: { data: RedditPost }) => ({
                        id: child.data.id,
                        title: child.data.title,
                        selftext: child.data.selftext,
                        author: child.data.author,
                        score: child.data.score,
                        num_comments: child.data.num_comments,
                        created_utc: child.data.created_utc,
                        url: child.data.url,
                        permalink: `https://reddit.com${child.data.permalink}`,
                        subreddit: child.data.subreddit,
                        thumbnail: child.data.thumbnail && child.data.thumbnail !== 'self' ? child.data.thumbnail : undefined,
                    }));

                    if (posts.length > 0) {
                        results.push({
                            posts,
                            subreddit: sub,
                            query,
                        });
                    }
                }
            } else {
                console.warn(`Failed to fetch from r/${sub}:`, response.status);
            }
        } catch (error) {
            console.error(`Error searching r/${sub}:`, error);
        }
    }

    return results;
};

export const getRedditTrendingTopics = async (): Promise<string[]> => {
    try {
        // Use our API route to bypass CORS
        const response = await fetch('/api/reddit/trending', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.children) {
                return data.data.children
                    .map((child: { data: { title: string } }) => child.data.title)
                    .filter((title: string) => title.length > 10 && title.length < 100)
                    .slice(0, 10);
            }
        } else {
            console.warn('Failed to fetch trending topics:', response.status);
        }
    } catch (error) {
        console.error('Error fetching trending topics:', error);
    }

    // Return empty array if API fails
    return [];
};

export const formatRedditDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
        return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
        return `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else if (diffInSeconds < 2592000) {
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    } else {
        return date.toLocaleDateString();
    }
};
