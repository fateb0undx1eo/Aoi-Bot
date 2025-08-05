// server.js - Keep-alive web server
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Aoi Senpai Bot is running! 🚀');
});

function keepAlive() {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`🌐 Keep-alive server running on port ${PORT}`);
    });
}

module.exports = keepAlive;
