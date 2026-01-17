import type { ReactNode } from 'react';
import Card from '@/components/ui/Card';
import type { DebugLine } from '@/components/ui/DebugPanel';
import DebugPanel from '@/components/ui/DebugPanel';

type SummaryItem = {
  label: string;
  value: string;
};

type SummarySection = {
  title: string;
  items: SummaryItem[];
};

type NewUiSummaryProps = {
  title: string;
  sections: SummarySection[];
  results: ReactNode;
  debugLines: DebugLine[];
  onBackToStart: () => void;
  onReroll: () => void;
};

export default function NewUiSummary({
  title,
  sections,
  results,
  debugLines,
  onBackToStart,
  onReroll,
}: NewUiSummaryProps) {
  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onReroll}
            className="border-2 border-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
          >
            Re-roll
          </button>
          <button
            type="button"
            onClick={onBackToStart}
            className="border-2 border-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
          >
            Back to start
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">{section.title}</p>
            <div className="mt-2 grid gap-2 text-sm">
              {section.items.map((item) => (
                <p key={item.label} className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
                  <span className="text-zinc-600">{item.label}</span>
                  <span className="font-mono text-zinc-900">{item.value}</span>
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        {results}
      </div>

      <DebugPanel lines={debugLines} />
    </Card>
  );
}
