import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({ children, className }: CardProps) {
  return (
    <div className={`border-2 border-zinc-900 bg-white ${className ?? ''}`.trim()}>
      {children}
    </div>
  );
}
