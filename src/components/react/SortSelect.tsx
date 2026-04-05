import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SORT_OPTIONS } from '@/types/filters';
import type { SortOption } from '@/types/filters';

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export default function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-[11px] text-white/40 uppercase tracking-widest font-bold">
        Sort
      </span>
      <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
        <SelectTrigger
          className="min-h-[44px] w-auto gap-2 rounded-xl border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70 shadow-none hover:border-white/20 hover:text-white focus:ring-[var(--lesbian-pink)]/30 data-[size=default]:h-auto"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          className="rounded-xl border-white/10 backdrop-blur-xl"
          style={{ backgroundColor: 'rgba(30, 15, 20, 0.95)' }}
          position="popper"
          sideOffset={6}
        >
          {SORT_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="rounded-lg text-sm text-white/70 focus:bg-[var(--lesbian-pink)]/15 focus:text-white"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
