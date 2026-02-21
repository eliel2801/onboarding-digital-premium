import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const Card = ({ children, className, onClick, style }: CardProps) => (
  <div
    onClick={onClick}
    style={style}
    className={cn(
      "bg-neutral-900 rounded-2xl border border-neutral-800 shadow-sm overflow-hidden",
      onClick && "cursor-pointer hover:shadow-md hover:border-neutral-700 transition-all duration-300",
      className
    )}
  >
    {children}
  </div>
);
