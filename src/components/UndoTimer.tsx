import { useEffect, useState } from "react";

interface UndoTimerProps {
  duration: number; // in milliseconds
  size?: number;
}

export const UndoTimer = ({ duration, size = 16 }: UndoTimerProps) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  const circumference = 2 * Math.PI * (size / 2 - 2);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 2}
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        className="opacity-20"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 2}
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        className="transition-all duration-50"
      />
    </svg>
  );
};
