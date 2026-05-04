"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function StickyPreviewWrapper({ children, className = "", onClick }: Props) {
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const handleScroll = () => {
      const top = sentinel.getBoundingClientRect().top;
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      // Sticky starts at top-0 on mobile (0px), lg:top-24 on desktop (96px)
      const threshold = isDesktop ? 96 : 0;
      setIsSticky(top <= threshold + 2);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    setTimeout(handleScroll, 100);
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Sentinel element to track scroll position relative to the viewport */}
      <div ref={sentinelRef} className="w-full h-0 pointer-events-none opacity-0" />
      
      {/* Container that actually becomes sticky */}
      <div className={`${className} flex justify-center transition-all duration-300`} onClick={onClick}>
        <div className={`transition-all duration-300 relative ${isSticky ? "w-[60%]" : "w-full"}`}>
          {children}
        </div>
      </div>
    </>
  );
}
