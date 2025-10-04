import React from 'react';
import tokens from './design-tokens';
import { cn } from '../../lib/utils';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'emergency' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

export default function CTAButton({ variant = 'primary', size = 'md', className, children, ...rest }: Props) {
  const bg = variant === 'primary' ? tokens.colors.primary : variant === 'emergency' ? tokens.colors.emergency : 'transparent';
  const color = variant === 'ghost' ? tokens.colors.primary : '#fff';
  const pad = size === 'sm' ? '8px 12px' : size === 'lg' ? '14px 20px' : '10px 16px';

  return (
    <button
      {...rest}
      className={cn('cta-button', className)}
      style={{
        background: bg,
        color,
        padding: pad,
        borderRadius: tokens.radii.md,
        fontFamily: tokens.fonts.primary,
        fontSize: tokens.fontSizes.md,
        boxShadow: tokens.shadows.sm,
        border: variant === 'ghost' ? `1px solid ${tokens.colors.border}` : 'none',
      }}
    >
      {children}
    </button>
  );
}
