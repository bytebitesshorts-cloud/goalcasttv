import type { NextRequest } from 'next/server';

// Dummy data – in a real app replace with a real sports API
const dummyMatches = [
  {
    image: 'https://example.com/match1.jpg',
    link: 'https://example.com/match1',
    title: 'Team A vs Team B – Live',
  },
  {
    image: 'https://example.com/match2.jpg',
    link: 'https://example.com/match2',
    title: 'Team C vs Team D – Live',
  },
];

export async function GET(req: NextRequest) {
  // Here you could fetch from an external API, apply caching, etc.
  return new Response(JSON.stringify(dummyMatches), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
