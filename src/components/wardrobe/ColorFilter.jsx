import React from 'react';
import { COLOR_OPTIONS } from './wearStatus';

export default function ColorFilter({ active, onChange }) {
  return (
    <div className="px-5 py-3 overflow-x-auto hide-scrollbar" style={{ borderBottom: '1px solid #E8E6E1' }}>
      <div className="flex gap-3 w-max items-center">
        <button
          onClick={() => onChange('All')}
          className="text-xs px-3 py-1.5 transition-all font-body"
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 500,
            borderRadius: '2px',
            background: active === 'All' ? '#0F0F0F' : '#F5F4F1',
            color: active === 'All' ? '#fff' : '#6B6B6B',
            border: active === 'All' ? '1px solid #0F0F0F' : '1px solid #E8E6E1',
          }}
        >
          All
        </button>
        {COLOR_OPTIONS.map((c) => {
          const isActive = active === c.label;
          return (
            <button
              key={c.label}
              onClick={() => onChange(c.label)}
              title={c.label}
              className="flex flex-col items-center gap-0.5"
            >
              <span
                className="w-6 h-6 rounded-full block transition-all"
                style={{
                  background: c.hex,
                  border: isActive ? '2px solid #0F0F0F' : '1px solid rgba(0,0,0,0.12)',
                  transform: isActive ? 'scale(1.15)' : 'scale(1)',
                }}
              />
              <span className="text-[9px] font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
                {c.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}