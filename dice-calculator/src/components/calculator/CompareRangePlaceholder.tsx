import type { ReactNode } from 'react';
import Card from '@/components/ui/Card';
import CardHeader from '@/components/ui/CardHeader';
import ActionBar from '@/components/ui/ActionBar';
import Button from '@/components/ui/Button';

type CompareRangePlaceholderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  rightSlot?: ReactNode;
  onUseSingle: () => void;
  onChangeMode: () => void;
};

export default function CompareRangePlaceholder({
  title,
  subtitle,
  onBack,
  backLabel,
  rightSlot,
  onUseSingle,
  onChangeMode,
}: CompareRangePlaceholderProps) {
  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <CardHeader
        title={title}
        subtitle={subtitle}
        onBack={onBack}
        backLabel={backLabel}
        rightSlot={rightSlot}
      />
      <div className="mt-4 border-2 border-zinc-900 bg-zinc-100 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-700">
        Compare is coming soon.
      </div>
      <ActionBar>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onUseSingle} size="sm">Use single value</Button>
          <Button onClick={onChangeMode} size="sm">Change mode</Button>
        </div>
      </ActionBar>
    </Card>
  );
}
