import { useEffect, useRef, useState } from "react";

export function useCountUp(end: number, { duration = 1600, start = 0 }: { duration?: number; start?: number } = {}) {
  const [value, setValue] = useState(start);
  const ref = useRef<HTMLSpanElement | null>(null);
  const played = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !played.current) {
            played.current = true;
            const startTime = performance.now();
            const tick = (now: number) => {
              const p = Math.min((now - startTime) / duration, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              setValue(Math.round(start + (end - start) * eased));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [end, duration, start]);

  return { value, ref };
}
