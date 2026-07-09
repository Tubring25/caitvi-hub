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
  plot: number;
  romance: number;
}

export type ContentSignal =
  | 'heavy_angst'
  | 'slow_burn'
  | 'tooth_rotting_fluff'
  | 'canon_adjacent'
  | 'modern_au'
  | 'long_read'
  | 'explicit'
  | 'comfort_read';

export const CONTENT_SIGNAL_CONFIG: Record<ContentSignal, { label: string }> = {
  heavy_angst: { label: 'Heavy Angst' },
  slow_burn: { label: 'Slow Burn' },
  tooth_rotting_fluff: { label: 'Tooth-Rotting Fluff' },
  canon_adjacent: { label: 'Canon Adjacent' },
  modern_au: { label: 'Modern AU' },
  long_read: { label: 'Long Read' },
  explicit: { label: 'Explicit' },
  comfort_read: { label: 'Comfort Read' },
};

// Fic Types
export interface Fic {
  id: string;
  title: string;
  author: string;
  summary: string;
  rating: Rating;
  tags: string[];
  category: string;
  status: 'completed' | 'ongoing';
  isTranslated: boolean;
  state: FicState;
  authorStats?: FicState;
  stats: {
    words: number;
    chapters: number;
    kudos: number;
    hits: number;
    comments: number;
    bookmarks: number;
  };
  quote: string;
  curatorNote: string;
  contentSignals: ContentSignal[];
  sourceLastCheckedAt: number | null;
  link: string;
}

// Reading Status Types
export type ReadingStatus = 'none' | 'bookmarked' | 'reading' | 'completed' | 'dropped';
