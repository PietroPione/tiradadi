import type { ReactNode } from 'react';
import Button from '@/components/ui/Button';

type CardHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  rightSlot?: ReactNode;
};

export default function CardHeader({
  title,
  subtitle,
  onBack,
  backLabel = 'Back',
  rightSlot,
}: CardHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>
        ) : null}
        {onBack ? (
          <Button onClick={onBack} size="sm" className="mt-2">
            {backLabel}
          </Button>
        ) : null}
      </div>
      {rightSlot ? <div className="self-start">{rightSlot}</div> : null}
    </div>
  );
}
