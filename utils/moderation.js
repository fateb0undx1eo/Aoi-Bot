const fs = require("fs");
const path = require("path");
const naughtyWords = require("naughty-words");

// Load custom bad words from badwords.json in the same folder
const badWordsPath = path.join(__dirname, "badwords.json");
let customWords = [];
try {
  customWords = JSON.parse(fs.readFileSync(badWordsPath, "utf8"));
  console.log(`✅ Loaded ${customWords.length} custom bad words from badwords.json`);
} catch (err) {
  console.error("⚠️ Could not load badwords.json:", err);
}

// Languages to load from naughty-words
const languages = [
  "ar", "zh", "cs", "da", "nl", "en", "eo", "fil", "fi",
  "fr", "fr-CA-u-sd-caqc", "de", "hi", "hu", "it", "ja",
  "kab", "tlh", "ko", "no", "fa", "pl", "pt", "ru",
  "es", "sv", "th", "tr"
];

// Merge naughty-words + custom words
let bannedWords = [];
for (const lang of languages) {
  if (naughtyWords[lang]) {
    bannedWords = bannedWords.concat(naughtyWords[lang]);
  }
}
bannedWords = bannedWords.concat(customWords);

// Deduplicate and lowercase all banned words
bannedWords = [...new Set(bannedWords.map(w => w.toLowerCase()))];
console.log(`Total banned words loaded: ${bannedWords.length}`);

// --- Helpers ---

function normalizeText(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .toLowerCase();
}

function stripZalgo(text) {
  return text.replace(/[\u0300-\u036F\u0489]+/g, "");
}

function escapeRegex(word) {
  return word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildRegex(word) {
  if (word.includes(" ")) {
    return new RegExp(escapeRegex(word), "i");
  } else {
    return new RegExp(`\\b${escapeRegex(word)}\\b`, "i");
  }
}

// --- Main check function ---

function checkMessageContent(content, userId, guild) {
  if (!guild) return { flagged: false, matchedWord: null };
  const cleanContent = normalizeText(stripZalgo(content));
  for (const word of bannedWords) {
    const regex = buildRegex(word);
    if (regex.test(cleanContent)) {
      console.log(`⚠️ User ${userId} in guild ${guild.name} used banned word: ${word}`);
      return { flagged: true, matchedWord: word };
    }
  }
  return { flagged: false, matchedWord: null };
}

module.exports = { checkMessageContent };
