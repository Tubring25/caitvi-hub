// Rating Types
export type Rating = 'G' | 'T' | 'M' | 'E';

// Rating Configuration
export const RATING_CONFIG: Record<Rating, { label: string; color: string; description: string }> = {
  G: { label: 'G', color: 'bg-green-500', description: 'General Audiences' },
  T: { label: 'T', color: 'bg-blue-500', description: 'Teen And Up Audiences' },
  M: { label: 'M', color: 'bg-yellow-500', description: 'Mature' },
  E: { label: 'E', color: 'bg-red-500', description: 'Explicit' },
};

export interface FicState {
  spice: number;
  angst: number;
  fluff: number;
}

export interface AuthorStats {
  spice: number;
  angst: number;
  fluff: number;
  plot: number;
  romance: number;
}

// Fic Types
export interface Fic {
  id: string;
  title: string;
  author: string;
  summary: string;
  rating: Rating;
  category: string;
  status: 'completed' | 'ongoing';
  isTranslated: boolean;
  state: FicState;
  stats: {
    words: number;
    chapters: number;
    kudos: number;
    hits: number;
    comments: number;
    bookmarks: number;
  };
  quote: string;
  authorStats: AuthorStats;
  originLink: string;
}

// Reading Status Types
export type ReadingStatus = "none" | "reading" | "completed" | "dropped";