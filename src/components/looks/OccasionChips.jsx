import React from 'react';
import { useLanguage } from '@/lib/i18n.jsx';

export default function OccasionChips({ onSelect }) {
  const { t } = useLanguage();

  const OCCASIONS = [
    { key: 'occasionUniDay', emoji: '🎓' },
    { key: 'occasionDinner', emoji: '🍽' },
    { key: 'occasionClubNight', emoji: '💃' },
    { key: 'occasionFirstDate', emoji: '💕' },
    { key: 'occasionSport', emoji: '🏃' },
    { key: 'occasionTravel', emoji: '✈️' },
    { key: 'occasionWork', emoji: '💼' },
    { key: 'occasionBeach', emoji: '☀️' },
  ];

  return (
    <div className="overflow-x-auto hide-scrollbar px-5">
      <div className="flex gap-2.5 w-max py-1">
        {OCCASIONS.map((o) => {
          const label = t(o.key);
          return (
            <button
              key={o.key}
              onClick={() => onSelect(`${o.emoji} ${label}`)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-body whitespace-nowrap active:scale-95 transition-transform"
              style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px', color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}
            >
              <span>{o.emoji}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}