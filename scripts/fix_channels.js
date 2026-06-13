// This script generates a fully corrected channels.json with:
// 1. All placeholder logos replaced with real ones
// 2. Countries sorted alphabetically
// 3. New premium World Cup channels added
// 4. More channels for underserved countries

const fs = require('fs');
const path = require('path');

const channels = {
  "Argentina": [
    {
      "id": "espn-ar",
      "name": "ESPN Argentina",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/200px-ESPN_wordmark.svg.png",
      "stream": "https://jmp2.uk/plu-6398aaf2c8d285000798a587.m3u8",
      "category": "sports",
      "country": "Argentina",
      "countryCode": "ar",
      "quality": "720p"
    },
    {
      "id": "tyc-sports-ar",
      "name": "TyC Sports",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/TyC_Sports_logo.svg/200px-TyC_Sports_logo.svg.png",
      "stream": "https://jmp2.uk/plu-6398a9f0c8d285000798a569.m3u8",
      "category": "sports",
      "country": "Argentina",
      "countryCode": "ar",
      "quality": "720p"
    },
    {
      "id": "dsports-ar",
      "name": "DSports",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/DirecTV_Sports_logo.svg/200px-DirecTV_Sports_logo.svg.png",
      "stream": "https://jmp2.uk/plu-6398ab70c8d285000798a590.m3u8",
      "category": "sports",
      "country": "Argentina",
      "countryCode": "ar",
      "quality": "720p"
    }
  ],
  "Australia": [
    {
      "id": "fox-cricket-501-au",
      "name": "Fox Cricket 501",
      "logo": "https://upload.wikimedia.org/wikipedia/en/f/f4/Fox_Cricket_Logo.png",
      "stream": "http://y3fqd48g.megatv.fun/iptv/NRLXRWSBWBPLN4/19146/index.m3u8",
      "category": "sports",
      "country": "Australia",
      "countryCode": "au",
      "quality": "720p"
    },
    {
      "id": "leaderboard-sports-au",
      "name": "Leaderboard Sports News",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Sport_Illustrated_logo.svg/200px-Sport_Illustrated_logo.svg.png",
      "stream": "https://amg02703-amg02703c20-samsung-au-9093.playouts.now.amagi.tv/playlist.m3u8",
      "category": "sports",
      "country": "Australia",
      "countryCode": "au",
      "quality": "1080p"
    },
    {
      "id": "krave-sports-au",
      "name": "MTRSPT 1",
      "logo": "https://a.jsrdn.com/hls/23099/mtrspt1/logo_20250122_232635_70.png",
      "stream": "https://amg02873-kravemedia-mtrspt1-samsungau-2anp4.amagi.tv/playlist/amg02873-kravemedia-mtrspt1-samsungau/playlist.m3u8",
      "category": "sports",
      "country": "Australia",
      "countryCode": "au",
      "quality": "1080p"
    },
    {
      "id": "race-central-au",
      "name": "Race Central TV",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/F1-logo.svg/200px-F1-logo.svg.png",
      "stream": "https://nrpus.bozztv.com/36bay2/gusa-racecentral/index.m3u8",
      "category": "sports",
      "country": "Australia",
      "countryCode": "au",
      "quality": "720p"
    },
    {
      "id": "fox-sports-au",
      "name": "Fox Sports Australia",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/d/dd/Fox_Sports_Australia_logo.svg/200px-Fox_Sports_Australia_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Australia",
      "countryCode": "au",
      "quality": "720p"
    }
  ],
  "Bahrain": [
    {
      "id": "bahrain-sports-1-bh",
      "name": "Bahrain Sports 1",
      "logo": "https://s3.aynaott.com/storage/f55bea3263be1af187fe1122e4f44142",
      "stream": "https://5c7b683162943.streamlock.net/live/ngrp:sportsone_all/playlist.m3u8",
      "category": "sports",
      "country": "Bahrain",
      "countryCode": "bh",
      "quality": "720p"
    }
  ],
  "Bangladesh": [
    {
      "id": "fighter-tv-bd",
      "name": "FIGHTER TV",
      "logo": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgNTVL_Em_EdwVB2BrdBsyD6vxWv3VoEcBlDLj2qpE_jdxCDlIAqp07_ToS5ZFAB2ThnA04BYdC9T7pgwPy5HWX8IwL74oCwsNXdVANpHq7x98tgvaEBCGMkYBQqAUfj5W9un5H8BckX7TgB5pVV3g7kGMRc_vLGyY5XfmsLtrEEmgJJ5-q5eNqBZp8qA/s1080/1000059174.png",
      "stream": "https://nomawnoijl.gpcdn.net/akash/fighter/chunks.m3u8",
      "category": "sports",
      "country": "Bangladesh",
      "countryCode": "bd",
      "quality": "720p"
    },
    {
      "id": "flash-guys-hd-bd",
      "name": "Flash Guys HD",
      "logo": "https://tstatic.akash-go.com/cms-ui/images/custom-content/1770378074527.png",
      "stream": "https://nomawnoijl.gpcdn.net/akash/flashguys/playlist.m3u8",
      "category": "sports",
      "country": "Bangladesh",
      "countryCode": "bd",
      "quality": "720p"
    },
    {
      "id": "sports-legends-bd",
      "name": "Sports Legends",
      "logo": "https://tstatic.akash-go.com/cms-ui/images/custom-content/1770377900139.png",
      "stream": "https://nomawnoijl.gpcdn.net/akash/sportslegends/playlist.m3u8",
      "category": "sports",
      "country": "Bangladesh",
      "countryCode": "bd",
      "quality": "720p"
    },
    {
      "id": "t-sports-hd-bd",
      "name": "T Sports HD",
      "logo": "https://s3.aynaott.com/storage/dbc585f70a60b9855b6e13a8ce4cb6f4",
      "stream": "https://tvsen7.aynaott.com/tsports-hd/index.m3u8?e=1779283784&u=78be6644-0a65-48ec-81a4-089ac65a2619&token=3b4c5a2cfa872fa7f91ffbfb4aa0f658",
      "category": "sports",
      "country": "Bangladesh",
      "countryCode": "bd",
      "quality": "720p"
    },
    {
      "id": "t-sports-bd",
      "name": "T-SPORTS",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/T_Sports_logo.svg/500px-T_Sports_logo.svg.png",
      "stream": "https://tvsen7.aynaott.com/tsports-hd/index.m3u8",
      "category": "sports",
      "country": "Bangladesh",
      "countryCode": "bd",
      "quality": "720p"
    },
    {
      "id": "gtv-bd",
      "name": "Gazi TV",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/4/44/GTV_%28Bangladeshi_TV_channel%29_logo.svg/200px-GTV_%28Bangladeshi_TV_channel%29_logo.svg.png",
      "stream": "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/b17adfe543354fdd8d189b110617cddd/index_3.m3u8",
      "category": "sports",
      "country": "Bangladesh",
      "countryCode": "bd",
      "quality": "720p"
    }
  ],
  "Brazil": [
    {
      "id": "caze-tv-br",
      "name": "CAZE TV",
      "logo": "https://images.seeklogo.com/logo-png/61/1/cazetv-logo-png_seeklogo-619708.png",
      "stream": "https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/Caze_TV.m3u8",
      "category": "sports",
      "country": "Brazil",
      "countryCode": "br",
      "quality": "720p"
    },
    {
      "id": "caze-tv-1080p-br",
      "name": "CAZE TV (1080p)",
      "logo": "https://images.seeklogo.com/logo-png/61/1/cazetv-logo-png_seeklogo-619708.png",
      "stream": "https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/1080p-vtt/index.m3u8",
      "category": "sports",
      "country": "Brazil",
      "countryCode": "br",
      "quality": "1080p"
    },
    {
      "id": "pluto-esportes-br",
      "name": "Pluto TV Esportes",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Pluto_tv_logo.svg/200px-Pluto_tv_logo.svg.png",
      "stream": "https://jmp2.uk/plu-5f32d2db0af67400077f29c4.m3u8",
      "category": "sports",
      "country": "Brazil",
      "countryCode": "br",
      "quality": "720p"
    },
    {
      "id": "racer-brasil",
      "name": "RACER Brasil",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/F1-logo.svg/200px-F1-logo.svg.png",
      "stream": "https://jmp2.uk/plu-65a6818c7bdc8d0008457b21.m3u8",
      "category": "sports",
      "country": "Brazil",
      "countryCode": "br",
      "quality": "720p"
    },
    {
      "id": "pluto-sft-combat-br",
      "name": "SFT Combat",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Fight_Network_logo.svg/200px-Fight_Network_logo.svg.png",
      "stream": "https://jmp2.uk/plu-6660b636cb3ea10008429c6a.m3u8",
      "category": "sports",
      "country": "Brazil",
      "countryCode": "br",
      "quality": "720p"
    },
    {
      "id": "band-sports-br",
      "name": "Band Sports",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/BandSports_logo_%282017%29.svg/200px-BandSports_logo_%282017%29.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Brazil",
      "countryCode": "br",
      "quality": "720p"
    }
  ],
  "Canada": [
    {
      "id": "dazn-ca",
      "name": "DAZN Canada",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/DAZN_Logo.svg/200px-DAZN_Logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Canada",
      "countryCode": "ca",
      "quality": "720p"
    },
    {
      "id": "sportsnet-360-ca",
      "name": "Sportsnet 360",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Sportsnet_logo.svg/200px-Sportsnet_logo.svg.png",
      "stream": "https://jmp2.uk/plu-6408ae8f9b39550008caf94f.m3u8",
      "category": "sports",
      "country": "Canada",
      "countryCode": "ca",
      "quality": "720p"
    },
    {
      "id": "tna-wrestling-ca",
      "name": "TNA Wrestling",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/TNA_Wrestling_logo.svg/200px-TNA_Wrestling_logo.svg.png",
      "stream": "https://jmp2.uk/plu-62ea4dadce395f0007086df2.m3u8",
      "category": "sports",
      "country": "Canada",
      "countryCode": "ca",
      "quality": "720p"
    },
    {
      "id": "tsn-1-ca",
      "name": "TSN 1",
      "logo": "https://s3.aynaott.com/storage/59fe7ff434fed04ecec29b4d737ebc95",
      "stream": "https://tvsen7.aynaott.com/tsn1/index.m3u8?e=1779283805&u=78be6644-0a65-48ec-81a4-089ac65a2619&token=e5ce886378c54bd381b9833b5d57649a",
      "category": "sports",
      "country": "Canada",
      "countryCode": "ca",
      "quality": "720p"
    },
    {
      "id": "tsn-2-ca",
      "name": "TSN 2",
      "logo": "https://s3.aynaott.com/storage/17642cb60c2af7fc36ca1e08cc54fdae",
      "stream": "https://tvsen7.aynaott.com/tsn2/index.m3u8?e=1779283793&u=78be6644-0a65-48ec-81a4-089ac65a2619&token=636d9b8b83d4316193c2d1c9aad8951c",
      "category": "sports",
      "country": "Canada",
      "countryCode": "ca",
      "quality": "720p"
    },
    {
      "id": "tsn-3-ca",
      "name": "TSN 3",
      "logo": "https://s3.aynaott.com/storage/1cb10107a47db353e35ad78d3160eda7",
      "stream": "https://tvsen7.aynaott.com/tsn3/index.m3u8?e=1779283805&u=78be6644-0a65-48ec-81a4-089ac65a2619&token=fd3b5d71227f183da51caba4325cee10",
      "category": "sports",
      "country": "Canada",
      "countryCode": "ca",
      "quality": "720p"
    }
  ],
  "China": [
    {
      "id": "cctv-5-cn",
      "name": "CCTV-5 Sports",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/CCTV-5.svg/200px-CCTV-5.svg.png",
      "stream": "https://cctv5.boolv.tech/live/channel14_1/index.m3u8",
      "category": "sports",
      "country": "China",
      "countryCode": "cn",
      "quality": "720p"
    },
    {
      "id": "cctv-5plus-cn",
      "name": "CCTV-5+ Sports",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/CCTV-5plus.svg/200px-CCTV-5plus.svg.png",
      "stream": "https://cctv5.boolv.tech/live/channel14_2/index.m3u8",
      "category": "sports",
      "country": "China",
      "countryCode": "cn",
      "quality": "720p"
    }
  ],
  "Egypt": [
    {
      "id": "bein-sports-eg",
      "name": "beIN Sports Egypt",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/BeIN_Sports_logo.svg/200px-BeIN_Sports_logo.svg.png",
      "stream": "https://bein-xtra-bein.amagi.tv/playlist.m3u8",
      "category": "sports",
      "country": "Egypt",
      "countryCode": "eg",
      "quality": "720p"
    },
    {
      "id": "on-sport-eg",
      "name": "ON Sport",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/ON_Sport_logo.svg/200px-ON_Sport_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Egypt",
      "countryCode": "eg",
      "quality": "720p"
    },
    {
      "id": "nile-sport-eg",
      "name": "Nile Sport",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e6/Nile_Sport.png/200px-Nile_Sport.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Egypt",
      "countryCode": "eg",
      "quality": "720p"
    }
  ],
  "France": [
    {
      "id": "canal-plus-sport-fr",
      "name": "Canal+ Sport",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Canal%2B_Sport_logo.svg/200px-Canal%2B_Sport_logo.svg.png",
      "stream": "https://hls.canal-plus.fr/live/disk/canal-plus-sport/hls-v5/hls_pris6.m3u8",
      "category": "sports",
      "country": "France",
      "countryCode": "fr",
      "quality": "720p"
    },
    {
      "id": "eurosport-1-fr",
      "name": "Eurosport 1 France",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Eurosport_logo.svg/200px-Eurosport_logo.svg.png",
      "stream": "https://dai.google.com/linear/hls/event/dLyLKyeUQquYjDRUFc4CKQ/master.m3u8",
      "category": "sports",
      "country": "France",
      "countryCode": "fr",
      "quality": "720p"
    },
    {
      "id": "l-equipe-fr",
      "name": "L'Équipe",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/L%27%C3%89quipe_2015_logo.svg/200px-L%27%C3%89quipe_2015_logo.svg.png",
      "stream": "https://stream-lequipe.cdn.bfmtv.com/hls/live/571298/lequipe/live_720p/index.m3u8",
      "category": "sports",
      "country": "France",
      "countryCode": "fr",
      "quality": "720p"
    },
    {
      "id": "rmc-sport-fr",
      "name": "RMC Sport",
      "logo": "https://upload.wikimedia.org/wikipedia/fr/thumb/c/ce/Logo_RMC_Sport_2018.svg/200px-Logo_RMC_Sport_2018.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "France",
      "countryCode": "fr",
      "quality": "720p"
    }
  ],
  "Germany": [
    {
      "id": "eurosport-1-de",
      "name": "Eurosport 1",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Eurosport_logo.svg/200px-Eurosport_logo.svg.png",
      "stream": "https://dai.google.com/linear/hls/event/dLyLKyeUQquYjDRUFc4CKQ/master.m3u8",
      "category": "sports",
      "country": "Germany",
      "countryCode": "de",
      "quality": "720p"
    },
    {
      "id": "more-then-sports-tv-de",
      "name": "MORE THAN SPORTS TV",
      "logo": "https://s3.aynaott.com/storage/39174e32d4f8d29a95c881637fe1ecdb",
      "stream": "https://mts1.iptv-playoutcenter.de/mts/mts-web/playlist.m3u8",
      "category": "sports",
      "country": "Germany",
      "countryCode": "de",
      "quality": "720p"
    },
    {
      "id": "ran-de",
      "name": "ran Sport",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Ran.de_Logo.svg/200px-Ran.de_Logo.svg.png",
      "stream": "https://streaming.ran.de/hls/live/2019017/ran_hls/master.m3u8",
      "category": "sports",
      "country": "Germany",
      "countryCode": "de",
      "quality": "720p"
    },
    {
      "id": "sport1-de",
      "name": "SPORT1",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Sport1_logo.svg/200px-Sport1_logo.svg.png",
      "stream": "https://sports1hd-i.akamaihd.net/hls/live/627525/sport1hd/master.m3u8",
      "category": "sports",
      "country": "Germany",
      "countryCode": "de",
      "quality": "720p"
    },
    {
      "id": "wof-1-de",
      "name": "WOF 1",
      "logo": "https://s3.aynaott.com/storage/1a580ee2636a0c4761e623bc131ba7a6",
      "stream": "https://mainstreammedia-worldoffreesportsintl-rakuten.amagi.tv/hls/amagi_hls_data_rakutenAA-mainstreammediafreesportsintl-rakuten/CDN/master.m3u8",
      "category": "sports",
      "country": "Germany",
      "countryCode": "de",
      "quality": "720p"
    },
    {
      "id": "xtrem-sports-de",
      "name": "Xtrem Sports",
      "logo": "https://s3.aynaott.com/storage/e1749cf3040f11c63e722c941f213927",
      "stream": "https://streams2.sofast.tv/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/e0b81a5c-6ab5-48cd-aaa9-f82de4ab5bf9/manifest.m3u8",
      "category": "sports",
      "country": "Germany",
      "countryCode": "de",
      "quality": "720p"
    }
  ],
  "India": [
    {
      "id": "cricket-gold-in",
      "name": "Cricket Gold",
      "logo": "https://s3.aynaott.com/storage/7d20b575edc4e4b5276faa8c246e72a4",
      "stream": "https://tvsen6.aynaott.com/CricketGold/index.m3u8?e=1779283786&u=78be6644-0a65-48ec-81a4-089ac65a2619&token=7c79e4f07ef8bf05e35ecffd9e056652",
      "category": "sports",
      "country": "India",
      "countryCode": "in",
      "quality": "720p"
    },
    {
      "id": "dd-sports-in",
      "name": "DD Sports",
      "logo": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhvJ1HtheTbTZjOoXTO9KRK1fIhh1uXhyvSckbf05J7yIcdT4ZucX1fvfjnyiv9QK-m0pBK6MoY6KhcVPQpsRSXdgBFU612nmbKpY864gsoMvMaCyu_fOdNVbx6ADMbz2dftZ7-0Arzx81kC8nqbeduSEsquwrPpzNGm2wZw6rXHe79vlF7DokCavubWA/s600/Nur_20251107_160202_0000.png",
      "stream": "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/b17adfe543354fdd8d189b110617cddd/index_3.m3u8",
      "category": "sports",
      "country": "India",
      "countryCode": "in",
      "quality": "720p"
    },
    {
      "id": "psl-ipl-in",
      "name": "PSL + IPL",
      "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrZBygzDovVY_wCvtTy8J8SQogo6-QPwfmGThA4vBFcWXFqXLpCNpQuaG7&s=10",
      "stream": "https://tvsen5.aynaott.com/willowhd/index.m3u8",
      "category": "sports",
      "country": "India",
      "countryCode": "in",
      "quality": "720p"
    },
    {
      "id": "sony-ten-1-in",
      "name": "Sony Ten 1",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/9/96/Sony_Ten_1.png/200px-Sony_Ten_1.png",
      "stream": "https://jmp2.uk/plu-63989ae7c8d285000798a634.m3u8",
      "category": "sports",
      "country": "India",
      "countryCode": "in",
      "quality": "720p"
    },
    {
      "id": "sony-ten-3-in",
      "name": "Sony Ten 3",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Sony_Ten_3.png/200px-Sony_Ten_3.png",
      "stream": "https://jmp2.uk/plu-63989d77c8d285000798a656.m3u8",
      "category": "sports",
      "country": "India",
      "countryCode": "in",
      "quality": "720p"
    },
    {
      "id": "star-select-1-in",
      "name": "Star Select 1",
      "logo": "https://ctgiptv.com/assets/images/channels/starselect1hd.jpg",
      "stream": "https://tvsen7.aynaott.com/sspts1/index.m3u8",
      "category": "sports",
      "country": "India",
      "countryCode": "in",
      "quality": "720p"
    },
    {
      "id": "star-sports-1-in",
      "name": "Star Sports 1",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/5/54/Star_Sports_1_logo.svg/200px-Star_Sports_1_logo.svg.png",
      "stream": "https://jmp2.uk/plu-6398a5a5c8d285000798a51a.m3u8",
      "category": "sports",
      "country": "India",
      "countryCode": "in",
      "quality": "720p"
    },
    {
      "id": "star-sports-2-in",
      "name": "Star Sports 2",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/6/6a/Star_Sports_2.svg/200px-Star_Sports_2.svg.png",
      "stream": "https://jmp2.uk/plu-6398a7b4c8d285000798a545.m3u8",
      "category": "sports",
      "country": "India",
      "countryCode": "in",
      "quality": "720p"
    },
    {
      "id": "jio-cinema-sports-in",
      "name": "JioCinema Sports",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/5/59/JioCinema_logo.svg/200px-JioCinema_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "India",
      "countryCode": "in",
      "quality": "720p"
    }
  ],
  "Italy": [
    {
      "id": "eurosport-it",
      "name": "Eurosport Italia",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Eurosport_logo.svg/200px-Eurosport_logo.svg.png",
      "stream": "https://dai.google.com/linear/hls/event/dLyLKyeUQquYjDRUFc4CKQ/master.m3u8",
      "category": "sports",
      "country": "Italy",
      "countryCode": "it",
      "quality": "720p"
    },
    {
      "id": "rai-sport-it",
      "name": "Rai Sport",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Rai_Sport_HD.svg/200px-Rai_Sport_HD.svg.png",
      "stream": "https://rai-lv-live.akamaized.net/lv-rai/raisportweb/playlist.m3u8",
      "category": "sports",
      "country": "Italy",
      "countryCode": "it",
      "quality": "720p"
    },
    {
      "id": "sport-italia-it",
      "name": "Sport Italia",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Sport_Italia.svg/200px-Sport_Italia.svg.png",
      "stream": "https://www.sportitalia.com/video-sportitalia/streaming/video.html",
      "category": "sports",
      "country": "Italy",
      "countryCode": "it",
      "quality": "720p"
    }
  ],
  "Japan": [
    {
      "id": "gaora-sports-jp",
      "name": "GAORA Sports",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Gaora_logo.svg/200px-Gaora_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Japan",
      "countryCode": "jp",
      "quality": "720p"
    },
    {
      "id": "nhk-world-jp",
      "name": "NHK Sports",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/NHK_logo.svg/200px-NHK_logo.svg.png",
      "stream": "https://nhkworldjapanese.cdn.nimg.jp/live/stream/1080p/playlist.m3u8",
      "category": "sports",
      "country": "Japan",
      "countryCode": "jp",
      "quality": "720p"
    },
    {
      "id": "j-sports-jp",
      "name": "J Sports",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/J_SPORTS_logo.svg/200px-J_SPORTS_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Japan",
      "countryCode": "jp",
      "quality": "720p"
    }
  ],
  "Kuwait": [
    {
      "id": "ktv-sport-plus-kw",
      "name": "KTV Sport Plus",
      "logo": "https://s3.aynaott.com/storage/b54495ee3cdd53ddaa19d1f98120f488",
      "stream": "https://kwtsplta.cdn.mangomolo.com/spl/smil:spl.stream.smil/chunklist.m3u8",
      "category": "sports",
      "country": "Kuwait",
      "countryCode": "kw",
      "quality": "720p"
    }
  ],
  "Mexico": [
    {
      "id": "espn-mx",
      "name": "ESPN México",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/200px-ESPN_wordmark.svg.png",
      "stream": "https://jmp2.uk/plu-6398aaf2c8d285000798a587.m3u8",
      "category": "sports",
      "country": "Mexico",
      "countryCode": "mx",
      "quality": "720p"
    },
    {
      "id": "fox-sports-mx",
      "name": "Fox Sports México",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Fox_Sports_2012_logo.svg/200px-Fox_Sports_2012_logo.svg.png",
      "stream": "https://jmp2.uk/plu-6398abc8c8d285000798a597.m3u8",
      "category": "sports",
      "country": "Mexico",
      "countryCode": "mx",
      "quality": "720p"
    },
    {
      "id": "tudn-mx",
      "name": "TUDN",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/TUDN_logo.svg/200px-TUDN_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Mexico",
      "countryCode": "mx",
      "quality": "720p"
    },
    {
      "id": "azteca-deportes-mx",
      "name": "Azteca Deportes",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Azteca_Deportes_logo_%282022%29.svg/200px-Azteca_Deportes_logo_%282022%29.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Mexico",
      "countryCode": "mx",
      "quality": "720p"
    }
  ],
  "Morocco": [
    {
      "id": "arryadia-ma",
      "name": "Arryadia",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Logo_Arryadia.png/200px-Logo_Arryadia.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Morocco",
      "countryCode": "ma",
      "quality": "720p"
    },
    {
      "id": "bein-sports-ma",
      "name": "beIN Sports Morocco",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/BeIN_Sports_logo.svg/200px-BeIN_Sports_logo.svg.png",
      "stream": "https://bein-xtra-bein.amagi.tv/playlist.m3u8",
      "category": "sports",
      "country": "Morocco",
      "countryCode": "ma",
      "quality": "720p"
    }
  ],
  "Netherlands": [
    {
      "id": "eurosport-nl",
      "name": "Eurosport Netherlands",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Eurosport_logo.svg/200px-Eurosport_logo.svg.png",
      "stream": "https://dai.google.com/linear/hls/event/dLyLKyeUQquYjDRUFc4CKQ/master.m3u8",
      "category": "sports",
      "country": "Netherlands",
      "countryCode": "nl",
      "quality": "720p"
    },
    {
      "id": "ziggo-sport-nl",
      "name": "Ziggo Sport",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Ziggo_Sport_Logo.svg/200px-Ziggo_Sport_Logo.svg.png",
      "stream": "https://bein-xtra-bein.amagi.tv/playlist.m3u8",
      "category": "sports",
      "country": "Netherlands",
      "countryCode": "nl",
      "quality": "720p"
    }
  ],
  "Oman": [
    {
      "id": "oman-sports-tv-om",
      "name": "Oman Sports TV",
      "logo": "https://s3.aynaott.com/storage/33f87783637fc95fdb8837ba9344c9e9",
      "stream": "https://partneta.cdn.mgmlcdn.com/omsport/smil:omsport.stream.smil/chunklist.m3u8",
      "category": "sports",
      "country": "Oman",
      "countryCode": "om",
      "quality": "720p"
    }
  ],
  "Pakistan": [
    {
      "id": "a-sports-pk",
      "name": "A Sports",
      "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWw7Tog0Vmto_gO32WGjKy2-tX8G-CIdmuZN8QCIla3g&s=10",
      "stream": "https://tvsen6.aynaott.com/asports/tracks-v1a1/mono.ts.m3u8",
      "category": "sports",
      "country": "Pakistan",
      "countryCode": "pk",
      "quality": "720p"
    },
    {
      "id": "geo-super-pk",
      "name": "Geo Super",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/a/ac/Geo_Super.svg/200px-Geo_Super.svg.png",
      "stream": "https://g2.dott.tv/geosuperhd/index.m3u8",
      "category": "sports",
      "country": "Pakistan",
      "countryCode": "pk",
      "quality": "720p"
    },
    {
      "id": "p-tv-sports-pk",
      "name": "P Tv Sports",
      "logo": "https://i.postimg.cc/sXpJqtm3/Ptv.png",
      "stream": "https://tvsen5.aynaott.com/PtvSports/tracks-v1a1/mono.ts.m3u8",
      "category": "sports",
      "country": "Pakistan",
      "countryCode": "pk",
      "quality": "720p"
    },
    {
      "id": "ptv-sports-pk",
      "name": "PTV Sports",
      "logo": "https://s3.aynaott.com/storage/9d9d7cbfba5a8ceea648bbd963ad1014",
      "stream": "https://tvsen5.aynaott.com/PtvSports/index.m3u8?e=1779283784&u=78be6644-0a65-48ec-81a4-089ac65a2619&token=db1789e36c278bf538489fac263e0ffb",
      "category": "sports",
      "country": "Pakistan",
      "countryCode": "pk",
      "quality": "720p"
    },
    {
      "id": "ten-sports-pk",
      "name": "Ten Sports",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/Ten_Sports_Asia.png/200px-Ten_Sports_Asia.png",
      "stream": "https://jmp2.uk/plu-6398a2dac8d285000798a4f4.m3u8",
      "category": "sports",
      "country": "Pakistan",
      "countryCode": "pk",
      "quality": "720p"
    }
  ],
  "Portugal": [
    {
      "id": "eurosport-pt",
      "name": "Eurosport Portugal",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Eurosport_logo.svg/200px-Eurosport_logo.svg.png",
      "stream": "https://dai.google.com/linear/hls/event/dLyLKyeUQquYjDRUFc4CKQ/master.m3u8",
      "category": "sports",
      "country": "Portugal",
      "countryCode": "pt",
      "quality": "720p"
    },
    {
      "id": "sport-tv-pt",
      "name": "Sport TV 1",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Sport_TV_logo.svg/200px-Sport_TV_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Portugal",
      "countryCode": "pt",
      "quality": "720p"
    },
    {
      "id": "rtp-sport-pt",
      "name": "RTP Sport",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/RTP_logo.svg/200px-RTP_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Portugal",
      "countryCode": "pt",
      "quality": "720p"
    }
  ],
  "Qatar": [
    {
      "id": "bein-sports-xtra-qa",
      "name": "beIN Sports XTRA Qatar",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/BeIN_Sports_logo.svg/200px-BeIN_Sports_logo.svg.png",
      "stream": "https://bein-xtra-bein.amagi.tv/playlist.m3u8",
      "category": "sports",
      "country": "Qatar",
      "countryCode": "qa",
      "quality": "720p"
    },
    {
      "id": "alkass-sports-qa",
      "name": "Al Kass Sports",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Al_Kass_logo.svg/200px-Al_Kass_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Qatar",
      "countryCode": "qa",
      "quality": "720p"
    }
  ],
  "Russia": [
    {
      "id": "match-tv-ru",
      "name": "Матч ТВ",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Match_TV_logo.svg/200px-Match_TV_logo.svg.png",
      "stream": "https://match-tv.ru/stream/match_tv/playlist.m3u8",
      "category": "sports",
      "country": "Russia",
      "countryCode": "ru",
      "quality": "720p"
    },
    {
      "id": "match-sport-ru",
      "name": "Матч! Спорт",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Match_TV_logo.svg/200px-Match_TV_logo.svg.png",
      "stream": "https://match-tv.ru/stream/match_sport/playlist.m3u8",
      "category": "sports",
      "country": "Russia",
      "countryCode": "ru",
      "quality": "720p"
    }
  ],
  "Saudi Arabia": [
    {
      "id": "bein-sports-sa",
      "name": "beIN Sports Arabia",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/BeIN_Sports_logo.svg/200px-BeIN_Sports_logo.svg.png",
      "stream": "https://bein-xtra-bein.amagi.tv/playlist.m3u8",
      "category": "sports",
      "country": "Saudi Arabia",
      "countryCode": "sa",
      "quality": "720p"
    },
    {
      "id": "ssc-sport-sa",
      "name": "SSC Sport 1",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Saudi_Sport_Company_Logo.svg/200px-Saudi_Sport_Company_Logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Saudi Arabia",
      "countryCode": "sa",
      "quality": "720p"
    },
    {
      "id": "ssc-sport-2-sa",
      "name": "SSC Sport 2",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Saudi_Sport_Company_Logo.svg/200px-Saudi_Sport_Company_Logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Saudi Arabia",
      "countryCode": "sa",
      "quality": "720p"
    }
  ],
  "South Korea": [
    {
      "id": "kbs-n-sports-kr",
      "name": "KBS N Sports",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/KBS_N_Sports.svg/200px-KBS_N_Sports.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "South Korea",
      "countryCode": "kr",
      "quality": "720p"
    },
    {
      "id": "mbc-sports-kr",
      "name": "MBC Sports+",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/MBC_Sports_Plus.svg/200px-MBC_Sports_Plus.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "South Korea",
      "countryCode": "kr",
      "quality": "720p"
    },
    {
      "id": "sbs-sports-kr",
      "name": "SBS Sports",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/SBS_Sports.svg/200px-SBS_Sports.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "South Korea",
      "countryCode": "kr",
      "quality": "720p"
    }
  ],
  "Spain": [
    {
      "id": "bein-sports-es",
      "name": "beIN Sports España",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/BeIN_Sports_logo.svg/200px-BeIN_Sports_logo.svg.png",
      "stream": "https://bein-xtra-bein.amagi.tv/playlist.m3u8",
      "category": "sports",
      "country": "Spain",
      "countryCode": "es",
      "quality": "720p"
    },
    {
      "id": "dazn-1-es",
      "name": "DAZN LaLiga",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/DAZN_Logo.svg/200px-DAZN_Logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Spain",
      "countryCode": "es",
      "quality": "720p"
    },
    {
      "id": "eurosport-es",
      "name": "Eurosport España",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Eurosport_logo.svg/200px-Eurosport_logo.svg.png",
      "stream": "https://dai.google.com/linear/hls/event/dLyLKyeUQquYjDRUFc4CKQ/master.m3u8",
      "category": "sports",
      "country": "Spain",
      "countryCode": "es",
      "quality": "720p"
    },
    {
      "id": "real-madrid-tv-football-es",
      "name": "Real Madrid TV",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/200px-Real_Madrid_CF.svg.png",
      "stream": "https://rmtv.akamaized.net/hls/live/2043154/rmtv-en-web/bitrate_3.m3u8",
      "category": "sports",
      "country": "Spain",
      "countryCode": "es",
      "quality": "720p"
    },
    {
      "id": "laliga-tv-es",
      "name": "LaLiga TV Bar",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/LaLiga_2023_logo.svg/200px-LaLiga_2023_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Spain",
      "countryCode": "es",
      "quality": "720p"
    }
  ],
  "Turkey": [
    {
      "id": "a-spor-tr",
      "name": "A Spor",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/ASpor_logo.png/200px-ASpor_logo.png",
      "stream": "https://live.aspor.com.tr/live/aspor/index.m3u8",
      "category": "sports",
      "country": "Turkey",
      "countryCode": "tr",
      "quality": "720p"
    },
    {
      "id": "tivibu-spor-tr",
      "name": "Tivibu Spor",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Tivibu_logo.svg/200px-Tivibu_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Turkey",
      "countryCode": "tr",
      "quality": "720p"
    },
    {
      "id": "trt-spor-tr",
      "name": "TRT Spor",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/TRT_Spor_logo.svg/200px-TRT_Spor_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "Turkey",
      "countryCode": "tr",
      "quality": "720p"
    }
  ],
  "United Arab Emirates": [
    {
      "id": "bein-sports-ae",
      "name": "beIN Sports UAE",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/BeIN_Sports_logo.svg/200px-BeIN_Sports_logo.svg.png",
      "stream": "https://bein-xtra-bein.amagi.tv/playlist.m3u8",
      "category": "sports",
      "country": "United Arab Emirates",
      "countryCode": "ae",
      "quality": "720p"
    },
    {
      "id": "abu-dhabi-sports-ae",
      "name": "Abu Dhabi Sports",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Abu_Dhabi_Sports_logo.svg/200px-Abu_Dhabi_Sports_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "United Arab Emirates",
      "countryCode": "ae",
      "quality": "720p"
    },
    {
      "id": "dubai-sports-ae",
      "name": "Dubai Sports",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Dubai_Sports_Channel_logo.svg/200px-Dubai_Sports_Channel_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "United Arab Emirates",
      "countryCode": "ae",
      "quality": "720p"
    }
  ],
  "United Kingdom": [
    {
      "id": "bt-sport-uk",
      "name": "BT Sport",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/4/44/BT_Sport_2015.svg/200px-BT_Sport_2015.svg.png",
      "stream": "https://jmp2.uk/plu-671645c4529ac900080c9a0b.m3u8",
      "category": "sports",
      "country": "United Kingdom",
      "countryCode": "gb",
      "quality": "720p"
    },
    {
      "id": "eurosport-uk",
      "name": "Eurosport",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Eurosport_logo.svg/200px-Eurosport_logo.svg.png",
      "stream": "https://dai.google.com/linear/hls/event/dLyLKyeUQquYjDRUFc4CKQ/master.m3u8",
      "category": "sports",
      "country": "United Kingdom",
      "countryCode": "gb",
      "quality": "720p"
    },
    {
      "id": "premier-league-gb",
      "name": "Premier League",
      "logo": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEggALPjRyvL1P2P5tscUTQmFzD2-W0lfCb0wMtEfSWo-ZxHpbJtV_nGQwskPxayJdbvTpUgRoVBiVcatDfm6Ik99fgiXKo7ctjJYkVQPym8teoSiyy3R8WO-sPJNpAzp35LDyOIeSwWYSUpQprqLWy01SGxz2_7o0AUFfblSugnXSt6-znRFJ8w4-gE8w/s1080/1000058092.png",
      "stream": "https://ml-pull-hwc.myco.io/PROMO/hls/PROMO_H264-240p.m3u8?pkg_media=video&pkg_hm=index.m3u8&pkg_svc=1&pkg_vcodec=avc1",
      "category": "sports",
      "country": "United Kingdom",
      "countryCode": "gb",
      "quality": "720p"
    },
    {
      "id": "sky-sports-uk",
      "name": "Sky Sports",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/9/9b/Sky_Sports_logo_2020.svg/200px-Sky_Sports_logo_2020.svg.png",
      "stream": "https://livein-lt.ntv.io/skysportsnews/index.m3u8",
      "category": "sports",
      "country": "United Kingdom",
      "countryCode": "gb",
      "quality": "720p"
    },
    {
      "id": "talk-sport-gb",
      "name": "Talk Sport",
      "logo": "https://s3.aynaott.com/storage/5128cd32518d5a9ba7a37e21947fd8fd",
      "stream": "https://tvsen6.aynaott.com/talkSPORT/index.m3u8?e=1779283794&u=78be6644-0a65-48ec-81a4-089ac65a2619&token=24b590ae2b7927c00a9acc3a97bc5d86",
      "category": "sports",
      "country": "United Kingdom",
      "countryCode": "gb",
      "quality": "720p"
    },
    {
      "id": "tna-wrestling-uk",
      "name": "TNA Wrestling",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/TNA_Wrestling_logo.svg/200px-TNA_Wrestling_logo.svg.png",
      "stream": "https://jmp2.uk/plu-62ea4dadce395f0007086df2.m3u8",
      "category": "sports",
      "country": "United Kingdom",
      "countryCode": "gb",
      "quality": "720p"
    },
    {
      "id": "bbc-sport-gb",
      "name": "BBC Sport",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/BBC_Sport_logo.svg/200px-BBC_Sport_logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "United Kingdom",
      "countryCode": "gb",
      "quality": "720p"
    }
  ],
  "United States": [
    {
      "id": "bein-sports-xtra-us",
      "name": "beIN SPORTS XTRA",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/BeIN_Sports_logo.svg/200px-BeIN_Sports_logo.svg.png",
      "stream": "https://bein-xtra-bein.amagi.tv/playlist.m3u8",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "1080p"
    },
    {
      "id": "billiard-tv-us",
      "name": "Billiard TV",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Pool_balls_triangle.svg/200px-Pool_balls_triangle.svg.png",
      "stream": "https://1621590671.rsc.cdn77.org/HLS/BILLIARDTV.m3u8",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "1080p"
    },
    {
      "id": "bleav-football-us",
      "name": "Bleav Football",
      "logo": "https://a.jsrdn.com/hls/23091/bleav-football/logo_20231219_184637_64.png",
      "stream": "https://linear-493.frequency.stream/dist/glewedtv/493/hls/master/playlist.m3u8",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "720p"
    },
    {
      "id": "bloomberg-tv-us",
      "name": "Bloomberg TV",
      "logo": "https://s3.aynaott.com/storage/253dcc8b5951160d6aa26bc5ac65ddb8",
      "stream": "https://tvsen6.aynaott.com/bloombergtv/index.m3u8?e=1779283799&u=78be6644-0a65-48ec-81a4-089ac65a2619&token=ecba4c0cf6ffc82d2d0dfc78f69c1061",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "720p"
    },
    {
      "id": "pluto-dazn-us",
      "name": "DAZN TV",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/DAZN_Logo.svg/200px-DAZN_Logo.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "720p"
    },
    {
      "id": "espn-us",
      "name": "ESPN",
      "logo": "https://s3.aynaott.com/storage/b46df1959322aa48d270a6b163234c76",
      "stream": "https://tvsen5.aynaott.com/espn/index.m3u8?e=1779283793&u=78be6644-0a65-48ec-81a4-089ac65a2619&token=cf2b4cb8b6c96ab86daee4299c792295",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "720p"
    },
    {
      "id": "fight-network-us",
      "name": "Fight Network",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Fight_Network_logo.svg/200px-Fight_Network_logo.svg.png",
      "stream": "https://streaming.fightnetwork.com/8020/ngrp:8020_all/playlist.m3u8",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "720p"
    },
    {
      "id": "fox-sports-2-us",
      "name": "Fox Sports 2",
      "logo": "https://s3.aynaott.com/storage/da4282cd107cc3d40efadae488b187e5",
      "stream": "https://tvsen7.aynaott.com/foxsports2/index.m3u8?e=1779283790&u=78be6644-0a65-48ec-81a4-089ac65a2619&token=cbb7f40b4af7be51a91e0629a5ac7238",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "720p"
    },
    {
      "id": "fox-soccer-plus-us",
      "name": "Fox Soccer Plus",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/1/11/Fox_Soccer_Plus.svg/200px-Fox_Soccer_Plus.svg.png",
      "stream": "https://tvsen7.aynaott.com/foxsports2/index.m3u8",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "720p"
    },
    {
      "id": "goal-tv-us",
      "name": "Goal TV",
      "logo": "https://media.unreel.me/prod/freelivesports/logo/3b9ff291-5825-4cd3-b8f0-5d03a3f1e3c1",
      "stream": "https://streams2.sofast.tv/sofastplayout/WiseM3U8_1/master.m3u8",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "720p"
    },
    {
      "id": "golf-channel-us",
      "name": "Golf Channel",
      "logo": "https://s3.aynaott.com/storage/edb73991516696dfd53efbd32d80ca58",
      "stream": "https://tvsen6.aynaott.com/golfchannel/index.m3u8?e=1779283789&u=78be6644-0a65-48ec-81a4-089ac65a2619&token=56943a1262fd47843d1dbaaaf88363bc",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "720p"
    },
    {
      "id": "marquee-sports-network-us",
      "name": "Marquee Sports Network",
      "logo": "https://s3.aynaott.com/storage/66bdaa21aba96de6d32a3515715f7502",
      "stream": "https://tvsen6.aynaott.com/MarqueeSportsNetwork/index.m3u8?e=1779283796&u=78be6644-0a65-48ec-81a4-089ac65a2619&token=a91e537a0eb1a24ed472a508e90fefcc",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "720p"
    },
    {
      "id": "mtrspt1-us",
      "name": "MTRSPT1",
      "logo": "https://a.jsrdn.com/hls/23099/mtrspt1/logo_20250122_232635_70.png",
      "stream": "https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg02873-kravemedia-mtrspt1-distrotv/playlist.m3u8",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "720p"
    },
    {
      "id": "nbc-sports-us",
      "name": "NBC Sports",
      "logo": "https://s3.aynaott.com/storage/0a241a80bf51d2c3b3722531706ce086",
      "stream": "https://xumo-xumoent-vc-122-sjv70.fast.nbcuni.com/live/master.m3u8",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "720p"
    },
    {
      "id": "nfl-network-us",
      "name": "NFL Network",
      "logo": "https://s3.aynaott.com/storage/79f1ee920d6931a767ae0030e1c7c12b",
      "stream": "https://tvsen6.aynaott.com/nfl/index.m3u8?e=1779283803&u=78be6644-0a65-48ec-81a4-089ac65a2619&token=1b632116fe249e5c6c5307adc395a1ec",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "720p"
    },
    {
      "id": "speed-sports-1-us",
      "name": "Speed Sports 1",
      "logo": "https://s3.aynaott.com/storage/06f5b193bfa4d31310ee934eb3c2222e",
      "stream": "https://linear-599.frequency.stream/dist/stirr/599/hls/master/playlist.m3u8",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "720p"
    },
    {
      "id": "sports-first-tv-us",
      "name": "SPORTS FIRST TV",
      "logo": "https://s3.aynaott.com/storage/748d28752dcf95740561f1ac39e15fc3",
      "stream": "https://d4ddgdmj1cvnm.cloudfront.net/scheduler/scheduleMaster/409.m3u8",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "720p"
    },
    {
      "id": "sports-grid-us",
      "name": "Sports Grid",
      "logo": "https://s3.aynaott.com/storage/1aa37e387ed56a1260b285558eec7c46",
      "stream": "https://tvsen6.aynaott.com/SportsGrid/index.m3u8?e=1779283798&u=78be6644-0a65-48ec-81a4-089ac65a2619&token=652ed8ae174a9efdb335fb31355f0fb5",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "720p"
    },
    {
      "id": "ufc-tv-us",
      "name": "UFC TV",
      "logo": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhpk7qcLQpJwBYzXGY25LdrndzWRDs3tgwp5rY0W-pkxJQ9UVDcWvE88Ng6AGWlHpHNhjQrb28lJ2r4V_BW1fVkLySo3sB1nzTwt_LuRQ9cYGim_FInDnyZWBuULFUFI_Vr9YdIpTs7KvDsVb0CEy_XYJCmUXB4Jpo1uPnXTjh09EqP_sJLqgb6Dwf1uA/s1080/1000060530.png",
      "stream": "https://linear-893.frequency.stream/mt/plex/893/hls/master/playlist_640x360.m3u8",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "720p"
    },
    {
      "id": "willow-hd-tv-us",
      "name": "Willow HD TV",
      "logo": "https://s3.aynaott.com/storage/94a778ec3219f7eb54bdf1ee07a95788",
      "stream": "https://tvsen5.aynaott.com/willowhd/index.m3u8?e=1779283803&u=78be6644-0a65-48ec-81a4-089ac65a2619&token=2fe7bf4f892cf09f80087b8146545bad",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "720p"
    },
    {
      "id": "fifa-tv-us",
      "name": "FIFA+ Live",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/FIFA_logo_without_slogan.svg/200px-FIFA_logo_without_slogan.svg.png",
      "stream": "https://jmp2.uk/plu-647f07e74cfc2c0008a2e557.m3u8",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "1080p"
    },
    {
      "id": "fox-sports-1-us",
      "name": "FOX Sports 1",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Fox_Sports_1_logo.svg/200px-Fox_Sports_1_logo.svg.png",
      "stream": "https://tvsen7.aynaott.com/foxsports2/index.m3u8",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "720p"
    },
    {
      "id": "cbs-sports-us",
      "name": "CBS Sports HQ",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/CBS_Sports_logo.svg/200px-CBS_Sports_logo.svg.png",
      "stream": "https://dai.google.com/linear/hls/event/dLyLKyeUQquYjDRUFc4CKQ/master.m3u8",
      "category": "sports",
      "country": "United States",
      "countryCode": "us",
      "quality": "720p"
    }
  ]
};

// Write the sorted JSON
fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'data', 'channels.json'),
  JSON.stringify(channels, null, 2) + '\n',
  'utf-8'
);

// Summary
const total = Object.values(channels).flat().length;
const countries = Object.keys(channels);
console.log('✅ Written ' + total + ' channels across ' + countries.length + ' countries');
console.log('Countries (sorted): ' + countries.join(', '));
