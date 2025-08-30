const fs = require("fs");
const path = require("path");
const naughtyWords = require("naughty-words");

// Load custom bad words from badwords.json
const badWordsPath = path.join(__dirname, "badwords.json");
let customWords = [];
try {
  customWords = JSON.parse(fs.readFileSync(badWordsPath, "utf8"));
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

// Deduplicate
bannedWords = [...new Set(bannedWords.map(w => w.toLowerCase()))];

// --- Text Normalization Helpers ---

// Remove accents & diacritics (so fųçķ → fuck)
function normalizeText(text) {
  return text
    .normalize("NFD") // split accents
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // remove zero-width chars
    .replace(/[^a-zA-Z0-9\s]/g, c => c) // keep symbols but remove zalgo noise
    .toLowerCase();
}

// Strip Zalgo (excessive combining marks)
function stripZalgo(text) {
  return text.replace(/[\u0300-\u036F\u0489]+/g, "");
}

// Escape regex special chars
function escapeRegex(word) {
  return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Build regex (handle single vs multi-word phrases)
function buildRegex(word) {
  if (word.includes(" ")) {
    return new RegExp(escapeRegex(word), "i"); // phrase match
  } else {
    return new RegExp(`\\b${escapeRegex(word)}\\b`, "i"); // word boundary
  }
}

// --- Main Check Function ---
function checkMessageContent(content, userId, guild) {
  // Normalize text for matching
  const cleanContent = normalizeText(stripZalgo(content));

  for (const word of bannedWords) {
    const regex = buildRegex(word);
    if (regex.test(cleanContent)) {
      console.log(`⚠️ User ${userId} in guild ${guild?.name} used banned word: ${word}`);
      return { flagged: true, matchedWord: word };
    }
  }
  return { flagged: false, matchedWord: null };
}

module.exports = { checkMessageContent };
