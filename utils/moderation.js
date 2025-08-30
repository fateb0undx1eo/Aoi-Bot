const fs = require("fs");
const path = require("path");

// Load badwords.json dynamically (so you can update it without touching code)
const badWordsPath = path.join(__dirname, "badwords.json");
let bannedWords = [];

// Load words safely
try {
  const data = fs.readFileSync(badWordsPath, "utf8");
  bannedWords = JSON.parse(data);
} catch (err) {
  console.error("❌ Failed to load badwords.json:", err);
  bannedWords = [];
}

// Escape regex special characters
function escapeRegex(word) {
  return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Check if message contains banned words
function checkMessageContent(content, userId, guild) {
  for (const word of bannedWords) {
    const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, "i"); // case-insensitive
    if (regex.test(content)) {
      console.log(`⚠️ User ${userId} in guild ${guild?.name} used banned word: ${word}`);
      return true;
    }
  }
  return false;
}

module.exports = { checkMessageContent };
