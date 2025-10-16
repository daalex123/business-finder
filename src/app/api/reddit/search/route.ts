import { NextRequest, NextResponse } from 'next/server';

// Cache for Reddit responses (in-memory cache for serverless)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// User-Agent rotation to avoid detection
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
];

function getRandomUserAgent(): string {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const subreddit = searchParams.get('subreddit');

        if (!query) {
            return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
        }

        const subredditParam = subreddit || 'entrepreneur';
        const cacheKey = `${subredditParam}-${query}`;

        // Check cache first
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('Returning cached Reddit data');
            return NextResponse.json(cached.data);
        }

        // Try multiple approaches to get Reddit data
        let response: Response;
        let data: unknown;

        // Add random delay to avoid rate limiting
        await delay(Math.random() * 1000 + 500);

        // First try: Direct API call with rotating User-Agent
        try {
            const redditUrl = `https://www.reddit.com/r/${subredditParam}/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=10&t=all&raw_json=1`;

            response = await fetch(redditUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': getRandomUserAgent(),
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'cross-site',
                    'Referer': 'https://www.reddit.com/',
                    'Origin': 'https://www.reddit.com',
                },
            });

            if (response.ok) {
                data = await response.json();
                console.log('Reddit API success with direct call');
            } else {
                throw new Error(`Direct API failed: ${response.status}`);
            }
        } catch (directError) {
            console.warn('Direct Reddit API failed, trying alternative approach:', directError);

            // Second try: Use a different endpoint with different parameters
            try {
                await delay(1000); // Additional delay

                const altUrl = `https://www.reddit.com/r/${subredditParam}/search.json?q=${encodeURIComponent(query)}&sort=new&limit=10&t=week&raw_json=1`;

                response = await fetch(altUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': getRandomUserAgent(),
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Referer': 'https://www.reddit.com/',
                    },
                });

                if (response.ok) {
                    data = await response.json();
                    console.log('Reddit API success with alternative call');
                } else {
                    throw new Error(`Alternative API failed: ${response.status}`);
                }
            } catch (altError) {
                console.warn('Alternative Reddit API failed, trying third approach:', altError);

                // Third try: Use hot.json endpoint as last resort
                try {
                    await delay(1500);

                    const hotUrl = `https://www.reddit.com/r/${subredditParam}/hot.json?limit=10&raw_json=1`;

                    response = await fetch(hotUrl, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'User-Agent': getRandomUserAgent(),
                            'Accept-Language': 'en-US,en;q=0.9',
                        },
                    });

                    if (response.ok) {
                        data = await response.json();
                        console.log('Reddit API success with hot endpoint');
                    } else {
                        throw new Error(`Hot API failed: ${response.status}`);
                    }
                } catch (hotError) {
                    console.warn('All Reddit API attempts failed, returning empty results:', hotError);

                    // Return empty results instead of error
                    const emptyResult = {
                        data: {
                            children: []
                        }
                    };

                    // Cache empty result for shorter duration
                    cache.set(cacheKey, { data: emptyResult, timestamp: Date.now() });
                    return NextResponse.json(emptyResult);
                }
            }
        }

        // Cache successful result
        cache.set(cacheKey, { data, timestamp: Date.now() });
        return NextResponse.json(data);
    } catch (error) {
        console.error('Reddit API error:', error);

        // Return empty results instead of error to prevent frontend crashes
        return NextResponse.json({
            data: {
                children: []
            }
        });
    }
}
