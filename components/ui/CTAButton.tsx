"use client"

import React from 'react'
import tokens from '@/components/ui/design-tokens'

export interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  icon?: React.ComponentType<any>
}

export default function CTAButton({ variant = 'primary', icon: IconComp, children, className, ...rest }: CTAButtonProps) {
  const bg = variant === 'primary' ? tokens.colors.primary : variant === 'danger' ? tokens.colors.danger : tokens.colors.gray300
  const fg = variant === 'primary' ? tokens.colors.white : tokens.colors.gray800

  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 font-medium ${className || ''}`}
      style={{
        background: bg,
        color: fg,
        padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
        borderRadius: tokens.radii.pill,
        boxShadow: tokens.shadows.elevated,
        fontFamily: tokens.fonts.ui,
        minHeight: 44,
      }}
    >
      {IconComp && <IconComp size={tokens.icons.md} />}
      <span>{children}</span>
    </button>
  )
}