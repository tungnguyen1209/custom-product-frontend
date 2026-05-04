"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function StickyPreviewWrapper({ children, className = "", onClick }: Props) {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const top = container.getBoundingClientRect().top;
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      setIsMobile(!isDesktop);
      
      // Sticky starts at top-24 on mobile (96px), lg:top-32 on desktop (128px) based on page.tsx
      const threshold = isDesktop ? 128 : 96;
      setIsSticky(top <= threshold + 2);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    
    // Initial check
    setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`${className} flex justify-center transition-all duration-300`} 
      onClick={onClick}
    >
      <div className={`transition-all duration-300 relative ${isSticky && isMobile ? "w-[60%]" : "w-full"}`}>
        {children}
      </div>
    </div>
  );
}
