import React from 'react';
import { Heart } from 'lucide-react';

const CONDITION_STYLE = {
  'New with tags': { bg: 'rgba(74,124,89,0.1)', color: '#4A7C59' },
  'Like new':      { bg: 'rgba(74,124,89,0.1)', color: '#4A7C59' },
  'Good':          { bg: 'rgba(201,169,110,0.12)', color: '#b5893d' },
  'Fair':          { bg: 'rgba(168,168,168,0.15)', color: '#6B6B6B' },
};

function isRealUrl(str) {
  return str && (str.startsWith('http://') || str.startsWith('https://'));
}

export default function MarketCard({ item, isFaved, onFav, onOpen }) {
  const condStyle = CONDITION_STYLE[item.condition] || CONDITION_STYLE['Good'];
  const sellerInitial = (item.seller || 'M')[0].toUpperCase();
  const cover = isRealUrl(item.cover_photo) ? item.cover_photo : null;

  return (
    <button
      onClick={onOpen}
      className="bg-white text-left w-full active:scale-[0.97] transition-transform overflow-hidden"
      style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}
    >
      {/* Photo area */}
      <div
        className="relative w-full aspect-square flex items-center justify-center text-5xl overflow-hidden"
        style={{ background: '#F5F4F1' }}
      >
        {cover ? <img src={cover} alt={item.name} className="w-full h-full object-cover" /> : item.emoji}

        {/* Condition badge */}
        <span
          className="absolute top-2 left-2 text-[9px] uppercase tracking-[0.06em] px-2 py-0.5 font-body"
          style={{ ...condStyle, borderRadius: '2px', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}
        >
          {item.condition}
        </span>

        {/* Heart */}
        <button
          onClick={(e) => { e.stopPropagation(); onFav(item.id); }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white flex items-center justify-center"
          style={{ border: '1px solid #E8E6E1' }}
        >
          <Heart
            className="w-3.5 h-3.5 transition-all"
            fill={isFaved ? '#8B3A3A' : 'none'}
            stroke={isFaved ? '#8B3A3A' : '#A8A8A8'}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="font-body text-sm leading-tight truncate" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: '#0F0F0F' }}>{item.name}</p>
        <p className="text-[11px] font-body mt-0.5" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>{item.brand} · {item.size}</p>

        <div className="flex items-center justify-between mt-1.5">
          {item.listingType === 'swap' ? (
            <span className="text-[10px] font-body uppercase tracking-[0.04em] px-2 py-0.5" style={{ background: 'rgba(74,124,89,0.1)', color: '#4A7C59', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
              Swap
            </span>
          ) : (
            <span className="text-sm font-body font-bold" style={{ color: '#C9A96E', fontFamily: 'DM Sans, sans-serif' }}>€{item.price}</span>
          )}

          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-body text-white" style={{ background: '#0F0F0F', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
              {sellerInitial}
            </div>
            <span className="text-[9px] font-body truncate max-w-[50px]" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>{item.seller}</span>
          </div>
        </div>
      </div>
    </button>
  );
}