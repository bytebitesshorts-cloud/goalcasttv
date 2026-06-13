import { Metadata } from 'next';
import { getAllCountries } from '@/lib/search';
import FavoritesList from '@/components/FavoritesList';

export const metadata: Metadata = {
  title: 'My Favorites | GoalCast',
  description: 'View your saved favorite sports channels and countries.',
};

export default async function FavoritesPage() {
  const countries = await getAllCountries();

  return <FavoritesList allCountries={countries} />;
}
