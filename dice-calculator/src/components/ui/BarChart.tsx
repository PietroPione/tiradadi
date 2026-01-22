import type { ReactNode } from 'react';

type Point = {
  x: number;
  y: number;
};

type Series = {
  name: string;
  points: Point[];
  color: string;
};

type BarChartProps = {
  series: Series[];
  xLabel: string;
  yLabel: string;
  xUnit?: string;
  yUnit?: string;
  height?: number;
  footer?: ReactNode;
};

const COLORS = ['#111827', '#2563eb', '#16a34a', '#db2777', '#f97316', '#7c3aed'];

const formatAxisLabel = (label: string, unit?: string) => {
  if (!unit) {
    return label;
  }
  return `${label} (${unit})`;
};

export default function BarChart({
  series,
  xLabel,
  yLabel,
  xUnit,
  yUnit,
  height = 260,
  footer,
}: BarChartProps) {
  if (!series.length) {
    return null;
  }

  const xValues = Array.from(new Set(series.flatMap((item) => item.points.map((point) => point.x))))
    .sort((a, b) => a - b);
  const yValues = series.flatMap((item) => item.points.map((point) => point.y));
  const maxY = Math.max(0, ...yValues);
  const ySpan = maxY || 1;

  const width = 640;
  const padding = { top: 16, right: 20, bottom: 42, left: 50 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const xStep = innerWidth / Math.max(1, xValues.length);
  const groupWidth = xStep * 0.7;
  const barGap = Math.min(8, groupWidth * 0.12);
  const barWidth = (groupWidth - barGap * (series.length - 1)) / Math.max(1, series.length);

  const yScale = (value: number) => padding.top + innerHeight - (value / ySpan) * innerHeight;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + innerHeight}
          stroke="#111827"
          strokeWidth={2}
        />
        <line
          x1={padding.left}
          y1={padding.top + innerHeight}
          x2={padding.left + innerWidth}
          y2={padding.top + innerHeight}
          stroke="#111827"
          strokeWidth={2}
        />
        {xValues.map((xValue, groupIndex) => {
          const groupX = padding.left + groupIndex * xStep + (xStep - groupWidth) / 2;
          return series.map((item, seriesIndex) => {
            const point = item.points.find((entry) => entry.x === xValue);
            const barHeight = point ? innerHeight - (yScale(point.y) - padding.top) : 0;
            const x = groupX + seriesIndex * (barWidth + barGap);
            const y = yScale(point ? point.y : 0);
            const color = item.color || COLORS[seriesIndex % COLORS.length];
            return (
              <g key={`${item.name}-${xValue}`}>
                <rect
                  x={x}
                  y={y}
                  width={Math.max(2, barWidth)}
                  height={Math.max(1, barHeight)}
                  fill={color}
                />
              </g>
            );
          });
        })}
        {xValues.map((value, index) => {
          const x = padding.left + index * xStep + xStep / 2;
          return (
            <text
              key={`label-${value}`}
              x={x}
              y={padding.top + innerHeight + 20}
              textAnchor="middle"
              className="fill-zinc-600 text-[10px]"
            >
              {value}
            </text>
          );
        })}
        <text
          x={padding.left}
          y={height - 8}
          className="fill-zinc-600 text-[10px]"
        >
          {formatAxisLabel(xLabel, xUnit)}
        </text>
        <text
          x={8}
          y={padding.top - 6}
          className="fill-zinc-600 text-[10px]"
        >
          {formatAxisLabel(yLabel, yUnit)}
        </text>
      </svg>
      <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
        {series.map((item, index) => (
          <span key={item.name} className="flex items-center gap-2">
            <span
              className="h-2 w-6"
              style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
            />
            {item.name}
          </span>
        ))}
      </div>
      {footer ? <div className="mt-3">{footer}</div> : null}
    </div>
  );
}
