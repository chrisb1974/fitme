import React from 'react';
import { Tag, Repeat } from 'lucide-react';
import { CATEGORY_EMOJI, CATEGORY_BADGE } from '@/components/wardrobe/wearStatus';
import { getSuggestedPrice, getDaysAgo } from './sellUtils';
import { useLanguage } from '@/lib/i18n.jsx';

const THIRD_PARTY = ['Vinted', 'Wallapop', 'Depop'];

function isRealUrl(str) {
  return str && (str.startsWith('http://') || str.startsWith('https://'));
}

export default function SellItemCard({ item, listingPrice, onSell, onSwap, onThirdParty, onRemove }) {
  const { t } = useLanguage();
  const price = listingPrice != null ? listingPrice : getSuggestedPrice(item);
  const daysAgo = getDaysAgo(item.last_worn_date);
  const neverWorn = !item.last_worn_date || (item.times_worn || 0) === 0;
  const emoji = item.emoji || CATEGORY_EMOJI[item.category] || '✨';
  const realPhoto = isRealUrl(item.photo_url) ? item.photo_url : null;
  const badge = CATEGORY_BADGE[item.category] || { bg: 'rgba(100,100,100,0.15)', text: '#444' };
  const isListed = item.is_for_sale === true;

  return (
    <div className="bg-white p-4" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
      <div className="flex gap-3">
        {/* Emoji / photo */}
        <div
          className="w-16 h-16 flex items-center justify-center text-3xl shrink-0 overflow-hidden"
          style={{ background: badge.bg, borderRadius: '4px' }}
        >
          {realPhoto
            ? <img src={realPhoto} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; }}/>
            : emoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className="font-body font-semibold text-sm leading-tight truncate" style={{ fontFamily: 'DM Sans, sans-serif', color: '#0F0F0F' }}>{item.name}</p>
            <span className="font-body font-semibold text-sm shrink-0" style={{ fontFamily: 'DM Sans, sans-serif', color: '#0F0F0F' }}>
              {listingPrice != null ? `€${price}` : `Est. €${price}`}
            </span>
          </div>

          {/* Category badge */}
          <span
            className="inline-block text-[10px] font-body font-semibold px-2 py-0.5 mt-1"
            style={{ background: badge.bg, color: badge.text, borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' }}
          >
            {item.category}
          </span>

          <div className="mt-1 flex gap-3 text-[11px] font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
            <span>{t('wornTimes')} {item.times_worn || 0}×</span>
            <span style={neverWorn ? { color: '#8B3A3A', fontWeight: 600 } : {}}>
              {neverWorn ? t('neverWornLabel') : `${daysAgo}d ago`}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {isListed ? (
        <div className="mt-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#22c55e', fontFamily: 'DM Sans, sans-serif' }}>{t('listedOnFitme')}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onSell(item)}
              style={{ flex: 1, background: '#f5f5f5', color: '#000', border: 'none', borderRadius: 12, padding: '10px', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              ✏️ {t('editListing')}
            </button>
            <button
              onClick={() => onRemove(item)}
              style={{ flex: 1, background: '#fff', color: '#ff3b30', border: '1.5px solid #ff3b30', borderRadius: 12, padding: '10px', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              {t('removeFromSale')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onSell(item)}
              className="flex-1 h-9 text-xs font-body font-semibold uppercase tracking-[0.05em] flex items-center justify-center gap-1.5 transition-all active:scale-95"
              style={{ background: '#0F0F0F', color: '#fff', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' }}
            >
              <Tag className="w-3.5 h-3.5" /> {t('sellOnFitme')}
            </button>
            <button
              onClick={() => onSwap(item)}
              className="flex-1 h-9 text-xs font-body font-semibold uppercase tracking-[0.05em] flex items-center justify-center gap-1.5 transition-all active:scale-95"
              style={{ border: '1px solid #0F0F0F', color: '#0F0F0F', borderRadius: '2px', background: 'transparent', fontFamily: 'DM Sans, sans-serif' }}
            >
              <Repeat className="w-3.5 h-3.5" /> {t('swapBtn')}
            </button>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className="text-[10px] font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>{t('alsoListOn')}</span>
            {THIRD_PARTY.map((p) => (
              <button
                key={p}
                onClick={() => onThirdParty(item, p)}
                className="text-[10px] font-body font-semibold px-2 py-0.5 transition-colors"
                style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px', color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}
              >
                {p}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}