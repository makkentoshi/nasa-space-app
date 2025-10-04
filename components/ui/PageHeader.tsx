import React from "react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  bgColor?: string;
  textColor?: string;
}

export function PageHeader({ title, subtitle, icon, bgColor = "#FCFCFC", textColor = "#37393F" }: PageHeaderProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-8 rounded-2xl shadow-sm mb-4"
      style={{ background: bgColor, color: textColor }}
    >
      {icon && <div className="mb-4">{icon}</div>}
      <h1 className="text-3xl font-bold mb-2 tracking-tight">{title}</h1>
      {subtitle && <p className="text-base opacity-80 text-center max-w-xs font-medium">{subtitle}</p>}
    </div>
  );
}