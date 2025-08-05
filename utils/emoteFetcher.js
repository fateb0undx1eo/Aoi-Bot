const axios = require("axios");
const { Client: NekosBestClient } = require("nekos-best.js");
const { NekosAPI } = require("nekosapi");

const nekosBest = new NekosBestClient(); // ✅ Official wrapper
const nekosapi = new NekosAPI();         // ✅ Last fallback

const API_TIMEOUT = 5000;

// 1️⃣ Main API order (try first to last)
const APIS = {
    nekosbest: async (action) => {
        const data = await nekosBest.fetch(action, 1); 
        return data.results[0].url;
    },
    waifupics: async (action) => {
        const { data } = await axios.get(
            `https://api.waifu.pics/sfw/${action}`,
            { timeout: API_TIMEOUT }
        );
        return data.url;
    },
    waifuim: async (action) => {
        const { data } = await axios.get(
            `https://api.waifu.im/search/?included_tags=${action}`,
            { timeout: API_TIMEOUT }
        );
        return data.images[0].url;
    },
    nekosapi: async (action) => {
        const img = await nekosapi.get(action);
        return img.url || img.results?.[0]?.url;
    }
};

// 5️⃣ Final hardcoded fallback GIFs
const FALLBACK_GIFS = {
    hug: [
        "https://media.tenor.com/3n01nOqK9MkAAAAC/anime-hug.gif",
        "https://media.tenor.com/xGvzBnWbMG0AAAAC/anime-hug.gif",
        "https://media.tenor.com/VZlHzPp3pUMAAAAC/hug-anime.gif"
    ],
    slap: [
        "https://media.tenor.com/-G9z8w8Q3-wAAAAC/anime-slap.gif",
        "https://media.tenor.com/UsFANZ7iVd0AAAAC/slap-anime.gif"
    ],
    pat: [
        "https://media.tenor.com/1bYYC8m9R3YAAAAC/anime-head-pat.gif",
        "https://media.tenor.com/3FpMqJb2gFQAAAAC/pat-anime.gif"
    ],
    default: [
        "https://media.tenor.com/_4YgA77ExHEAAAAC/cute-anime.gif"
    ]
};

/**
 * Fetch emote GIF with API failover
 * @param {string} action e.g. 'hug', 'slap', 'pat'
 * @returns {Promise<string>} GIF URL
 */
async function fetchEmote(action) {
    for (const api of Object.values(APIS)) {
        try {
            return await api(action);
        } catch (err) {
            console.warn(`[EmoteFetcher] API failed for ${action}: ${err.message}`);
            continue;
        }
    }

    // All APIs failed → fallback
    const fallbackList = FALLBACK_GIFS[action] || FALLBACK_GIFS.default;
    return fallbackList[Math.floor(Math.random() * fallbackList.length)];
}

module.exports = { fetchEmote };
