export interface WelcomeDestination {
  id: string;
  name: string;
  subtitle: string;
  image: string;
}

export const WELCOME_DESTINATIONS: WelcomeDestination[] = [
  {
    id: 'goa',
    name: 'Goa',
    subtitle: 'Sunlit beaches & coastal villas',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=80',
  },
  {
    id: 'manali',
    name: 'Manali',
    subtitle: 'Snow peaks & quiet wooden cabins',
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=80',
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    subtitle: 'Royal heritage & warm courtyards',
    image:
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=2200&q=80',
  },
  {
    id: 'kerala',
    name: 'Kerala',
    subtitle: 'Backwater calm & palm-lined stays',
    image:
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=2200&q=80',
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    subtitle: 'Sea views & an iconic skyline',
    image:
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=2200&q=80',
  },
];

export const WELCOME_TIMINGS = {
  logo: 0,
  title: 1000,
  tagline: 2000,
  destinations: 3000,
  cta: 4000,
} as const;

export const WELCOME_ROTATION_MS = 5200;

export function getNextDestinationIndex(current: number, length: number): number {
  if (!Number.isFinite(current) || length <= 0) return 0;

  const next = Math.trunc(current) + 1;
  return ((next % length) + length) % length;
}
