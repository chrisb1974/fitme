import React, { useState } from 'react';
import { ArrowUpDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SORT_OPTIONS = [
  { key: 'date_added', label: 'Recently added' },
  { key: 'most_worn', label: 'Most worn' },
  { key: 'least_worn', label: 'Least worn' },
  { key: 'last_worn', label: 'Last worn' },
];

export default function SortButton({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const current = SORT_OPTIONS.find((o) => o.key === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-body px-3 py-2"
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontWeight: 500,
          color: '#6B6B6B',
          background: '#F5F4F1',
          border: '1px solid #E8E6E1',
          borderRadius: '2px',
        }}
      >
        <ArrowUpDown className="w-3 h-3" />
        {current?.label}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-full mt-1 z-50 bg-white py-1 min-w-[180px]"
              style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { onChange(opt.key); setOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-body flex items-center justify-between"
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontWeight: value === opt.key ? 600 : 400,
                    color: '#0F0F0F',
                    background: value === opt.key ? '#F5F4F1' : 'transparent',
                  }}
                >
                  {opt.label}
                  {value === opt.key && <Check className="w-3.5 h-3.5" style={{ color: '#C9A96E' }} />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}