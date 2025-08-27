const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const configPath = path.resolve(__dirname, '../../guildConfig.json');

let guildConfigs = {};

// Load config from file
function loadConfig() {
  try {
    const data = fs.readFileSync(configPath, 'utf8');
    guildConfigs = JSON.parse(data);
  } catch {
    guildConfigs = {};
  }
}

// Save config to file
function saveConfig() {
  fs.writeFileSync(configPath, JSON.stringify(guildConfigs, null, 2));
}

// Anime quote APIs with fallback
const quoteAPIs = [
  async () => {
    const res = await fetch('https://animechan.vercel.app/api/random');
    if (!res.ok) throw new Error('Animechan API error');
    const data = await res.json();
    return `"${data.quote}" — ${data.character} (${data.anime})`;
  },
  async () => {
    const res = await fetch('https://zenquotes.io/api/random');
    if (!res.ok) throw new Error('ZenQuotes API error');
    const [data] = await res.json();
    return `"${data.q}" — ${data.a}`;
  },
];

// Fetch random quote with fallback
async function fetchRandomQuote() {
  const shuffled = quoteAPIs.sort(() => Math.random() - 0.5);
  for (const apiFunc of shuffled) {
    try {
      const quote = await apiFunc();
      if (quote) return quote;
    } catch {}
  }
  return 'Sorry, could not fetch a quote at this time.';
}

// Manage timers per guild
const timers = {};

// Start scheduler for a guild
function startScheduler(client, guildId) {
  if (timers[guildId]) clearInterval(timers[guildId]);

  const config = guildConfigs[guildId];
  if (!config || !config.quoteChannelId || !config.quoteIntervalHours) return;

  const intervalMs = config.quoteIntervalHours * 60 * 60 * 1000;

  // Initial immediate post
  postQuote(client, guildId);

  // Schedule repeated posting
  timers[guildId] = setInterval(() => postQuote(client, guildId), intervalMs);
}

// Post quote to configured channel
async function postQuote(client, guildId) {
  try {
    const config = guildConfigs[guildId];
    if (!config || !config.quoteChannelId) return;
    const channel = client.channels.cache.get(config.quoteChannelId);
    if (!channel) return;

    const quote = await fetchRandomQuote();
    await channel.send(quote);
  } catch (err) {
    console.error('Failed to post quote:', err);
  }
}

// Admin command handlers
async function setQuoteChannel(interaction) {
  if (!interaction.member.permissions.has('MANAGE_GUILD')) {
    return interaction.reply({ content: 'You need Manage Server permission.', ephemeral: true });
  }
  const channel = interaction.options.getChannel('channel');
  const guildId = interaction.guildId;
  if (!guildConfigs[guildId]) guildConfigs[guildId] = {};
  guildConfigs[guildId].quoteChannelId = channel.id;
  saveConfig();
  startScheduler(interaction.client, guildId);
  await interaction.reply(`Quote channel set to ${channel.name}`);
}

async function setQuoteInterval(interaction) {
  if (!interaction.member.permissions.has('MANAGE_GUILD')) {
    return interaction.reply({ content: 'You need Manage Server permission.', ephemeral: true });
  }
  const hours = interaction.options.getInteger('hours');
  if (hours < 1) return interaction.reply({ content: 'Interval must be at least 1 hour.', ephemeral: true });

  const guildId = interaction.guildId;
  if (!guildConfigs[guildId]) guildConfigs[guildId] = {};
  guildConfigs[guildId].quoteIntervalHours = hours;
  saveConfig();
  startScheduler(interaction.client, guildId);
  await interaction.reply(`Quote interval set to every ${hours} hour(s)`);
}

// Command to get a quote immediately
async function sendQuote(interaction) {
  const quote = await fetchRandomQuote();
  await interaction.reply(quote);
}

module.exports = {
  loadConfig,
  startScheduler,
  setQuoteChannel,
  setQuoteInterval,
  sendQuote,
};
