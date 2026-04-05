import FilterPill from './FilterPill';
import { WORD_COUNT_RANGES } from '@/types/filters';
import type { WordCountBucket } from '@/types/filters';

const BUCKETS = Object.entries(WORD_COUNT_RANGES) as [WordCountBucket, typeof WORD_COUNT_RANGES[WordCountBucket]][];

interface WordCountSelectorProps {
  value: WordCountBucket;
  onChange: (value: WordCountBucket) => void;
}

export default function WordCountSelector({ value, onChange }: WordCountSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-white/40 uppercase tracking-widest font-bold shrink-0">
        Words
      </span>
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {BUCKETS.map(([bucket, config]) => (
          <FilterPill
            key={bucket}
            active={value === bucket}
            onClick={() => onChange(value === bucket ? 'any' : bucket)}
          >
            <span title={config.tooltip}>{config.label}</span>
          </FilterPill>
        ))}
      </div>
    </div>
  );
}
