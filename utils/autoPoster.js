const { EmbedBuilder } = require('discord.js');
const fetchMeme = require('./fetchMeme');
const memeSubreddits = require('../memesubreddits');
let autoPostInterval = null;
let nextPostTime = null;
let intervalSeconds = 3600; // default 1 hour
let channelIdRef = null;
let subredditsRef = memeSubreddits;
const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const roleToMention = '1415698065431461949';

// Image format checker
function isSupportedImage(url) {
  if (!url) return false;
  const urlWithoutParams = url.split('?')[0].toLowerCase();
  return validExtensions.some(ext => urlWithoutParams.endsWith(ext));
}

// Post meme with role mention and embed in the same message
async function postMeme(client, channelId) {
  const channel = client.channels.cache.get(channelId);
  if (!channel) return;
  const meme = await fetchMeme(subredditsRef);
  if (!meme || !meme.url) return;
  if (!isSupportedImage(meme.url)) {
    console.log('Skipped meme with unsupported format:', meme.url);
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(Math.floor(Math.random() * 16777215))
    .setImage(meme.url)
    .setFooter({ text: `r/${meme.subreddit}` });

  await channel.send({
    content: `<@&${roleToMention}>`,
    embeds: [embed],
  });

  nextPostTime = Date.now() + intervalSeconds * 1000;
}

function startAutoPoster(client, channelId, subreddits = memeSubreddits, interval = 3600) {
  if (!channelId) {
    console.log("No channel ID for auto poster!");
    return;
  }
  const channel = client.channels.cache.get(channelId);
  if (!channel) {
    console.log("Channel not found for auto poster!");
    return;
  }
  channelIdRef = channelId;
  subredditsRef = subreddits;
  intervalSeconds = interval;
  console.log(`AutoPoster started with interval of ${intervalSeconds} seconds`);
  if (autoPostInterval) clearInterval(autoPostInterval);
  postMeme(client, channelIdRef);
  autoPostInterval = setInterval(() => postMeme(client, channelIdRef), intervalSeconds * 1000);
  nextPostTime = Date.now() + intervalSeconds * 1000;
}

function stopAutoPoster() {
  if (autoPostInterval) {
    clearInterval(autoPostInterval);
    autoPostInterval = null;
  }
}

function updateInterval(client, intervalMs) {
  if (intervalMs < 10000) return false;
  intervalSeconds = Math.floor(intervalMs / 1000);
  if (!channelIdRef) return false;
  if (autoPostInterval) clearInterval(autoPostInterval);
  postMeme(client, channelIdRef);
  autoPostInterval = setInterval(() => postMeme(client, channelIdRef), intervalSeconds * 1000);
  nextPostTime = Date.now() + intervalSeconds * 1000;
  return true;
}

function getAutoPosterState() {
  return {
    interval: intervalSeconds,
    nextPostIn: nextPostTime ? Math.max(0, Math.floor((nextPostTime - Date.now()) / 1000)) : null,
    subreddits: subredditsRef,
  };
}

module.exports = {
  startAutoPoster,
  stopAutoPoster,
  updateInterval,
  getAutoPosterState,
};
