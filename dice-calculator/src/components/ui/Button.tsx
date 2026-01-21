import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'outline' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-2 text-xs tracking-[0.2em]',
  md: 'px-4 py-2 text-sm tracking-[0.18em]',
  lg: 'py-3 text-base tracking-[0.2em]',
};

export default function Button({
  variant = 'outline',
  size = 'md',
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const base = 'border-2 border-zinc-900 font-semibold uppercase transition-colors hover:bg-zinc-900 hover:text-white';
  const variantClasses = variant === 'solid'
    ? 'bg-zinc-900 text-white'
    : 'bg-white text-zinc-900';
  const width = fullWidth ? 'w-full' : '';
  return (
    <button
      type={type}
      className={`${base} ${variantClasses} ${sizeClasses[size]} ${width} ${className}`.trim()}
      {...props}
    />
  );
}
