import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { format } from 'date-fns';

export default function TripDetailModal({ trip, onClose }) {
  return (
    <>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-[32px] soft-shadow-lg pb-10"
        style={{ maxHeight: '80vh', overflowY: 'auto' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-5 pt-2 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Trip</p>
            <p className="text-xl font-extrabold">{trip.destination}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(trip.date_from), 'MMM d')} – {format(new Date(trip.date_to), 'MMM d, yyyy')}
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 space-y-4">
          {trip.trip_name && (
            <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #FF6B47, #ff8a6e)' }}>
              <p className="text-white font-extrabold text-lg">{trip.trip_name}</p>
            </div>
          )}

          {trip.packing_list?.length > 0 && (
            <div className="bg-secondary rounded-2xl p-4">
              <p className="font-extrabold mb-2">🧳 Packing list ({trip.packing_list.length} items)</p>
              <div className="space-y-2">
                {trip.packing_list.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span>·</span>
                    <span className="font-semibold">{entry.wearOn}:</span>
                    <span className="text-muted-foreground truncate">{entry.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {trip.packing_tips?.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: 'rgba(46,204,130,0.12)' }}>
              <p className="font-extrabold text-sm mb-2" style={{ color: 'hsl(148 61% 28%)' }}>💡 Tips</p>
              {trip.packing_tips.map((tip, i) => (
                <p key={i} className="text-sm" style={{ color: 'hsl(148 61% 28%)' }}>· {tip}</p>
              ))}
            </div>
          )}
        </div>
      </motion.div>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
    </>
  );
}