import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import type { PolarChartProps } from 'recharts/types/util/types';

const COLORS = {
  accent: "#ff3b5c",
  grid: "rgba(255,255,255,0.1)",
  text: "rgba(255,255,255,0.5)"
}

interface AuthorRadarProps {
  data: {
    spice: number;
    angst: number;
    fluff: number;
    plot: number;
    romance: number;
  }
}
export const AuthorRadar = ({ data }: AuthorRadarProps) => {
  const chartData = [
    { subject: "SMUT", value: data.spice, fullMark: 5 },
    { subject: "ANGST", value: data.angst, fullMark: 5 },
    { subject: "FLUFF", value: data.fluff, fullMark: 5 },
    { subject: "PLOT", value: data.plot, fullMark: 5 },
    { subject: "LOVE", value: data.romance, fullMark: 5 },
  ];

  return (
    <div className="h-[150px] w-full -ml-2 mb-2 shrink-0">
      <h4 className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono text-center mb-1">
        Author Style DNA
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
          <PolarGrid stroke={COLORS.grid} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: COLORS.text, fontSize: 8, fontFamily: "JetBrains Mono, monospace" }}
          />
          <Radar
            name="Style"
            dataKey="value"
            stroke={COLORS.accent}
            fill={COLORS.accent}
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};