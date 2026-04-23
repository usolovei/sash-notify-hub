import { ReactNode } from "react";
import { Check } from "lucide-react";

// Spark-style timings:
// 1) Cards slide LEFT → RIGHT over SLIDE_MS (ease-out)
// 2) Hold the revealed blue block for HOLD_MS so the user registers it
//
// We intentionally do NOT collapse the wrapper's height anymore. When the
// pending items are committed to "read" by the parent, they unmount and
// the next pending unread item slides up into the freed slot via the
// parent's "buffer" logic (see NotificationGroup). This keeps the list
// height stable while the user rapidly marks items as read, avoiding
// the flicker / shift-up that height collapse caused.
const SLIDE_MS = 160;
const HOLD_MS = 40;
const COLLAPSE_MS = 0;

interface ReadRevealWrapperProps {
  children: ReactNode;
}

/**
 * Wraps one or more contiguous notification cards that are transitioning
 * from unread → read. Renders a single solid blue rectangle behind them
 * with a checkmark + "Read" label in the upper-left. The cards inside
 * slide off to the right, exposing the blue block. After the parent
 * commits the read state, the wrapper unmounts and the slot is taken
 * by the next item in the list (no height animation).
 */
export const ReadRevealWrapper = ({ children }: ReadRevealWrapperProps) => {
  return (
    <div className="relative">
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
