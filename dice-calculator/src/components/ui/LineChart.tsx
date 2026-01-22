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

type LineChartProps = {
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

const buildPath = (points: Array<[number, number]>) => {
  if (!points.length) {
    return '';
  }
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point[0]} ${point[1]}`).join(' ');
};

export default function LineChart({ series, xLabel, yLabel, xUnit, yUnit, height = 240, footer }: LineChartProps) {
  if (!series.length) {
    return null;
  }
  const allPoints = series.flatMap((item) => item.points);
  const minX = Math.min(...allPoints.map((point) => point.x));
  const maxX = Math.max(...allPoints.map((point) => point.x));
  const minY = Math.min(...allPoints.map((point) => point.y));
  const maxY = Math.max(...allPoints.map((point) => point.y));
  const xSpan = maxX - minX || 1;
  const ySpan = maxY - minY || 1;

  const width = 560;
  const padding = { top: 16, right: 20, bottom: 36, left: 44 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const xScale = (value: number) => padding.left + ((value - minX) / xSpan) * innerWidth;
  const yScale = (value: number) => padding.top + innerHeight - ((value - minY) / ySpan) * innerHeight;

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
        {series.map((item, index) => {
          const color = item.color || COLORS[index % COLORS.length];
          const points = item.points.map((point) => [xScale(point.x), yScale(point.y)] as [number, number]);
          return (
            <g key={item.name}>
              <path
                d={buildPath(points)}
                fill="none"
                stroke={color}
                strokeWidth={2}
              />
              {points.map((point, pointIndex) => (
                <circle
                  key={`${item.name}-${pointIndex}`}
                  cx={point[0]}
                  cy={point[1]}
                  r={3}
                  fill={color}
                />
              ))}
            </g>
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
