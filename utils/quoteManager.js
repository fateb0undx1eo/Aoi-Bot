const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const configPath = path.resolve(__dirname, '../../guildConfig.json');

let guildConfigs = {};

function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      guildConfigs = JSON.parse(data);
    } else {
      guildConfigs = {};
    }
  } catch (err) {
    console.error('Failed to load guildConfig.json:', err);
    guildConfigs = {};
  }
}

function saveConfig() {
  try {
    fs.writeFileSync(configPath, JSON.stringify(guildConfigs, null, 2));
  } catch (err) {
    console.error('Failed to save guildConfig.json:', err);
  }
}

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

const timers = {};
const nextQuotePostTimes = {};

function startScheduler(client, guildId) {
  if (timers[guildId]) clearInterval(timers[guildId]);

  const config = guildConfigs[guildId];
  if (!config || !config.quoteChannelId || !config.quoteIntervalHours) return;

  const intervalMs = config.quoteIntervalHours * 60 * 60 * 1000;
  nextQuotePostTimes[guildId] = Date.now();

  postQuote(client, guildId);

  timers[guildId] = setInterval(() => {
    postQuote(client, guildId);
    nextQuotePostTimes[guildId] = Date.now() + intervalMs;
  }, intervalMs);
}

async function postQuote(client, guildId) {
  try {
    const config = guildConfigs[guildId];
    if (!config || !config.quoteChannelId) return;
    const channel = await client.channels.fetch(config.quoteChannelId).catch(() => null);
    if (!channel) return;
    const quote = await fetchRandomQuote();
    await channel.send(quote);
  } catch (err) {
    console.error('Failed to post quote:', err);
  }
}

function getNextQuoteIn(guildId) {
  if (!nextQuotePostTimes[guildId]) return null;
  const diffMs = nextQuotePostTimes[guildId] - Date.now();
  return diffMs > 0 ? Math.floor(diffMs / 1000) : 0;
}

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
