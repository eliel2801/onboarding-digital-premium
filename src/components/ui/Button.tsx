import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

const variants = {
  primary:   "bg-white text-neutral-900 hover:bg-neutral-200 shadow-sm hover:shadow-md",
  secondary: "bg-white text-neutral-900 hover:bg-neutral-200 shadow-sm hover:shadow-md",
  outline:   "border border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-600",
  ghost:     "text-neutral-400 hover:text-white hover:bg-neutral-800"
};

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  className,
  disabled,
  type = 'button'
}: ButtonProps) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "px-5 py-2.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 text-sm",
      variants[variant],
      className
    )}
  >
    {children}
  </button>
);
