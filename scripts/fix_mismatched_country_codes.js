const fs = require('fs');
const path = require('path');

const CHANNELS_PATH = path.join(__dirname, '../src/data/channels.json');

const countryCodeMap = {
  "Argentina": "ar",
  "Australia": "au",
  "Austria": "at",
  "Azerbaijan": "az",
  "Bahrain": "bh",
  "Sweden": "se",
  "Philippines": "ph",
  "Pakistan": "pk",
  "Bangladesh": "bd",
  "Spain": "es",
  "Brazil": "br",
  "Canada": "ca",
  "Chile": "cl",
  "China": "cn",
  "Colombia": "co",
  "Croatia": "hr",
  "Czechia": "cz",
  "Egypt": "eg",
  "France": "fr",
  "Germany": "de",
  "Greece": "gr",
  "Hong Kong": "hk",
  "Hungary": "hu",
  "India": "in",
  "Indonesia": "id",
  "International Sports": "intl",
  "Italy": "it",
  "Japan": "jp",
  "Kuwait": "kw",
  "Macau": "mo",
  "Mexico": "mx",
  "Morocco": "ma",
  "Netherlands": "nl",
  "Nigeria": "ng",
  "North Macedonia": "mk",
  "Norway": "no",
  "Oman": "om",
  "Peru": "pe",
  "Poland": "pl",
  "Portugal": "pt",
  "Qatar": "qa",
  "Russia": "ru",
  "San Marino": "sm",
  "Saudi Arabia": "sa",
  "South Africa": "za",
  "South Korea": "kr",
  "Switzerland": "ch",
  "Thailand": "th",
  "Turkey": "tr",
  "Ukraine": "ua",
  "United Arab Emirates": "ae",
  "United Kingdom": "gb",
  "United States": "us",
  "Uruguay": "uy",
  "Venezuela": "ve",
  "Vietnam": "vn",
  "International": "intl",
  "Serbia": "rs"
};

function run() {
  const data = JSON.parse(fs.readFileSync(CHANNELS_PATH, 'utf-8'));
  let fixedCount = 0;

  for (const country of Object.keys(data)) {
    const correctCode = countryCodeMap[country];
    if (!correctCode) {
      console.warn(`No mapping found for country: ${country}`);
      continue;
    }

    for (const channel of data[country]) {
      if (channel.countryCode !== correctCode) {
        console.log(`[FIX] ${channel.name} (${country}): countryCode ${channel.countryCode} -> ${correctCode}`);
        channel.countryCode = correctCode;
        fixedCount++;
      }
    }
  }

  if (fixedCount > 0) {
    fs.writeFileSync(CHANNELS_PATH, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Successfully fixed ${fixedCount} countryCode mismatches!`);
  } else {
    console.log("No mismatches found. All country codes are correct!");
  }
}

run();
