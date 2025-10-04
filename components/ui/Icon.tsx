"use client"

import React from 'react'
import tokens from '@/components/ui/design-tokens'

export interface IconProps {
  icon?: React.ComponentType<any>
  size?: number
  color?: string
  ariaLabel?: string
  className?: string
}

export default function Icon({ icon: IconComp, size = tokens.icons.md, color, ariaLabel, className }: IconProps) {
  if (!IconComp) return null

  const style = {
    width: `${size}px`,
    height: `${size}px`,
    color: color || tokens.colors.gray800,
  } as React.CSSProperties

  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <IconComp size={size} color={color || tokens.colors.gray800} aria-hidden={ariaLabel ? undefined : true} aria-label={ariaLabel} />
    </span>
  )
}