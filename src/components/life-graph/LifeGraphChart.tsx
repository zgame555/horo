import type { GraphColumn, Zone } from "../../lib/lifeGraph";

interface LifeGraphChartProps {
  graph: GraphColumn[];
  highlightColumn: number;
}

const WIDTH = 720;
const HEIGHT = 300;
const PAD = { top: 20, right: 16, bottom: 44, left: 76 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;
const MAX = 12;

const BANDS: { zone: Zone; from: number; to: number; color: string }[] = [
  { zone: "สวรรค์", from: 8.5, to: 12.5, color: "var(--zone-good)" },
  { zone: "โลกมนุษย์", from: 4.5, to: 8.5, color: "var(--zone-mid)" },
  { zone: "นรกภูมิ", from: 0.5, to: 4.5, color: "var(--zone-bad)" },
];

const x = (i: number): number => PAD.left + (PLOT_W / MAX) * (i + 0.5);
const y = (v: number): number => PAD.top + PLOT_H * (1 - (v - 0.5) / MAX);

export const zoneColor = (zone: Zone): string =>
  BANDS.find((b) => b.zone === zone)?.color ?? "currentColor";

export function LifeGraphChart({ graph, highlightColumn }: LifeGraphChartProps) {
  const points = graph.map((c, i) => `${x(i)},${y(c.value)}`).join(" ");
  const summary = graph.map((c) => `${c.house} ${c.value}`).join(", ");

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="block w-full min-w-[600px]"
        role="img"
        aria-label={`กราฟชีวิตเลข 12 ตัว: ${summary}`}
      >
        {BANDS.map((b) => (
          <g key={b.zone}>
            <rect x={PAD.left} y={y(b.to)} width={PLOT_W} height={y(b.from) - y(b.to)} fill={b.color} opacity={0.1} />
            <text x={PAD.left - 10} y={(y(b.to) + y(b.from)) / 2 + 4} textAnchor="end" fontSize={13} fill={b.color}>
              {b.zone}
            </text>
          </g>
        ))}
        <rect
          x={x(highlightColumn) - PLOT_W / MAX / 2}
          y={PAD.top}
          width={PLOT_W / MAX}
          height={PLOT_H}
          fill="var(--accent)"
          opacity={0.12}
        />
        <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" />
        {graph.map((c, i) => (
          <g key={c.house}>
            <circle cx={x(i)} cy={y(c.value)} r={5} fill={zoneColor(c.zone)} stroke="white" strokeWidth={2} />
            <text x={x(i)} y={y(c.value) - 11} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--foreground)">
              {c.value}
            </text>
            <text
              x={x(i)}
              y={HEIGHT - 20}
              textAnchor="middle"
              fontSize={12}
              fontWeight={i === highlightColumn ? 700 : 400}
              fill="var(--foreground)"
              opacity={i === highlightColumn ? 1 : 0.7}
            >
              {c.house}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
