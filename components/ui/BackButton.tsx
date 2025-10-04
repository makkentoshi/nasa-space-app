"use client"

import React from 'react'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ onClick, ariaLabel = 'Back' }: { onClick: () => void, ariaLabel?: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="fixed left-4 top-4 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md border z-50 hover:bg-gray-100"
    >
      <ArrowLeft className="h-4 w-4" />
    </button>
  )
}