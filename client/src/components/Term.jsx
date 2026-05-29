import { useState, useRef, useEffect } from "react";
import { GLOSSARY } from "../lib/glossary.js";

/**
 * מונח פיננסי מסומן — מודגש בצבע, ובמגע/ריחוף מציג הסבר קצר.
 * שימוש: <Term id="prime" /> או <Term id="ltv">LTV מותאם</Term>
 */
export default function Term({ id, children }) {
  const entry = GLOSSARY[id];
  const [open, setOpen] = useState(false);
  const [above, setAbove] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      // אם אין מספיק מקום למטה — פותחים למעלה
      setAbove(rect.bottom + 140 > window.innerHeight);
    }
  }, [open]);

  // סגירה בלחיצה מחוץ (למובייל)
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
          className={`absolute z-[60] right-1/2 translate-x-1/2 w-60 rounded-xl border border-border bg-surface-2 p-3 text-xs leading-relaxed text-text shadow-glow ${
            above ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          style={{ fontWeight: 400 }}
        >
          <span className="block font-700 text-primary mb-1">{entry.label}</span>
          {entry.def}
        </span>
      )}
    </span>
  );
}
