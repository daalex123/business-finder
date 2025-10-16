import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Try multiple approaches to get Reddit data
        let response: Response;
        let data: unknown;

        // First try: Direct API call with better headers
        try {
            const redditUrl = 'https://www.reddit.com/r/entrepreneur/hot.json?limit=20&raw_json=1';

            response = await fetch(redditUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                },
            });

            if (response.ok) {
                data = await response.json();
            } else {
                throw new Error(`Direct API failed: ${response.status}`);
            }
        } catch (directError) {
            console.warn('Direct Reddit API failed, trying alternative approach:', directError);

            // Second try: Use a different endpoint
            try {
                const altUrl = 'https://www.reddit.com/r/entrepreneur/new.json?limit=20&raw_json=1';

                response = await fetch(altUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'RedditBot/1.0',
                        'Accept-Language': 'en-US,en;q=0.9',
                    },
                });

                if (response.ok) {
                    data = await response.json();
                } else {
                    throw new Error(`Alternative API failed: ${response.status}`);
                }
            } catch (altError) {
                console.warn('Alternative Reddit API failed, returning empty results:', altError);

                // Return empty results instead of error
                return NextResponse.json({
                    data: {
                        children: []
                    }
                });
            }
        }

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
