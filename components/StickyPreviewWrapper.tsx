"use client";

import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function StickyPreviewWrapper({ children, className = "", onClick }: Props) {
  return (
    <div className={`${className} flex justify-center transition-all duration-300`} onClick={onClick}>
      <div className="transition-all duration-300 relative w-full">
        {children}
      </div>
    </div>
  );
}
