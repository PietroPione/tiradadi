import type { ReactNode } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';

type SectionBlockProps = {
  title: string;
  variant?: 'plain' | 'bar';
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export default function SectionBlock({
  title,
  variant = 'plain',
  children,
  className = '',
  contentClassName = 'mt-3',
}: SectionBlockProps) {
  return (
    <div className={className}>
      <SectionHeader title={title} variant={variant} />
      <div className={contentClassName}>{children}</div>
    </div>
  );
}
