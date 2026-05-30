import { useState, useRef, useEffect } from "react";
import { GLOSSARY } from "../lib/glossary.js";

export default function Term({ id, children }) {
  const entry = GLOSSARY[id];
  const [open, setOpen] = useState(false);
  const [above, setAbove] = useState(false);
  const [xOffset, setXOffset] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setAbove(rect.bottom + 140 > window.innerHeight);

      // Clamp tooltip horizontally so it never leaves the screen
      const tooltipW = 240; // w-60
      const margin = 8;
      const cx = rect.left + rect.width / 2;
      const leftEdge = cx - tooltipW / 2;
      const rightEdge = cx + tooltipW / 2;

      if (leftEdge < margin) {
        setXOffset(margin - leftEdge);
      } else if (rightEdge > window.innerWidth - margin) {
        setXOffset(window.innerWidth - margin - rightEdge);
      } else {
        setXOffset(0);
      }
    }
  }, [open]);

  // Close on outside click (mobile)
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  if (!entry) return <>{children || id}</>;

  return (
    <span
      ref={ref}
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="text-primary font-600 border-b border-dashed border-primary/50 cursor-help transition-colors hover:text-primary-hover focus:outline-none"
      >
        {children || entry.label}
      </button>

      {open && (
        <span
          role="tooltip"
          className={`absolute z-[60] left-1/2 w-60 rounded-xl border border-border bg-surface-2 p-3 text-xs leading-relaxed text-text shadow-glow ${
            above ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          style={{ fontWeight: 400, transform: `translateX(calc(-50% + ${xOffset}px))` }}
        >
          <span className="block font-700 text-primary mb-1">{entry.label}</span>
          {entry.def}
        </span>
      )}
    </span>
  );
}
