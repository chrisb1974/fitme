import React, { useState } from 'react';
import { format } from 'date-fns';
import TripDetailModal from './TripDetailModal';

const DEST_EMOJI = ['🗼', '🗽', '🏰', '🌊', '🏔', '🌴', '🏙', '🎡'];

function destEmoji(destination) {
  let hash = 0;
  for (let c of destination) hash = (hash * 31 + c.charCodeAt(0)) & 0xff;
  return DEST_EMOJI[hash % DEST_EMOJI.length];
}

export default function MyTrips({ trips }) {
  const [selected, setSelected] = useState(null);

  if (!trips.length) return null;

  return (
    <div className="mx-5 mt-4 mb-6">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">My trips</p>
      <div className="space-y-2">
        {trips.map((trip) => (
          <button
            key={trip.id}
            onClick={() => setSelected(trip)}
            className="w-full bg-white rounded-[20px] soft-shadow p-3 flex items-center gap-3 text-left"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: 'rgba(255,107,71,0.1)' }}
            >
              {destEmoji(trip.destination)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm truncate">{trip.destination}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(trip.date_from), 'MMM d')} – {format(new Date(trip.date_to), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-bold" style={{ color: '#FF6B47' }}>
                {trip.packing_list?.length || 0} items
              </p>
              <p className="text-[10px] text-muted-foreground">packed</p>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <TripDetailModal trip={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}