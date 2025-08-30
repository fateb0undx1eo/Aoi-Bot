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

// Pick all supported languages from naughty-words
const languages = [
  "ar", "zh", "cs", "da", "nl", "en", "eo", "fil", "fi",
  "fr", "fr-CA-u-sd-caqc", "de", "hi", "hu", "it", "ja",
  "kab", "tlh", "ko", "no", "fa", "pl", "pt", "ru",
  "es", "sv", "th", "tr"
];

// Merge all languages + custom words into one big list
let bannedWords = [];
for (const lang of languages) {
  if (naughtyWords[lang]) {
    bannedWords = bannedWords.concat(naughtyWords[lang]);
  }
}
bannedWords = bannedWords.concat(customWords);

// Escape regex special characters
function escapeRegex(word) {
  return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Check function
function checkMessageContent(content, userId, guild) {
  for (const word of bannedWords) {
    const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, "i");
    if (regex.test(content)) {
      console.log(`⚠️ User ${userId} in guild ${guild?.name} used banned word: ${word}`);
      return { flagged: true, matchedWord: word };
    }
  }
  return { flagged: false, matchedWord: null };
}

module.exports = { checkMessageContent };
