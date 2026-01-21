import type { ButtonHTMLAttributes } from 'react';
import Button from '@/components/ui/Button';

type ToggleButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active: boolean;
  size?: 'sm' | 'md';
  compact?: boolean;
};

export default function ToggleButton({
  active,
  size = 'md',
  compact = false,
  className = '',
  ...props
}: ToggleButtonProps) {
  const resolvedSize = compact ? 'sm' : size;
  return (
    <Button
      variant={active ? 'solid' : 'outline'}
      size={resolvedSize}
      className={className}
      {...props}
    />
  );
}
