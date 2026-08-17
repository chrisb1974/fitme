import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { format } from 'date-fns';
import SavedLookDetailModal from '@/components/looks/SavedLookDetailModal';

export default function FavouriteLooksGallery({ looks }) {
  const [selected, setSelected] = useState(null);

  if (!looks.length) return null;

  return (
    <div className="mt-5 mb-2">
      <p className="px-5 text-sm font-extrabold uppercase tracking-wider text-muted-foreground mb-3">
        Favourite Looks 💕
      </p>
      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex gap-3 px-5 w-max">
          {looks.map((look) => (
            <button
              key={look.id}
              onClick={() => setSelected(look)}
              className="bg-white rounded-[24px] soft-shadow p-4 w-44 text-left"
            >
              <div className="flex gap-1 text-2xl mb-3">
                {(look.item_snapshots || []).slice(0, 3).map((s, i) => (
                  <span key={i}>{s.emoji || '👗'}</span>
                ))}
              </div>
              <p className="font-extrabold text-sm leading-tight truncate">{look.outfit_name}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {look.date_saved ? format(new Date(look.date_saved), 'MMM d') : ''}
              </p>
              <div className="mt-2 flex items-center gap-1">
                <Heart className="w-3 h-3" style={{ color: '#FF6B47', fill: '#FF6B47' }} />
                <span className="text-[10px] font-semibold" style={{ color: '#FF6B47' }}>
                  {look.match_score ? `${look.match_score}% match` : 'Saved'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <SavedLookDetailModal look={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}