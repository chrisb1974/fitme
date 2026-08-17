import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { CATEGORY_EMOJI } from '@/components/wardrobe/wearStatus';
import { SEASON_EMOJI } from '@/lib/SeasonContext.jsx';
import SavedLookDetailModal from './SavedLookDetailModal';

const SEASONS = ['All', 'Spring', 'Summer', 'Autumn', 'Winter'];

function ItemMini({ snap }) {
  const emoji = snap.emoji || CATEGORY_EMOJI[snap.category] || '✨';
  return (
    <div className="w-9 h-11 overflow-hidden flex-shrink-0" style={{ borderRadius: '2px' }}>
      {snap.photo_url ? (
        <img src={snap.photo_url} alt={snap.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-lg" style={{ background: '#F5F4F1' }}>
          {emoji}
        </div>
      )}
    </div>
  );
}

function HeartButton({ isFav, onToggle }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="transition-transform active:scale-90"
      style={{ fontSize: '16px', color: isFav ? '#C9A96E' : '#D0D0D0', lineHeight: 1 }}
    >
      {isFav ? '♥' : '♡'}
    </button>
  );
}

export default function SavedLooksSection() {
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const qc = useQueryClient();

  const { data: looks = [] } = useQuery({
    queryKey: ['saved-looks'],
    queryFn: () => base44.entities.SavedLook.list('-date_saved'),
    initialData: [],
  });

  const toggleFavourite = async (look) => {
    await base44.entities.SavedLook.update(look.id, { is_favourite: !look.is_favourite });
    qc.invalidateQueries({ queryKey: ['saved-looks'] });
  };

  const filtered = activeTab === 'All'
    ? looks
    : looks.filter((l) => l.season === activeTab);

  if (looks.length === 0) return null;

  return (
    <div className="mt-8 mb-4">
      {/* Header */}
      <div className="px-5 flex items-center justify-between mb-3">
        <p className="font-display font-bold text-base" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>
          My Outfits
        </p>
        <span className="text-[11px] font-body font-medium" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
          {looks.length} saved
        </span>
      </div>

      {/* Season tabs */}
      <div className="px-5 flex gap-2 overflow-x-auto hide-scrollbar mb-4">
        {SEASONS.map((s) => {
          const active = activeTab === s;
          return (
            <button
              key={s}
              onClick={() => setActiveTab(s)}
              className="shrink-0 flex items-center gap-1 text-xs font-body font-medium transition-all"
              style={{
                padding: '6px 12px',
                borderRadius: '2px',
                fontFamily: 'DM Sans, sans-serif',
                background: active ? '#0F0F0F' : '#F5F4F1',
                color: active ? '#fff' : '#6B6B6B',
                border: active ? '1px solid #0F0F0F' : '1px solid #E8E6E1',
              }}
            >
              {s !== 'All' && <span>{SEASON_EMOJI[s]}</span>}
              <span>{s}</span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="mx-5 py-8 text-center" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
          <p className="text-sm font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
            No {activeTab} outfits yet
          </p>
        </div>
      ) : (
        <div className="px-5 overflow-x-auto hide-scrollbar">
          <div className="flex gap-3 w-max pb-1">
            {filtered.map((look) => (
              <button
                key={look.id}
                onClick={() => setSelected(look)}
                className="bg-white text-left active:scale-95 transition-transform"
                style={{ width: '180px', border: '1px solid #E8E6E1', borderRadius: '4px', padding: '12px' }}
              >
                {/* Item thumbs */}
                <div className="flex gap-1 mb-3">
                  {(look.item_snapshots || []).slice(0, 4).map((snap, i) => (
                    <ItemMini key={i} snap={snap} />
                  ))}
                </div>

                {/* Name */}
                <p className="font-body font-semibold text-sm truncate leading-tight" style={{ color: '#0F0F0F', fontFamily: 'DM Sans, sans-serif' }}>
                  {look.outfit_name}
                </p>

                {/* Meta row */}
                <div className="flex items-center justify-between mt-2">
                  <div>
                    {look.season && (
                      <span className="text-[10px] font-body" style={{ color: '#C9A96E', fontFamily: 'DM Sans, sans-serif' }}>
                        {SEASON_EMOJI[look.season]} {look.season}
                      </span>
                    )}
                    <p className="text-[10px] font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
                      {look.date_saved ? format(new Date(look.date_saved), 'MMM d') : ''}
                    </p>
                  </div>
                  <HeartButton isFav={!!look.is_favourite} onToggle={() => toggleFavourite(look)} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <SavedLookDetailModal look={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}