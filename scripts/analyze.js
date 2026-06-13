const d = require('../src/data/channels.json');

console.log('=== COUNTRY ORDER ===');
console.log(Object.keys(d).join(', '));

console.log('\n=== CHANNELS WITH GENERIC/PLACEHOLDER LOGOS ===');
for (const [country, channels] of Object.entries(d)) {
  for (const ch of channels) {
    if (ch.logo.includes('Olympics_symbol')) {
      console.log('  [GENERIC] ' + ch.name + ' (' + country + ')');
    }
  }
}

console.log('\n=== COUNTRY FIELD MISMATCHES ===');
for (const [country, channels] of Object.entries(d)) {
  for (const ch of channels) {
    if (ch.country !== country) {
      console.log('  ' + ch.name + ': country="' + ch.country + '" but under "' + country + '"');
    }
  }
}

console.log('\n=== TOTAL CHANNELS PER COUNTRY ===');
for (const [country, channels] of Object.entries(d)) {
  console.log('  ' + country + ': ' + channels.length);
}

console.log('\n=== TOTAL ===');
console.log(Object.values(d).flat().length + ' channels');
