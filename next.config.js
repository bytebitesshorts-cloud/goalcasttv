// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Simple runtime caching strategy
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: { cacheName: 'http-cache' },
    },
  ],
});
/** @type {import('next').NextConfig} */
module.exports = withPWA({
  // any existing next config can be merged here
});
