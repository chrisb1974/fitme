import React from 'react';
import { Heart, RefreshCw, CalendarPlus } from 'lucide-react';
import { CATEGORY_EMOJI } from '@/components/wardrobe/wearStatus';

function isRealUrl(str) {
  return str && (str.startsWith('http://') || str.startsWith('https://'));
}

function ItemThumb({ item }) {
  const displayEmoji = item.emoji || item.photo_url || CATEGORY_EMOJI[item.category] || '✨';
  const realPhoto = isRealUrl(item.photo_url) ? item.photo_url : null;

  return (
    <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
      <div className="w-16 h-20 overflow-hidden" style={{ background: '#F5F4F1', borderRadius: '4px' }}>
        {realPhoto ? (
          <img src={realPhoto} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            {displayEmoji}
          </div>
        )}
      </div>
      <p className="text-[10px] font-body text-center max-w-[64px] truncate leading-tight" style={{ color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{item.name}</p>
      <p className="text-[9px] font-body text-center max-w-[64px] truncate" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>{item.category}</p>
    </div>
  );
}

export default function OutfitResultCard({ result, selectedItems, onSave, onRetry, onWearToday, saving }) {
  const outfitName = result.outfitName || result.outfit_name || 'Your Look';
  const description = result.description || result.style_description || '';
  const stylingTip = result.stylingTip || result.styling_tip || '';
  const matchScore = result.matchScore || result.match_score || 0;

  return (
    <div className="mx-5 mt-6 bg-white overflow-hidden" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4" style={{ background: '#F5F4F1', borderBottom: '1px solid #E8E6E1' }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.1em] font-body font-medium mb-1" style={{ color: '#C9A96E', fontFamily: 'DM Sans, sans-serif' }}>Your FitMe Look</p>
            <h2 className="text-xl font-display font-semibold leading-tight" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>{outfitName}</h2>
            <p className="text-sm font-body mt-1" style={{ color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif', fontWeight: 400 }}>{description}</p>
          </div>
          <div
            className="text-xs font-body font-semibold px-3 py-1.5 shrink-0"
            style={{ background: '#0F0F0F', color: '#fff', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' }}
          >
            {matchScore}%
          </div>
        </div>
      </div>

      {/* Items row */}
      <div className="px-5 py-4">
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex gap-3 w-max">
            {selectedItems.map((item) => (
              <ItemThumb key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Styling tip */}
      {stylingTip && (
        <div
          className="mx-5 mb-4 px-4 py-3 flex gap-2.5 items-start"
          style={{ background: '#F5F4F1', borderLeft: '3px solid #4A7C59', borderRadius: '0 2px 2px 0' }}
        >
          <p className="text-sm font-body" style={{ color: '#4A7C59', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
            {stylingTip}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="px-5 pb-5 grid grid-cols-3 gap-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex flex-col items-center gap-1.5 py-3 text-xs font-body active:scale-95 transition-transform"
          style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, color: '#0F0F0F' }}
        >
          <Heart className="w-4 h-4" style={{ color: '#6B6B6B' }} />
          {saving ? 'Saving…' : 'Save look'}
        </button>
        <button
          onClick={onRetry}
          className="flex flex-col items-center gap-1.5 py-3 text-xs font-body active:scale-95 transition-transform"
          style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, color: '#0F0F0F' }}
        >
          <RefreshCw className="w-4 h-4" style={{ color: '#6B6B6B' }} />
          Try another
        </button>
        <button
          onClick={onWearToday}
          className="flex flex-col items-center gap-1.5 py-3 text-xs font-body active:scale-95 transition-transform"
          style={{ background: '#0F0F0F', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, color: '#fff' }}
        >
          <CalendarPlus className="w-4 h-4" />
          Wear today
        </button>
      </div>
    </div>
  );
}