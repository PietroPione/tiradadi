type SectionHeaderProps = {
  title: string;
  variant?: 'plain' | 'bar';
  className?: string;
};

export default function SectionHeader({ title, variant = 'plain', className = '' }: SectionHeaderProps) {
  if (variant === 'bar') {
    return (
      <div className={`bg-zinc-900 px-3 py-2 ${className}`.trim()}>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-white">{title}</p>
      </div>
    );
  }

  return (
    <p className={`text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600 ${className}`.trim()}>
      {title}
    </p>
  );
}
