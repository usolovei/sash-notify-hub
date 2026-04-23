import { useEffect, useRef, useState, ReactNode } from "react";
import { Check } from "lucide-react";

// Spark-style timings:
// 1) Cards slide LEFT → RIGHT over SLIDE_MS (ease-out)
// 2) Hold the revealed blue block for HOLD_MS so the user registers it
// 3a) If backfill content is provided: crossfade blue → backfill cards over
//     CROSSFADE_MS, no height change, no layout shift.
// 3b) Otherwise: collapse the whole block's height to 0 over COLLAPSE_MS.
const SLIDE_MS = 200;
const HOLD_MS = 60;
const CROSSFADE_MS = 120;
const COLLAPSE_MS = 120;

interface ReadRevealWrapperProps {
  children: ReactNode;
  /**
   * Optional replacement content rendered into the same vertical slot once
   * the cards finish sliding out. When present, the wrapper crossfades the
   * blue reveal into this content (no height collapse). When absent, the
   * wrapper collapses its height to 0 like before.
   */
  backfill?: ReactNode;
}

/**
 * Wraps one or more contiguous notification cards that are transitioning
 * from unread → read. Renders a single solid blue rectangle behind them
 * with a checkmark + "Read" label in the upper-left. The cards inside
 * slide off to the right, then either:
 *   - crossfade into `backfill` content (keeps panel height stable while
 *     the user rapidly reads through a group), or
 *   - collapse the wrapper's height to 0 (legacy behavior when there's
 *     nothing left to backfill).
 */
export const ReadRevealWrapper = ({ children, backfill }: ReadRevealWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"slide" | "crossfade" | "collapse">("slide");
  const [height, setHeight] = useState<number | null>(null);

  const hasBackfill = backfill !== undefined && backfill !== null;

  useEffect(() => {
    // Capture initial rendered height so we can animate it down to 0 later
    // (collapse path) or keep it pinned during crossfade.
    if (ref.current) {
      setHeight(ref.current.offsetHeight);
    }

    // After the slide finishes + a short hold, transition to the next phase.
    const t = window.setTimeout(
      () => setPhase(hasBackfill ? "crossfade" : "collapse"),
      SLIDE_MS + HOLD_MS
    );
    return () => window.clearTimeout(t);
  }, [hasBackfill]);

  // Height behavior:
  // - "slide" / "crossfade": keep the captured pixel height (stable slot)
  // - "collapse": animate height to 0
  const wrapperStyle: React.CSSProperties = {
    height: phase === "collapse" ? 0 : height ?? undefined,
    overflow: "hidden",
    transition: `height ${COLLAPSE_MS}ms ease-out`,
  };

  // Blue layer fades out during crossfade (so backfill content shows through).
  const blueOpacity = phase === "crossfade" ? 0 : 1;
  // Backfill fades in during crossfade.
  const backfillOpacity = phase === "crossfade" ? 1 : 0;

  return (
    <div ref={ref} style={wrapperStyle} className="relative">
      {/* Solid blue reveal layer behind the cards. Spans the full wrapper. */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-start"
        style={{
          backgroundColor: "#93B4F6",
          opacity: blueOpacity,
          transition: `opacity ${CROSSFADE_MS}ms ease-out`,
        }}
      >
        <div className="flex items-center gap-1.5 px-4 py-3 text-white">
          <Check className="h-4 w-4" strokeWidth={2.5} />
          <span className="text-sm font-medium">Read</span>
        </div>
      </div>

      {/* Backfill layer: replacement notifications fading in over the blue. */}
      {hasBackfill && (
        <div
          className="absolute inset-0"
          style={{
            opacity: backfillOpacity,
            transition: `opacity ${CROSSFADE_MS}ms ease-out`,
            pointerEvents: phase === "crossfade" ? "auto" : "none",
          }}
        >
          {backfill}
        </div>
      )}

      {/* The cards themselves render above the blue layer and slide right. */}
      <div className="relative">{children}</div>
    </div>
  );
};

export const READ_REVEAL_TIMINGS = {
  SLIDE_MS,
  HOLD_MS,
  CROSSFADE_MS,
  COLLAPSE_MS,
  TOTAL_MS: SLIDE_MS + HOLD_MS + Math.max(CROSSFADE_MS, COLLAPSE_MS),
};
