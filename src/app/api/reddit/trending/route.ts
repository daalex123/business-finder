import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const redditUrl = 'https://www.reddit.com/r/entrepreneur/hot.json?limit=20&raw_json=1';

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
            { error: 'Failed to fetch Reddit trending data' },
            { status: 500 }
        );
    }
}
