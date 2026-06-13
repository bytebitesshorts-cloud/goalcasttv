// TypeScript interfaces for GoalCast app

export interface Channel {
  id: string;
  name: string;
  logo: string;
  stream: string;
  category: string;
  country: string;
  countryCode: string;
  website?: string;
  quality?: string;
  code?: string;
  active?: boolean;
}

export interface Country {
  name: string;
  code: string;
  flag: string;
  channels: Channel[];
}

export interface SearchResult {
  type: 'country' | 'channel';
  country?: Country;
  channel?: Channel;
  countryName?: string;
}
