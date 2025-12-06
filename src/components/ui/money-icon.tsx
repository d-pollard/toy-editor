import React from 'react';
import { cn } from '@/lib/utils';

interface MoneyIconProps {
  className?: string;
  size?: number;
}

const MoneyIcon: React.FC<MoneyIconProps> = ({ className, size = 16 }) => {
  return (
    <img
      src="/money-icon.png"
      alt="Credits"
      className={cn("inline-block", className)}
      style={{ width: size, height: size }}
    />
  );
};

export { MoneyIcon };
