import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const subreddit = searchParams.get('subreddit');

        if (!query) {
            return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
        }

        const subredditParam = subreddit || 'entrepreneur';
        const redditUrl = `https://www.reddit.com/r/${subredditParam}/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=10&t=all&raw_json=1`;

        const response = await fetch(redditUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'BusinessFinder/1.0 (https://businessfinder.app)',
                'Accept-Language': 'en-US,en;q=0.9',
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Reddit API error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Reddit API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch Reddit data' },
            { status: 500 }
        );
    }
}
