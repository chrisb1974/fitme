import React from 'react';
import { format } from 'date-fns';
import { Check } from 'lucide-react';
import { getWearStatus, CATEGORY_EMOJI } from './wearStatus';
import { useLanguage } from '@/lib/i18n.jsx';

const DOT_COLORS = { green: '#4A7C59', orange: '#C9A96E', red: '#8B3A3A' };

export default function WardrobeItemCard({ item, onOpen, onMarkWorn }) {
  const { t } = useLanguage();
  const status = getWearStatus(item.last_worn_date);
  const emoji = item.emoji || CATEGORY_EMOJI[item.category] || '✨';
  const dotColor = DOT_COLORS[status.color] || '#A8A8A8';

  return (
    <div className="group relative bg-white overflow-hidden" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
      <button onClick={onOpen} className="w-full text-left active:scale-[0.98] transition-transform">
        <div className="relative aspect-[4/5] overflow-hidden" style={{ background: '#F5F4F1' }}>
          {item.photo_url ? (
            <img
              src={item.photo_url}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-6xl" style={{ background: '#F5F4F1' }}>
              {emoji}
            </div>
          )}

          {/* Category badge — neutral */}
          <div
            className="absolute top-2 left-2 text-[9px] uppercase tracking-[0.08em] px-2 py-0.5 font-body"
            style={{
              background: '#F5F4F1',
              border: '1px solid #E8E6E1',
              borderRadius: '2px',
              color: '#6B6B6B',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 500,
            }}
          >
            {item.category}
          </div>

          {/* Wear status dot */}
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center" style={{ border: '1px solid #E8E6E1' }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: dotColor }} />
          </div>
        </div>

        <div className="p-3">
          <p className="text-sm font-body truncate" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: '#0F0F0F' }}>
            {item.name}
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[11px] font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif', fontWeight: 400 }}>
              {t('worn')} {item.times_worn || 0}×
            </p>
            {item.last_worn_date && (
              <p className="text-[10px] font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
                {format(new Date(item.last_worn_date), 'MMM d')}
              </p>
            )}
          </div>
        </div>
      </button>

      {/* Quick mark as worn */}
      <button
        onClick={(e) => { e.stopPropagation(); onMarkWorn(); }}
        className="absolute bottom-11 right-2 w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
        style={{ background: '#0F0F0F' }}
        title="Mark as worn today"
      >
        <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
      </button>
    </div>
  );
}