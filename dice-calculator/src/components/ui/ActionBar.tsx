import type { ReactNode } from 'react';

type ActionBarProps = {
  children: ReactNode;
  className?: string;
};

export default function ActionBar({ children, className = '' }: ActionBarProps) {
  return (
    <div className={`mt-5 ${className}`.trim()}>
      {children}
    </div>
  );
}
