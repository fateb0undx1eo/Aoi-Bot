require('dotenv').config();
const express = require("express");
const app = express();

// Render needs an open port
const PORT = process.env.PORT || 8080;

// Health route
app.get("/", (req, res) => {
  res.send("Aoi Bot is alive! 🚀");
});

// Start web server first
app.listen(PORT, () => {
  console.log(`✅ Web server running on port ${PORT}`);
});

// Load Discord bot
require("./index.js");
