import { type ClassValue, clsx } from 'clsx';

// Utility for classnames (compatible with tailwind)
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

// Slugify a string (e.g. "United States" -> "united-states")
export function slugify(str: string): string {
  return str.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]/g, '');
}

// Format channel name for display
export function formatChannelName(name: string): string {
  return name.trim();
}

// Simple truncate
export function truncate(str: string, max = 20): string {
  return str.length > max ? str.slice(0, max) + '...' : str;
}

// Get simulated viewer count based on channelId and current time
export function getSimulatedViewers(channelId: string): number {
  let hash = 0;
  for (let i = 0; i < channelId.length; i++) {
    hash = channelId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Base viewers range: 100 to 5000
  const base = 100 + Math.abs(hash % 4900);
  
  // Add a multiplier based on hour of day (peaks during evening, e.g. 7-11 PM)
  const hour = new Date().getHours();
  const timeMultiplier = 0.7 + Math.sin(((hour - 6) * Math.PI) / 12) * 0.3; // multiplier between 0.4 and 1.0
  
  // Small dynamic fluctuation using current 30-second window
  const timeSec = Math.floor(Date.now() / 30000);
  const fluctuation = Math.sin(timeSec + hash) * (base * 0.05); // +/- 5% fluctuation
  
  return Math.max(15, Math.round(base * timeMultiplier + fluctuation));
}

// Format viewer count (e.g. 1500 -> "1.5K")
export function formatViewerCount(count: number): string {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
}
