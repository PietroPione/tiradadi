import type { ReactNode } from 'react';

export type DebugLine = {
  label: string;
  value: ReactNode;
};

type DebugPanelProps = {
  title?: string;
  lines: DebugLine[];
};

export default function DebugPanel({ title = 'Debug', lines }: DebugPanelProps) {
  return (
    <div className="mt-4 border-2 border-dashed border-zinc-400 bg-white px-4 py-4 sm:px-6">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-700">{title}</h3>
      <div className="mt-3 space-y-2 text-xs text-zinc-600">
        {lines.map((line) => (
          <p key={line.label}>
            {line.label}: <span className="font-mono text-zinc-900">{line.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
