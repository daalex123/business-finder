export interface Business {
    id: string;
    name: string;
    address: string;
    phone?: string;
    website?: string;
    rating?: number;
    user_ratings_total?: number;
    price_level?: number;
    types: string[];
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    photos?: Array<{
        photo_reference: string;
        height: number;
        width: number;
    }>;
    opening_hours?: {
        open_now: boolean;
        weekday_text: string[];
    };
    place_id: string;
}

export interface SearchFilters {
    businessTypes: string[];
    hasWebsite: boolean | null;
    keyword: string;
    radius: number;
    center: {
        lat: number;
        lng: number;
    };
}

export interface RedditPost {
    id: string;
    title: string;
    selftext: string;
    author: string;
    score: number;
    num_comments: number;
    created_utc: number;
    url: string;
    permalink: string;
    subreddit: string;
    thumbnail?: string;
}

export interface RedditSearchResult {
    posts: RedditPost[];
    subreddit: string;
    query: string;
}
