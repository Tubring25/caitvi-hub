// Rating Types
export type Rating = 'G' | 'T' | 'M' | 'E';

// Rating Configuration
export const RATING_CONFIG: Record<Rating, { label: string; color: string; description: string }> = {
  G: { label: 'G', color: 'bg-green-500', description: 'General Audiences' },
  T: { label: 'T', color: 'bg-blue-500', description: 'Teen And Up Audiences' },
  M: { label: 'M', color: 'bg-yellow-500', description: 'Mature' },
  E: { label: 'E', color: 'bg-red-500', description: 'Explicit' },
};

// Fic Types
export interface Fic {
  id: string;
  title: string;
  author: string;
  rating: Rating;
  category: string;
  status: 'completed' | 'ongoing';
}