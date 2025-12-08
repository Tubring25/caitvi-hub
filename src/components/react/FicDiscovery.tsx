import { useState, useMemo } from "react";
import { motion, AnimatePresence} from 'motion/react';
import SearchBar from "./SearchBar";
import FilterBar from "./FilterBar";
import type { FilterState } from "./FilterBar";
import { RATING_CONFIG, type Rating } from '@/types/fic'; 
import { Sparkles } from "lucide-react";



export interface Fic {
  id: string;
  title: string;
  author: string;
  rating: Rating;
  category: string;
  status: 'completed' | 'ongoing';
}

const MOCK_FICS = [
  {
    id: "1",
    title: "Oil and Water",
    author: "PiltoverWriter",
    rating: "T",
    category: "Canon Divergence",
    summary: "After the Council explosion, Caitlyn tries to rebuild order while Vi loses herself hunting Jinx. A story about breaking apart and coming back together.",
    tags: ["Angst", "Slow Burn", "Hurt/Comfort"],
    visualTags: ["🤕", "🌧️", "👮‍♀️"],
    link: "https://archiveofourown.org/",
    isTranslated: true,
    status: "Completed",
    stats: { spice: 2, angst: 4, fluff: 1, words: 45, kudos: 1205 },
    quote: "You're the oil to my water, Vi. We don't mix, but god, do we burn when we touch.",
    authorStats: { spice: 1, angst: 5, fluff: 1, plot: 5, romance: 3 }
  },
  {
    id: "2",
    title: "Binding Instincts",
    author: "EnforcerMain",
    rating: "E",
    category: "Omegaverse",
    summary: "At a Piltover gala, pheromones mask lies. It's a game of instinct versus reason, and Caitlyn is losing control.",
    tags: ["Alpha/Omega", "Possessive", "PWP"],
    visualTags: ["🔥", "⛓️", "🐺"],
    link: "https://archiveofourown.org/",
    isTranslated: false,
    status: "Ongoing",
    stats: { spice: 5, angst: 2, fluff: 2, words: 22, kudos: 890 },
    quote: "Don't look at me like that, Cupcake, unless you want me to bite.",
    authorStats: { spice: 5, angst: 3, fluff: 2, plot: 4, romance: 4 }
  }
];

export default function FileDiscovery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    rating: undefined,
    status: undefined
  })

  const ratingOptions = Object.entries(RATING_CONFIG).map(([key, config]) => ({
    value: key as Rating,
    label: config.label,
    className: config.color
  }));

  const filteredFics = useMemo(() => {
    return MOCK_FICS.filter(fic => {
      
      // Search Filters
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = fic.title.toLowerCase().includes(q) ||
        fic.author.toLowerCase().includes(q) ||
        fic.tags.some(t => t.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Rating Filters
      if (filters.rating && fic.rating !== filters.rating) return false;

      // Status Filters
      if (filters.status && fic.status !== filters.status) return false;

      return true;
    })
  }, [searchQuery, filters])

  return (
    <section id="featured" className="py-20 px-4 max-w-7xl mx-auto min-h-screen">

      {/* Titles */}
      <div className="text-center mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 30}}
          whileInView={{ opacity: 1, y: 0}}
          viewport={{ once: true}}
          transition={{ duration: 0.6, delay: 0.2}}
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Find Your Next Obsession
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Curated collections sorted by spice, angst, and everything in between.
          </p>
        </motion.div>


        {/* Search and Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 30}}
          whileInView={{ opacity: 1, y: 0}}
          viewport={{ once: true}}
          transition={{ duration: 0.6, delay: 0.2}}
          className="mt-10 sticky top-20 z-40"
        >
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <FilterBar filters={filters} onChange={setFilters} ratingOptions={ratingOptions} />
        </motion.div>

        {/* Fic List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredFics.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30}}
            whileInView={{ opacity: 1, y: 0}}
            viewport={{ once: true}}
            transition={{ duration: 0.6, delay: 0.2}}
          >
            <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="text-white/20 w-10 h-10" />
            </div>
            <h3 className="text-2xl font-serif text-white mb-2">No fics found</h3>
            <p className="text-white/50">Try adjusting your filters or search query.</p>
          </motion.div>
        )}
      </div>
    </section>
  )
}