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
    <div className="flex w-full min-w-0 items-center gap-3 xl:w-auto">
      <span className="w-14 shrink-0 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
        Words
      </span>
      <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:overflow-visible xl:pb-0">
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
