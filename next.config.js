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
  // Enable SWC minification for faster builds and lower memory usage
  swcMinify: true,
  // Skip type checking during build to avoid OOM
  typescript: {
    ignoreBuildErrors: true,
  },
  // Reduce image processing overhead
  images: {
    disableStaticImages: true,
  },
});
  // any existing next config can be merged here
});
