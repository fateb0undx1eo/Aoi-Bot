const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const configPath = path.resolve(__dirname, '../../guildConfig.json');
let guildConfigs = {};

// Role to mention for quote posts
const roleToMention = '1415698401621970995';
// In-memory scheduler timers and next post timestamps
const timers = {};
const nextQuotePostTimes = {};

// --- Load configs from file ---
function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      guildConfigs = JSON.parse(data);
      console.log(`[QuoteManager] Loaded guildConfigs for ${Object.keys(guildConfigs).length} guilds.`);
    } else {
      guildConfigs = {};
    }
  } catch (err) {
    console.error('[QuoteManager] Failed to load guildConfig.json:', err);
    guildConfigs = {};
  }
}

// --- Save configs to file ---
function saveConfig() {
  try {
    fs.writeFileSync(configPath, JSON.stringify(guildConfigs, null, 2));
    console.log('[QuoteManager] guildConfig.json saved.');
  } catch (err) {
    console.error('[QuoteManager] Failed to save guildConfig.json:', err);
  }
}

// --- Quote APIs for fallback and random selection ---
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

// --- Fetch a random quote trying APIs in random order ---
async function fetchRandomQuote() {
  const shuffled = quoteAPIs.sort(() => Math.random() - 0.5);
  for (const apiFunc of shuffled) {
    try {
      const quote = await apiFunc();
      if (quote) return quote;
    } catch (err) {
      console.warn('[QuoteManager] API fetch error:', err.message);
    }
  }
  return 'Sorry, could not fetch a quote at this time.';
}

// --- Start or restart scheduler for a guild ---
function startScheduler(client, guildId) {
  if (timers[guildId]) {
    clearTimeout(timers[guildId]);
    delete timers[guildId];
  }

  const config = guildConfigs[guildId];
  if (!config || !config.quoteChannelId || !config.quoteIntervalHours) {
    console.log(`[QuoteManager] Scheduler not started for guild ${guildId}: Missing config.`);
    return;
  }

  const intervalMs = config.quoteIntervalHours * 60 * 60 * 1000;

  async function postAndSchedule() {
    try {
      console.log(`[QuoteManager] Posting quote for guild ${guildId}...`);
      await postQuote(client, guildId);
      nextQuotePostTimes[guildId] = Date.now() + intervalMs;
      console.log(`[QuoteManager] Next quote for guild ${guildId} in ${config.quoteIntervalHours} hour(s).`);
    } catch (error) {
      console.error(`[QuoteManager] Error posting quote for guild ${guildId}:`, error);
      // Set next post even on error to avoid spamming
      nextQuotePostTimes[guildId] = Date.now() + intervalMs;
    }
    timers[guildId] = setTimeout(postAndSchedule, intervalMs);
  }

  // Start immediate post & schedule chain
  postAndSchedule();
}

// --- Post the quote with role mention in same message ---
async function postQuote(client, guildId) {
  const config = guildConfigs[guildId];
  if (!config || !config.quoteChannelId) {
    console.warn(`[QuoteManager] No quoteChannelId for guild ${guildId}, skipping post.`);
    return;
  }
  const channel = await client.channels.fetch(config.quoteChannelId).catch(() => null);
  if (!channel) {
    console.warn(`[QuoteManager] Cannot fetch channel ID ${config.quoteChannelId} in guild ${guildId}.`);
    return;
  }
  const quote = await fetchRandomQuote();
  await channel.send(`<@&${roleToMention}>\n${quote}`);
}

// --- Return seconds until next post or null ---
function getNextQuoteIn(guildId) {
  const nextTime = nextQuotePostTimes[guildId];
  if (!nextTime) return null;
  const diffMs = nextTime - Date.now();
  return diffMs > 0 ? Math.floor(diffMs / 1000) : 0;
}

// --- Interaction command handlers ---
async function setQuoteChannel(interaction) {
  if (!interaction.member.permissions.has('ManageGuild')) {
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
  if (!interaction.member.permissions.has('ManageGuild')) {
    return interaction.reply({ content: 'You need Manage Server permission.', ephemeral: true });
  }
  const hours = interaction.options.getInteger('hours');
  if (hours < 1) {
    return interaction.reply({ content: 'Interval must be at least 1 hour.', ephemeral: true });
  }
  const guildId = interaction.guildId;
  if (!guildConfigs[guildId]) guildConfigs[guildId] = {};
  guildConfigs[guildId].quoteIntervalHours = hours;
  saveConfig();
  startScheduler(interaction.client, guildId);
  await interaction.reply(`Quote interval set to every ${hours} hour(s).`);
}

async function sendQuote(interactionOrMessage) {
  const quote = await fetchRandomQuote();
  if (interactionOrMessage.reply) {
    await interactionOrMessage.reply(quote);
  } else if (interactionOrMessage.channel) {
    await interactionOrMessage.channel.send(quote);
  }
}

// Export functions & config for your bot
module.exports = {
  guildConfigs,
  loadConfig,
  saveConfig,
  startScheduler,
  getNextQuoteIn,
  setQuoteChannel,
  setQuoteInterval,
  sendQuote,
};
