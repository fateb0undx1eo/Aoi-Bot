const fetch = require('node-fetch');

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const REDDIT_USER_AGENT = process.env.REDDIT_USER_AGENT;

// Helper to fetch OAuth token
async function getRedditToken() {
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
            Authorization: 'Basic ' + Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': REDDIT_USER_AGENT,
        },
        body: 'grant_type=client_credentials',
    });

    const data = await response.json();

    if (!data.access_token) {
        console.error('Reddit OAuth error:', data);
        return null;
    }

    return data.access_token;
}

// Main meme fetcher
async function fetchMeme(subreddits = ['dankmemes', 'funny', 'memes']) {
    const token = await getRedditToken();
    if (!token) return null;

    const subreddit = subreddits[Math.floor(Math.random() * subreddits.length)];

    const res = await fetch(`https://oauth.reddit.com/r/${subreddit}/hot?limit=50`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'User-Agent': REDDIT_USER_AGENT,
        },
    });

    const data = await res.json();
    if (!data || !data.data || !data.data.children) {
        console.error('Reddit API error:', data);
        return null;
    }

    const posts = data.data.children
        .map(post => post.data)
        .filter(p => !p.over_18 && (p.post_hint === 'image' || p.is_video || p.url?.endsWith('.gif')));

    if (!posts.length) return null;

    const chosen = posts[Math.floor(Math.random() * posts.length)];

    return {
        url: chosen.url,
        postLink: `https://reddit.com${chosen.permalink}`,
        subreddit: chosen.subreddit,
    };
}

module.exports = fetchMeme;
