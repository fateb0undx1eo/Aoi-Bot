const { EmbedBuilder } = require('discord.js');
const fetchMeme = require('./fetchMeme');

let autoPostInterval = null;
let nextPostTime = null;
let intervalSeconds = 900; // default 15 minutes
let subredditsRef = [];

async function postMeme(client, channelId) {
    const channel = client.channels.cache.get(channelId);
    if (!channel) return;

    const meme = await fetchMeme(subredditsRef);
    if (!meme || !meme.url) return;

    const embed = new EmbedBuilder()
        .setColor(Math.floor(Math.random() * 16777215)) // random color
        .setImage(meme.url)
        .setFooter({ text: `r/${meme.subreddit}` }); // Only subreddit in footer

    await channel.send({ embeds: [embed] });

    nextPostTime = Date.now() + intervalSeconds * 1000;
}

function startAutoPoster(client, channelId, subreddits, interval = 900) {
    if (!channelId) {
        console.log("No channel ID for auto poster!");
        return;
    }

    const channel = client.channels.cache.get(channelId);
    if (!channel) {
        console.log("Channel not found for auto poster!");
        return;
    }

    subredditsRef = subreddits;
    intervalSeconds = interval;

    console.log(`AutoPoster started with ${intervalSeconds}s interval`);

    if (autoPostInterval) clearInterval(autoPostInterval);

    // First immediate post
    postMeme(client, channelId);

    // Repeat posting
    autoPostInterval = setInterval(() => postMeme(client, channelId), intervalSeconds * 1000);
    nextPostTime = Date.now() + intervalSeconds * 1000;
}

function stopAutoPoster() {
    if (autoPostInterval) {
        clearInterval(autoPostInterval);
        autoPostInterval = null;
    }
}

function setIntervalSeconds(seconds) {
    intervalSeconds = seconds;
    return intervalSeconds;
}

function getAutoPosterState() {
    return {
        interval: intervalSeconds,
        nextPostIn: nextPostTime ? Math.max(0, Math.floor((nextPostTime - Date.now()) / 1000)) : null,
        subreddits: subredditsRef
    };
}

module.exports = {
    startAutoPoster,
    stopAutoPoster,
    setIntervalSeconds,
    getAutoPosterState
};
