import type { ReactNode } from 'react';

type OptionGroupProps = {
  title?: string;
  layout?: 'stack' | 'grid2' | 'grid3';
  children: ReactNode;
  className?: string;
};

const layoutClass: Record<NonNullable<OptionGroupProps['layout']>, string> = {
  stack: 'space-y-3',
  grid2: 'grid grid-cols-1 gap-3 sm:grid-cols-2',
  grid3: 'grid grid-cols-1 gap-3 sm:grid-cols-3',
};

export default function OptionGroup({
  title,
  layout = 'stack',
  children,
  className = '',
}: OptionGroupProps) {
  return (
    <div className={className}>
      {title ? (
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-900">{title}</p>
      ) : null}
      <div className={`mt-2 ${layoutClass[layout]}`.trim()}>
        {children}
      </div>
    </div>
  );
}
