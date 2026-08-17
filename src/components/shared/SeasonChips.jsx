import React from 'react';
import { SEASONS, SEASON_EMOJI } from '@/lib/SeasonContext.jsx';

// Multi-select chips for AddItemModal / EditItemModal
export function SeasonMultiChips({ selected = [], onChange }) {
  const toggle = (s) => {
    if (selected.includes(s)) {
      onChange(selected.filter((x) => x !== s));
    } else {
      onChange([...selected, s]);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {SEASONS.map((s) => {
        const active = selected.includes(s);
        return (
          <button
            key={s}
            type="button"
            onClick={() => toggle(s)}
            className="px-3 py-1.5 text-xs font-body font-medium transition-all"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              borderRadius: '2px',
              border: active ? '1px solid #0F0F0F' : '1px solid #E8E6E1',
              background: active ? '#0F0F0F' : '#F5F4F1',
              color: active ? '#fff' : '#6B6B6B',
            }}
          >
            {SEASON_EMOJI[s]} {s}
          </button>
        );
      })}
    </div>
  );
}

// Single-select bar for Home / Profile screens
export function SeasonSelectorBar({ active, onChange }) {
  return (
    <div className="flex gap-2">
      {SEASONS.map((s) => {
        const isActive = active === s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className="flex-1 py-2 text-xs font-body font-medium transition-all active:scale-95"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              borderRadius: '2px',
              border: isActive ? '1px solid #0F0F0F' : '1px solid #E8E6E1',
              background: isActive ? '#0F0F0F' : '#F5F4F1',
              color: isActive ? '#fff' : '#6B6B6B',
            }}
          >
            <span>{SEASON_EMOJI[s]}</span>
            <span className="hidden sm:inline ml-1">{s}</span>
          </button>
        );
      })}
    </div>
  );
}