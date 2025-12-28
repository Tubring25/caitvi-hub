import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Rating } from '@/types/fic';

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

const FilterButton = ({ active, onClick, children, className }: FilterButtonProps) => {
  return (
    <motion.button
      whileHover={{scale: 1.05}}
      whileTap={{scale: 0.95}}
      onClick={onClick}
      className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono tracking-wider uppercase border transition-all', active ?
        'bg-accent/20 border-accent text-white shadow-sm' :
        'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:bg-white/10',
        active ? className : ''
      )}
    >
      {children}
    </motion.button>
  )
}

export interface FilterState {
  rating?: Rating;
  status?: 'completed' | 'ongoing';
}

interface FilterBarProps {
  filters: FilterState,
  onChange: (newFilters: FilterState) => void;
  ratingOptions: Array<{label: string, value: Rating, className: string}>;
}

export default function FilterBar({ filters, onChange, ratingOptions}: FilterBarProps) {
  const toggleRating = (r: Rating) => {
    onChange({ ...filters, rating: filters.rating === r ? undefined : r });
  };

  const toggleStatus = (status: 'completed' | 'ongoing') => {
    onChange({ ...filters, status: filters.status === status ? undefined : status });
  };

  return (
    <div className='flex flex-wrap justify-center gap-3 mt-6'>
      {/* Rating Filters */}
      {ratingOptions.map(option => (
        <FilterButton key={option.value} active={filters.rating === option.value} onClick={() => toggleRating(option.value)} className={cn(option.className, 'border-transparent')}>
          {option.label}
        </FilterButton>
      ))}

      {/* Status Filters */}
      <FilterButton active={filters.status === 'completed'} onClick={() => toggleStatus('completed')}>
        <Check className='size-4' />
        Completed
      </FilterButton>
      <FilterButton active={filters.status === 'ongoing'} onClick={() => toggleStatus('ongoing')}>
        <X className='size-4' />
        Ongoing
      </FilterButton>
    </div>
  )
};