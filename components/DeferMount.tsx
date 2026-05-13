"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /**
   * `visible` — mount when the placeholder scrolls into view (IntersectionObserver).
   * `idle`    — mount when the browser is idle (requestIdleCallback / setTimeout fallback).
   */
  trigger?: "visible" | "idle";
  /** rootMargin for IntersectionObserver — start mounting before the element is fully visible. */
  rootMargin?: string;
  /** Hard timeout (ms) after which we mount regardless of trigger. */
  timeoutMs?: number;
  /** Placeholder to render before mount (defaults to nothing). */
  fallback?: ReactNode;
  /** Wrapper className applied to the placeholder div. */
  className?: string;
}

// Pointer/keyboard events on the placeholder also force a mount — covers users
// who scroll-jack or tab into the area before the trigger fires.
const INTERACTION_EVENTS = [
  "pointerdown",
  "pointerover",
  "focusin",
  "touchstart",
] as const;

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout?: number },
  ) => number;
  cancelIdleCallback?: (id: number) => void;
};

export default function DeferMount({
  children,
  trigger = "visible",
  rootMargin = "200px",
  timeoutMs,
  fallback = null,
  className,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mounted) return;
    const el = ref.current;
    if (!el) return;

    const cleanups: Array<() => void> = [];
    let done = false;
    const mount = () => {
      if (done) return;
      done = true;
      setMounted(true);
    };

    if (trigger === "visible" && typeof IntersectionObserver !== "undefined") {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) mount();
        },
        { rootMargin },
      );
      io.observe(el);
      cleanups.push(() => io.disconnect());
    } else if (trigger === "idle") {
      const w = window as IdleWindow;
      if (typeof w.requestIdleCallback === "function") {
        const id = w.requestIdleCallback(mount, { timeout: 2000 });
        cleanups.push(() => w.cancelIdleCallback?.(id));
      } else {
        const id = window.setTimeout(mount, 200);
        cleanups.push(() => window.clearTimeout(id));
      }
    } else {
      // No usable trigger (SSR or missing IntersectionObserver) — mount on next tick.
      const id = window.setTimeout(mount, 0);
      cleanups.push(() => window.clearTimeout(id));
    }

    for (const evt of INTERACTION_EVENTS) {
      el.addEventListener(evt, mount, { once: true, passive: true });
      cleanups.push(() => el.removeEventListener(evt, mount));
    }

    if (timeoutMs != null) {
      const id = window.setTimeout(mount, timeoutMs);
      cleanups.push(() => window.clearTimeout(id));
    }

    return () => {
      for (const fn of cleanups) fn();
    };
  }, [mounted, trigger, rootMargin, timeoutMs]);

  return (
    <div ref={ref} className={className}>
      {mounted ? children : fallback}
    </div>
  );
}
