'use client';

import { Heart } from 'lucide-react';
import { useUserPrefs } from '@/context/UserPrefsContext';
import type { Channel, Country } from '@/types';

// ─── Channel Favorite Button ──────────────────────────────────────────────────

interface ChannelFavButtonProps {
  type: 'channel';
  channel: Channel;
  className?: string;
}

interface CountryFavButtonProps {
  type: 'country';
  country: Country;
  className?: string;
}

type FavoriteButtonProps = ChannelFavButtonProps | CountryFavButtonProps;

export default function FavoriteButton(props: FavoriteButtonProps) {
  const { toggleFavChannel, isFavChannel, toggleFavCountry, isFavCountry, mounted } =
    useUserPrefs();

  if (!mounted) return null;

  if (props.type === 'channel') {
    const { channel, className } = props;
    const isFav = isFavChannel(channel.id);

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFavChannel(channel);
    };

    return (
      <button
        onClick={handleClick}
        aria-label={isFav ? `Remove ${channel.name} from favorites` : `Add ${channel.name} to favorites`}
        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
        className={`
          group/fav absolute bottom-2 right-2 z-10
          flex items-center justify-center
          w-6 h-6 rounded-full
          transition-all duration-200
          ${isFav
            ? 'bg-red-500/90 text-white shadow-md shadow-red-500/30'
            : 'bg-zinc-900/60 dark:bg-zinc-800/80 text-zinc-300 hover:bg-red-500/80 hover:text-white backdrop-blur-sm'
          }
          ${className ?? ''}
        `}
      >
        <Heart
          className={`w-3 h-3 transition-all duration-200 ${
            isFav ? 'fill-current scale-110' : 'group-hover/fav:scale-110'
          }`}
          aria-hidden="true"
        />
      </button>
    );
  }

  // Country
  const { country, className } = props;
  const isFav = isFavCountry(country.code);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavCountry(country);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={isFav ? `Remove ${country.name} from favorites` : `Add ${country.name} to favorites`}
      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
      className={`
        group/fav absolute bottom-2 right-2 z-10
        flex items-center justify-center
        w-6 h-6 rounded-full
        transition-all duration-200
        ${isFav
          ? 'bg-red-500/90 text-white shadow-md shadow-red-500/30'
          : 'bg-zinc-900/60 dark:bg-zinc-800/80 text-zinc-300 hover:bg-red-500/80 hover:text-white backdrop-blur-sm'
        }
        ${className ?? ''}
      `}
    >
      <Heart
        className={`w-3 h-3 transition-all duration-200 ${
          isFav ? 'fill-current scale-110' : 'group-hover/fav:scale-110'
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
