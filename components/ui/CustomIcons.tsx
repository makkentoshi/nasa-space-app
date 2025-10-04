export const AlertTriangleIcon = ({ size = 28, color = "#F87171" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 20h20L12 2z" fill={color} />
    <circle cx="12" cy="16" r="1" fill="#fff" />
    <rect x="11" y="10" width="2" height="4" rx="1" fill="#fff" />
  </svg>
);
import React from "react";

export const HomeIcon = ({ size = 28, color = "#53B175" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="10" width="16" height="8" rx="3" fill={color} />
    <polygon points="12,4 20,10 4,10" fill={color} />
  </svg>
);

export const MapIcon = ({ size = 28, color = "#53B175" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="7" width="18" height="10" rx="3" fill={color} />
    <circle cx="12" cy="12" r="3" fill="#fff" />
    <path d="M12 9v3l2 2" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const SOSIcon = ({ size = 28, color = "#53B175" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill={color} />
    <text x="12" y="15" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="bold" alignmentBaseline="middle" dominantBaseline="middle">SOS</text>
  </svg>
);

export const ChatIcon = ({ size = 28, color = "#53B175" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="6" width="18" height="12" rx="6" fill={color} />
    <circle cx="8" cy="12" r="1.5" fill="#fff" />
    <circle cx="12" cy="12" r="1.5" fill="#fff" />
    <circle cx="16" cy="12" r="1.5" fill="#fff" />
  </svg>
);

export const FriendsIcon = ({ size = 28, color = "#53B175" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="10" r="3" fill={color} />
    <circle cx="16" cy="10" r="3" fill={color} />
    <rect x="4" y="15" width="6" height="4" rx="2" fill={color} />
    <rect x="14" y="15" width="6" height="4" rx="2" fill={color} />
  </svg>
);