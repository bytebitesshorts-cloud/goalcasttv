const fs = require('fs');
const path = require('path');

const channelsPath = path.join(__dirname, '..', 'src', 'data', 'channels.json');

// Load channels JSON
let rawData = fs.readFileSync(channelsPath, 'utf-8');
let channels = JSON.parse(rawData);

// Helper to determine if a channel should be kept
function keepChannel(channel) {
    // Keep if category is sports
    if (channel.category && channel.category.toLowerCase() === 'sports') return true;
    // Keep if name contains "FIFA 2026"
    if (channel.name && channel.name.toUpperCase().includes('FIFA 2026')) return true;
    return false;
}

// Filter each country's channel list
let filtered = {};
for (const country in channels) {
    if (Array.isArray(channels[country])) {
        const kept = channels[country].filter(keepChannel);
        if (kept.length > 0) {
            filtered[country] = kept;
        }
    }
}

// Write filtered data back to channels.json
fs.writeFileSync(channelsPath, JSON.stringify(filtered, null, 2), 'utf-8');
console.log('Channels filtered and written to', channelsPath);
