'use client';

import { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className="rounded-xl border border-slate-700 overflow-hidden bg-slate-800/60"
      role="region"
      aria-label={title}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-700/50 transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <span className="font-bold text-white uppercase tracking-wider text-sm" style={{ fontFamily: 'monospace' }}>
            {title}
          </span>
        </span>
        <span
          className="text-slate-400 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          aria-hidden
        >
          ▼
        </span>
      </button>
      {open && (
        <div className="border-t border-slate-700 px-4 py-4">
          {children}
        </div>
      )}
    </section>
  );
}
