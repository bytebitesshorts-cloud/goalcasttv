export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://goalcast-tv.vercel.app/sitemap.xml',
  };
}
