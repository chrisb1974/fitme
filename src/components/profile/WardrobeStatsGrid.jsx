import React, { useState } from 'react';
import { useSeason, SEASON_EMOJI } from '@/lib/SeasonContext.jsx';
import { SeasonMultiChips } from '@/components/shared/SeasonChips.jsx';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n.jsx';

const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];

export default function WardrobeStatsGrid({ stats }) {
  const { totalItems, unwornCount, favouritesCount } = stats;
  const { activeSeason, setSeason } = useSeason();
  const [showSeasonPicker, setShowSeasonPicker] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="px-5 mb-4">
      <p className="text-[11px] uppercase tracking-[0.08em] font-body font-medium mb-3" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
        {t('wardrobeStats')}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {/* Total Items */}
        <div className="bg-white p-4" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
          <p className="font-display font-bold leading-tight" style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', color: '#0F0F0F' }}>
            {totalItems}
          </p>
          <p className="text-[11px] font-body mt-0.5" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>{t('totalItems')}</p>
        </div>

        {/* Unworn */}
        <div className="bg-white p-4" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
          <p className="font-display font-bold leading-tight" style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', color: '#0F0F0F' }}>
            {unwornCount}
          </p>
          <p className="text-[11px] font-body mt-0.5" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>{t('unwornStat')}</p>
        </div>

        {/* Current Season — tappable */}
        <div>
          <button
            onClick={() => setShowSeasonPicker((v) => !v)}
            className="w-full bg-white p-4 text-left transition-all active:scale-[0.98]"
            style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}
          >
            <p className="font-display font-bold leading-tight" style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', color: '#0F0F0F' }}>
              {SEASON_EMOJI[activeSeason]}
            </p>
            <p className="text-[11px] font-body mt-0.5" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
              {activeSeason} <span style={{ color: '#C9A96E' }}>· {t('tapChange')}</span>
            </p>
          </button>
          {showSeasonPicker && (
            <div className="mt-2 p-3 bg-white" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
              <div className="flex flex-wrap gap-2">
                {SEASONS.map((s) => {
                  const active = activeSeason === s;
                  return (
                    <button
                      key={s}
                      onClick={() => { setSeason(s); setShowSeasonPicker(false); }}
                      className="flex items-center gap-1 text-xs font-body font-medium transition-all"
                      style={{
                        padding: '6px 12px', borderRadius: '2px',
                        fontFamily: 'DM Sans, sans-serif',
                        background: active ? '#0F0F0F' : '#F5F4F1',
                        color: active ? '#fff' : '#6B6B6B',
                        border: active ? '1px solid #0F0F0F' : '1px solid #E8E6E1',
                      }}
                    >
                      {SEASON_EMOJI[s]} {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Favourite Outfits */}
        <button
          onClick={() => navigate('/look')}
          className="bg-white p-4 text-left transition-all active:scale-[0.98]"
          style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}
        >
          <p className="font-display font-bold leading-tight" style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', color: '#0F0F0F' }}>
            <span style={{ color: '#C9A96E' }}>♥</span> {favouritesCount || 0}
          </p>
          <p className="text-[11px] font-body mt-0.5" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>{t('favourites')}</p>
        </button>
      </div>
    </div>
  );
}