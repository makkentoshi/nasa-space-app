import React from "react";

export interface AppIconProps {
  src: string;
  alt?: string;
  size?: number;
  rounded?: boolean;
}

export function AppIcon({ src, alt = "App Icon", size = 64, rounded = true }: AppIconProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={rounded ? "rounded-full" : ""}
      style={{ objectFit: "cover" }}
    />
  );
}