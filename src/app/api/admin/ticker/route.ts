import connectDB from '@/lib/db';
import { Store } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getTicker();

    if (data.active) {
      // Fetch live data from ESPN
      const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard', {
        next: { revalidate: 30 } // Cache for 30s
      });
      if (res.ok) {
        const espnData = await res.json();
        const events: ESPNEvent[] = espnData.events || [];

        // Filter to only today's matches (UTC)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventsToday = events.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= today && eventDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        });

        const liveMatches = eventsToday.map((event: ESPNEvent) => {
          const competition = event.competitions?.[0];
          // Include all matches (no competition name filter)
          const competitors = competition?.competitors || [];

          const home = competitors.find((c: ESPNCompetitor) => c.homeAway === 'home');
          const away = competitors.find((c: ESPNCompetitor) => c.homeAway === 'away');

          const state = event.status?.type?.state; // 'pre' | 'in' | 'post'
          const isLive = state === 'in';
          const isFinished = state === 'post';

          const dateObj = new Date(event.date);
          const formattedDate = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

          return {
            id: event.id || String(Math.random()),
            status: isLive ? 'live' : isFinished ? 'finished' : 'upcoming',
            minute: isLive ? `${(event.status?.type as any)?.detail || ''}`.replace(' - Half', '') : undefined,
            date: formattedDate,
            time: formattedTime,
            homeTeam: home?.team?.displayName || 'Home',
            homeFlag: home?.team?.logo || '',
            homeScore: home?.score !== undefined ? parseInt(home.score, 10) : 0,
            awayTeam: away?.team?.displayName || 'Away',
            awayFlag: away?.team?.logo || '',
            awayScore: away?.score !== undefined ? parseInt(away.score, 10) : 0,
          };
        });

        // Sort: live matches first, then upcoming by kickoff time
        liveMatches.sort((a, b) => {
          if (a.status === 'live' && b.status !== 'live') return -1;
          if (a.status !== 'live' && b.status === 'live') return 1;
          if (a.status === 'upcoming' && b.status === 'upcoming') {
            return new Date(`1970-01-01 ${a.time}`).getTime() - new Date(`1970-01-01 ${b.time}`).getTime();
          }
          return 0;
        });

        return NextResponse.json({
          active: data.active,
          matches: liveMatches
        });
      }
    }

    return NextResponse.json({ active: data.active, matches: [] });
  } catch {
    return NextResponse.json({ active: false, matches: [] });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const current = await getTicker();

    const updated = {
      active: body.active !== undefined ? body.active : current.active,
    };

    await saveTicker(updated);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update ticker settings' }, { status: 500 });
  }
}

function isAuthenticated(req: NextRequest) {
  return req.cookies.get('admin_session')?.value === 'authenticated';
}

async function getTicker() {
  await connectDB();
  const tickerStore = await Store.findOne({ key: 'ticker' });
  if (!tickerStore) {
    return { active: false, useLiveFeed: true, matches: [] };
  }
  return tickerStore.data;
}

async function saveTicker(data: unknown) {
  await connectDB();
  await Store.findOneAndUpdate(
    { key: 'ticker' },
    { data },
    { upsert: true }
  );
}

interface ESPNCompetitor {
  homeAway: string;
  score?: string;
  team?: {
    displayName?: string;
    logo?: string;
  };
}

interface ESPNEvent {
  id?: string;
  date: string;
  status?: {
    type?: {
      state?: string;
    };
  };
  competitions?: Array<{ competitors?: ESPNCompetitor[]; name?: string }>;
}
