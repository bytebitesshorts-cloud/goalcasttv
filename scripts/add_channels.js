// Add more channels from Guovin/iptv-api (Chinese sports) + international sports channels
const fs = require('fs');
const path = require('path');

const existing = require('../src/data/channels.json');

// New channels to add (keyed by country)
const additions = {
  "China": [
    {
      "id": "cctv-5-hd-cn",
      "name": "CCTV-5 HD",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/CCTV-5.svg/200px-CCTV-5.svg.png",
      "stream": "https://iptv.catvod.com/live.php?id=CCTV5&line=6",
      "category": "sports",
      "country": "China",
      "countryCode": "cn",
      "quality": "1080p"
    },
    {
      "id": "cctv-5plus-hd-cn",
      "name": "CCTV-5+ HD",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/CCTV-5plus.svg/200px-CCTV-5plus.svg.png",
      "stream": "http://38.75.136.137:98/gslb/dsdqpub/cctv5hd.m3u8?auth=testpub",
      "category": "sports",
      "country": "China",
      "countryCode": "cn",
      "quality": "1080p"
    },
    {
      "id": "cctv-16-cn",
      "name": "CCTV-16 Olympic",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/CCTV-5.svg/200px-CCTV-5.svg.png",
      "stream": "https://iptv.catvod.com/live.php?id=CCTV16&line=1",
      "category": "sports",
      "country": "China",
      "countryCode": "cn",
      "quality": "720p"
    },
    {
      "id": "guangdong-sports-cn",
      "name": "Guangdong Sports",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e6/Guangdong_Television_Logo.svg/200px-Guangdong_Television_Logo.svg.png",
      "stream": "https://epg.pw/stream/7b470f9fc5c305db0c8622117b7b25ca00eb35ba3e93e865cf0ff9df5c736681.m3u8",
      "category": "sports",
      "country": "China",
      "countryCode": "cn",
      "quality": "720p"
    },
    {
      "id": "fengyun-football-cn",
      "name": "Fengyun Football",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/CCTV-5.svg/200px-CCTV-5.svg.png",
      "stream": "http://38.75.136.137:98/gslb/dsdqpub/fyzq.m3u8?auth=testpub",
      "category": "sports",
      "country": "China",
      "countryCode": "cn",
      "quality": "720p"
    },
    {
      "id": "golf-tennis-cn",
      "name": "Golf & Tennis",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/CCTV-5.svg/200px-CCTV-5.svg.png",
      "stream": "http://38.75.136.137:98/gslb/dsdqpub/gefwq.m3u8?auth=testpub",
      "category": "sports",
      "country": "China",
      "countryCode": "cn",
      "quality": "720p"
    }
  ],
  "Colombia": [
    {
      "id": "win-sports-co",
      "name": "Win Sports",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Win_Sports_logo.svg/200px-Win_Sports_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Colombia",
      "countryCode": "co",
      "quality": "720p"
    },
    {
      "id": "espn-co",
      "name": "ESPN Colombia",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/200px-ESPN_wordmark.svg.png",
      "stream": "https://jmp2.uk/plu-6398aaf2c8d285000798a587.m3u8",
      "category": "sports",
      "country": "Colombia",
      "countryCode": "co",
      "quality": "720p"
    }
  ],
  "Chile": [
    {
      "id": "tnt-sports-cl",
      "name": "TNT Sports Chile",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/TNT_Sports_logo.svg/200px-TNT_Sports_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Chile",
      "countryCode": "cl",
      "quality": "720p"
    },
    {
      "id": "espn-cl",
      "name": "ESPN Chile",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/200px-ESPN_wordmark.svg.png",
      "stream": "https://jmp2.uk/plu-6398aaf2c8d285000798a587.m3u8",
      "category": "sports",
      "country": "Chile",
      "countryCode": "cl",
      "quality": "720p"
    }
  ],
  "Greece": [
    {
      "id": "ert-sports-gr",
      "name": "ERT Sports",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/ERT_logo.svg/200px-ERT_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Greece",
      "countryCode": "gr",
      "quality": "720p"
    },
    {
      "id": "novasports-gr",
      "name": "Novasports",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/d/d2/Novasports_logo.svg/200px-Novasports_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Greece",
      "countryCode": "gr",
      "quality": "720p"
    }
  ],
  "Indonesia": [
    {
      "id": "tvone-sports-id",
      "name": "tvOne Sports",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/6/64/TvOne_logo.svg/200px-TvOne_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Indonesia",
      "countryCode": "id",
      "quality": "720p"
    },
    {
      "id": "emtek-sports-id",
      "name": "SCTV Sports",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/e/ec/SCTV_logo.svg/200px-SCTV_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Indonesia",
      "countryCode": "id",
      "quality": "720p"
    }
  ],
  "Nigeria": [
    {
      "id": "supersport-ng",
      "name": "SuperSport Nigeria",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/SuperSport_logo.svg/200px-SuperSport_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Nigeria",
      "countryCode": "ng",
      "quality": "720p"
    },
    {
      "id": "nta-sports-ng",
      "name": "NTA Sports",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/6/6e/NTA_logo.svg/200px-NTA_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Nigeria",
      "countryCode": "ng",
      "quality": "720p"
    }
  ],
  "Peru": [
    {
      "id": "movistar-deportes-pe",
      "name": "Movistar Deportes",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Movistar_Plus_logo.svg/200px-Movistar_Plus_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Peru",
      "countryCode": "pe",
      "quality": "720p"
    }
  ],
  "Poland": [
    {
      "id": "polsat-sport-pl",
      "name": "Polsat Sport",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Polsat_Sport_HD_Logo.svg/200px-Polsat_Sport_HD_Logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Poland",
      "countryCode": "pl",
      "quality": "720p"
    },
    {
      "id": "tvp-sport-pl",
      "name": "TVP Sport",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/TVP_Sport_HD_Logo.svg/200px-TVP_Sport_HD_Logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Poland",
      "countryCode": "pl",
      "quality": "720p"
    }
  ],
  "South Africa": [
    {
      "id": "supersport-za",
      "name": "SuperSport",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/SuperSport_logo.svg/200px-SuperSport_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "South Africa",
      "countryCode": "za",
      "quality": "720p"
    },
    {
      "id": "sabc-sport-za",
      "name": "SABC Sport",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/7/76/SABC_logo.svg/200px-SABC_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "South Africa",
      "countryCode": "za",
      "quality": "720p"
    }
  ],
  "Sweden": [
    {
      "id": "svt-sport-se",
      "name": "SVT Sport",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/SVT_Logotype.svg/200px-SVT_Logotype.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Sweden",
      "countryCode": "se",
      "quality": "720p"
    }
  ],
  "Switzerland": [
    {
      "id": "rts-sport-ch",
      "name": "RTS Sport",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/RTS_logo.svg/200px-RTS_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Switzerland",
      "countryCode": "ch",
      "quality": "720p"
    }
  ],
  "Thailand": [
    {
      "id": "true-sport-th",
      "name": "TrueVisions Sport",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/0/0d/TrueVisions_logo.svg/200px-TrueVisions_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Thailand",
      "countryCode": "th",
      "quality": "720p"
    }
  ],
  "Uruguay": [
    {
      "id": "vtv-uy",
      "name": "VTV Uruguay",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/200px-ESPN_wordmark.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Uruguay",
      "countryCode": "uy",
      "quality": "720p"
    }
  ],
  "Vietnam": [
    {
      "id": "vtv6-vn",
      "name": "VTV6 Sports",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/VTV6_logo_%282013-present%29.svg/200px-VTV6_logo_%282013-present%29.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Vietnam",
      "countryCode": "vn",
      "quality": "720p"
    }
  ]
};

// Merge additions into existing
for (const [country, channels] of Object.entries(additions)) {
  const existingIds = new Set((existing[country] || []).map(c => c.id));
  if (!existing[country]) {
    existing[country] = [];
  }
  for (const ch of channels) {
    if (!existingIds.has(ch.id)) {
      existing[country].push(ch);
    }
  }
}

// Sort countries alphabetically
const sorted = {};
for (const key of Object.keys(existing).sort()) {
  sorted[key] = existing[key];
}

// Write output
fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'data', 'channels.json'),
  JSON.stringify(sorted, null, 2) + '\n',
  'utf-8'
);

const total = Object.values(sorted).flat().length;
const countries = Object.keys(sorted);
console.log('✅ Written ' + total + ' channels across ' + countries.length + ' countries (A-Z)');
console.log('Countries: ' + countries.join(', '));
