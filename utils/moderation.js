const fs = require("fs");
const path = require("path");
const naughtyWords = require("naughty-words");

// Load custom bad words from badwords.json
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
// Deduplicate and lowercase
bannedWords = [...new Set(bannedWords.map(w => w.toLowerCase()))];
console.log(`Total banned words loaded: ${bannedWords.length}`);

// --- Text Normalization Helpers ---

// Remove accents & diacritics (e.g. fųçķ → fuck)
function normalizeText(text) {
  return text
    .normalize("NFD")             // split accents
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // remove zero-width chars
    .toLowerCase();
}

// Strip Zalgo (excessive combining marks)
function stripZalgo(text) {
  return text.replace(/[\u0300-\u036F\u0489]+/g, "");
}

// Escape regex special chars inside the word
function escapeRegex(word) {
  return word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Build regex (handle single vs multi-word phrases)
function buildRegex(word) {
  if (word.includes(" ")) {
    // Phrase match - match as substring, case insensitive
    return new RegExp(escapeRegex(word), "i");
  } else {
    // Single word - match whole words only using word boundaries
    return new RegExp(`\\b${escapeRegex(word)}\\b`, "i");
  }
}

// --- Main Check Function ---
function checkMessageContent(content, userId, guild) {
  if (!guild) return { flagged: false, matchedWord: null };
  
  // Normalize and strip Zalgo before matching
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
