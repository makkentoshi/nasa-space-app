import React from 'react';
import tokens from './design-tokens';

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
  color?: string;
  label?: string;
};

export default function Icon({ size = tokens.sizes.iconMd, color = 'currentColor', label, ...props }: IconProps) {
  const aria = label ? { 'aria-label': label, role: 'img' } : { 'aria-hidden': true };
  const px = typeof size === 'number' ? `${size}px` : size;

  return (
    <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...aria} {...props}>
      <g stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        {/* Default placeholder: circle */}
        <circle cx="12" cy="12" r="9" opacity="0.08" />
        <circle cx="12" cy="12" r="5" />
      </g>
    </svg>
  );
}
