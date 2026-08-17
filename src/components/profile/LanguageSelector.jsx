import React from 'react';

const LANGS = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
];

export default function LanguageSelector({ active, onChange }) {
  return (
    <div className="px-5 mb-4">
      <p className="text-[11px] uppercase tracking-[0.08em] font-body font-medium mb-3" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
        Language
      </p>
      <div className="bg-white flex gap-3 p-4" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => onChange(l.code)}
            className="flex-1 flex flex-col items-center gap-1 py-3 font-body text-sm font-medium transition-all"
            style={active === l.code
              ? { background: '#0F0F0F', color: '#fff', borderRadius: '4px' }
              : { background: '#F5F4F1', color: '#6B6B6B', border: '1px solid #E8E6E1', borderRadius: '4px' }
            }
          >
            <span className="text-2xl">{l.flag}</span>
            <span style={{ fontFamily: 'DM Sans, sans-serif' }}>{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}