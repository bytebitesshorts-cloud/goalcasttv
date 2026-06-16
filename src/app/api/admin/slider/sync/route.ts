import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Fetch all major FIFA World Cup 2026 Qualifier regions
    const leagues = [
      'fifa.worldq.conmebol', // South America
      'fifa.worldq.uefa',     // Europe
      'fifa.worldq.concacaf', // North America
      'fifa.worldq.afc',      // Asia
      'fifa.worldq.caf',      // Africa
    ];

    const responses = await Promise.all(
      leagues.map(league => 
        fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard`, {
          cache: 'no-store',
          headers: { 'Accept': 'application/json' }
        })
      )
    );

    let allEvents: any[] = [];
    
    for (const res of responses) {
      if (res.ok) {
        const data = await res.json();
        if (data.events && Array.isArray(data.events)) {
          allEvents = [...allEvents, ...data.events];
        }
      }
    }

    // Map ESPN events to our Slide format
    const slides = allEvents.map((event: any) => {
      // Find a valid image, preferably a team logo
      let imageUrl = '/placeholder.png'; // Fallback
      
      const competition = event.competitions?.[0];
      if (competition) {
        const homeTeamLogo = competition.competitors?.find((c: any) => c.homeAway === 'home')?.team?.logo;
        const awayTeamLogo = competition.competitors?.find((c: any) => c.homeAway === 'away')?.team?.logo;
        // Use home team logo if available, else away team logo
        imageUrl = homeTeamLogo || awayTeamLogo || imageUrl;
      }

      return {
        title: event.name || 'Live Match',
        image: imageUrl,
        // Default to a generic channel ID or home page so it plays in "our player". 
        // Admin can edit this link.
        link: '/watch/espn', 
      };
    });

    return new Response(JSON.stringify({ slides }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error syncing live matches:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to sync live matches' }), { status: 500 });
  }
}
