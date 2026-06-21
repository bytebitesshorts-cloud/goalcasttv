const BASE_URL = 'https://goalcast-tv.vercel.app';

export interface StreamServer {
  label: string;
  url: string;
  embedCode: string;
}

export interface Match {
  id: string;
  title: string;
  sport: string;
  teamA: { name: string; logo: string };
  teamB: { name: string; logo: string };
  thumbnail: string;
  isLive: boolean;
  streams: StreamServer[];
  createdAt: string;
}

export interface AppConfig {
  adEnabled: boolean;
  adWebUrl: string;
  adDuration: number;
  appName: string;
  baseUrl: string;
}

export async function fetchMatches(): Promise<Match[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/app/matches`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchConfig(): Promise<AppConfig> {
  try {
    const res = await fetch(`${BASE_URL}/api/app/config`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed');
    return await res.json();
  } catch {
    return {
      adEnabled: false,
      adWebUrl: '',
      adDuration: 15,
      appName: 'Goal Cast',
      baseUrl: BASE_URL,
    };
  }
}
