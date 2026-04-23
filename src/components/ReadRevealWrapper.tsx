import { useEffect, useRef, useState, ReactNode } from "react";
import { Check } from "lucide-react";

// Spark-style timings:
// 1) Cards slide LEFT → RIGHT over SLIDE_MS (ease-out)
// 2) Hold the revealed blue block for HOLD_MS so the user registers it
// 3) Collapse the whole block's height to 0 over COLLAPSE_MS
const SLIDE_MS = 160;
const HOLD_MS = 40;
const COLLAPSE_MS = 90;

interface ReadRevealWrapperProps {
  children: ReactNode;
}

/**
 * Wraps one or more contiguous notification cards that are transitioning
 * from unread → read. Renders a single solid blue rectangle behind them
 * with a checkmark + "Read" label in the upper-left. The cards inside
 * slide off to the right, then the whole wrapper collapses its height.
 *
 * The cards themselves handle the right-slide transform (see NotificationItem).
 * This wrapper owns the blue reveal layer and the height collapse.
 */
export const ReadRevealWrapper = ({ children }: ReadRevealWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"slide" | "collapse">("slide");
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    // Capture initial rendered height so we can animate it down to 0 later.
    if (ref.current) {
      setHeight(ref.current.offsetHeight);
    }

    // After the slide finishes + a short hold, begin collapsing.
    // We must have committed the explicit pixel height first, so the browser
    // has a concrete starting value to transition from when we set it to 0.
    const t = window.setTimeout(() => setPhase("collapse"), SLIDE_MS + HOLD_MS);
    return () => window.clearTimeout(t);
  }, []);

  // While "slide": use the captured pixel height (or auto for the very first
  // paint before the measurement lands). While "collapse": animate to 0.
  const wrapperStyle: React.CSSProperties = {
    height: phase === "collapse" ? 0 : height ?? undefined,
    overflow: "hidden",
    transition: `height ${COLLAPSE_MS}ms ease-out`,
  };

  return (
    <div ref={ref} style={wrapperStyle} className="relative">
      {/* Solid blue reveal layer behind the cards. Spans the full wrapper. */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-start"
        style={{ backgroundColor: "#93B4F6" }}
      >
        <div className="flex items-center gap-1.5 px-4 py-3 text-white">
          <Check className="h-4 w-4" strokeWidth={2.5} />
          <span className="text-sm font-medium">Read</span>
        </div>
      </div>

      {/* The cards themselves render above the blue layer and slide right. */}
      <div className="relative">{children}</div>
    </div>
  );
};

export const READ_REVEAL_TIMINGS = {
  SLIDE_MS,
  HOLD_MS,
  COLLAPSE_MS,
  TOTAL_MS: SLIDE_MS + HOLD_MS + COLLAPSE_MS,
};
