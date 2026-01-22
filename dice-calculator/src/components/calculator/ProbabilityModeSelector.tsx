import type { ReactNode } from 'react';
import Card from '@/components/ui/Card';
import CardHeader from '@/components/ui/CardHeader';
import ToggleButton from '@/components/ui/ToggleButton';

export type ProbabilityMode = 'single' | 'range';

type ProbabilityModeSelectorProps = {
  title: string;
  subtitle?: string;
  value?: ProbabilityMode | null;
  onSelect: (mode: ProbabilityMode) => void;
  onBack?: () => void;
  backLabel?: string;
  rightSlot?: ReactNode;
};

export default function ProbabilityModeSelector({
  title,
  subtitle,
  value = null,
  onSelect,
  onBack,
  backLabel,
  rightSlot,
}: ProbabilityModeSelectorProps) {
  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <CardHeader
        title={title}
        subtitle={subtitle}
        onBack={onBack}
        backLabel={backLabel}
        rightSlot={rightSlot}
      />
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Probability mode</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <ToggleButton active={value === 'single'} onClick={() => onSelect('single')} size="sm">
            Single value
          </ToggleButton>
          <ToggleButton active={value === 'range'} onClick={() => onSelect('range')} size="sm">
            Compare
          </ToggleButton>
        </div>
      </div>
    </Card>
  );
}
