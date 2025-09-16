const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const configFile = path.resolve(__dirname, '../../guildConfig.json');

let configs = {};

// Role to mention when posting quotes
const roleMentionId = '1415698401621970995';

const schedulers = {};
const nextPostTimes = {};

// Load configs from file
function loadConfigs() {
  try {
    if (fs.existsSync(configFile)) {
      configs = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      console.log(`[QuoteManager] Loaded configs for ${Object.keys(configs).length} guilds`);
    } else {
      configs = {};
    }
  } catch (e) {
    console.error('[QuoteManager] Error loading config file:', e);
    configs = {};
  }
}

// Save configs back to file
function saveConfigs() {
  try {
    fs.writeFileSync(configFile, JSON.stringify(configs, null, 2));
    console.log('[QuoteManager] Config saved.');
  } catch (e) {
    console.error('[QuoteManager] Error saving config file:', e);
  }
}

// Quote API list for fallback, randomly chosen each time
const quoteFetchers = [
  async () => {
    const res = await fetch('https://animechan.vercel.app/api/random');
    if (!res.ok) throw new Error('Animechan API failed');
    const json = await res.json();
    return `"${json.quote}" — ${json.character} (${json.anime})`;
  },
  async () => {
    const res = await fetch('https://zenquotes.io/api/random');
    if (!res.ok) throw new Error('ZenQuotes API failed');
    const [json] = await res.json();
    return `"${json.q}" — ${json.a}`;
  },
];

// Attempts quote fetching with fallback logic
async function getRandomQuote() {
  const shuffled = quoteFetchers.sort(() => Math.random() - 0.5);
  for (const fetchQuote of shuffled) {
    try {
      const quote = await fetchQuote();
      if (quote) return quote;
    } catch (_) {
      // continue to next API
    }
  }
  return 'Sorry, failed to fetch a quote right now.';
}

// Internal recursive scheduling method
function schedulePost(client, guildId) {
  clearTimeout(schedulers[guildId]);

  const guildConfig = configs[guildId];
  if (!guildConfig || !guildConfig.quoteChannelId || !guildConfig.quoteIntervalHours) {
    console.log(`[QuoteManager] No valid config for guild ${guildId}, scheduler stopped.`);
    return;
  }

  const intervalMs = guildConfig.quoteIntervalHours * 3600000;

  async function postThenSchedule() {
    try {
      await postQuote(client, guildId);
      nextPostTimes[guildId] = Date.now() + intervalMs;
      console.log(`[QuoteManager] Quote posted for guild ${guildId}. Next in ${guildConfig.quoteIntervalHours} hrs.`);
    } catch (e) {
      console.error(`[QuoteManager] Error posting quote for guild ${guildId}:`, e);
      nextPostTimes[guildId] = Date.now() + intervalMs;
    }
    schedulers[guildId] = setTimeout(postThenSchedule, intervalMs);
  }

  postThenSchedule();
}

// Public method to start scheduler
function startScheduler(client, guildId) {
  schedulePost(client, guildId);
}

// Posts the quote message in guild's channel with role mention
async function postQuote(client, guildId) {
  const guildConfig = configs[guildId];
  if (!guildConfig) return;

  let chan;
  try {
    chan = await client.channels.fetch(guildConfig.quoteChannelId);
  } catch {
    console.warn(`[QuoteManager] Failed to fetch channel for guild ${guildId}`);
    return;
  }
  if (!chan || !chan.isTextBased()) return;

  const quote = await getRandomQuote();

  await chan.send(`<@&${roleMentionId}>\n${quote}`);
}

// Get seconds until next post or null if unknown
function getNextPostIn(guildId) {
  const next = nextPostTimes[guildId];
  if (!next) return null;
  const diffMs = next - Date.now();
  return diffMs > 0 ? Math.floor(diffMs / 1000) : 0;
}

// Set quote channel config then start scheduler
async function setQuoteChannel(interaction) {
  if (!interaction.member.permissions.has('ManageGuild')) {
    return interaction.reply({ content: 'Manage Server permission required.', ephemeral: true });
  }
  const channel = interaction.options.getChannel('channel');
  const guildId = interaction.guildId;
  if (!configs[guildId]) configs[guildId] = {};
  configs[guildId].quoteChannelId = channel.id;
  saveConfigs();
  startScheduler(interaction.client, guildId);
  await interaction.reply(`Quote channel set to ${channel.name}`);
}

// Set quote interval config then start scheduler
async function setQuoteInterval(interaction) {
  if (!interaction.member.permissions.has('ManageGuild')) {
    return interaction.reply({ content: 'Manage Server permission required.', ephemeral: true });
  }
  const hours = interaction.options.getInteger('hours');
  if (hours < 1) return interaction.reply({ content: 'Interval must be at least 1 hour.', ephemeral: true });
  const guildId = interaction.guildId;
  if (!configs[guildId]) configs[guildId] = {};
  configs[guildId].quoteIntervalHours = hours;
  saveConfigs();
  startScheduler(interaction.client, guildId);
  await interaction.reply(`Quote interval set to every ${hours} hour(s).`);
}

// Send a quote immediately (for commands)
async function sendQuote(interactionOrMessage) {
  const quote = await getRandomQuote();
  if (interactionOrMessage.reply) {
    await interactionOrMessage.reply(quote);
  } else if (interactionOrMessage.channel) {
    await interactionOrMessage.channel.send(quote);
  }
}

module.exports = {
  configs,
  loadConfigs,
  saveConfigs,
  startScheduler,
  getNextPostIn,
  setQuoteChannel,
  setQuoteInterval,
  sendQuote,
};
