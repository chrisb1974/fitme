import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { CATEGORY_EMOJI } from '@/components/wardrobe/wearStatus';

function ItemThumb({ snap }) {
  const emoji = snap.emoji || CATEGORY_EMOJI[snap.category] || '✨';
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-16 h-20 rounded-2xl overflow-hidden bg-secondary">
        {snap.photo_url ? (
          <img src={snap.photo_url} alt={snap.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-secondary to-muted">
            {emoji}
          </div>
        )}
      </div>
      <p className="text-[10px] font-semibold text-muted-foreground text-center max-w-[60px] truncate">{snap.name}</p>
    </div>
  );
}

export default function SavedLookDetailModal({ look, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="w-full max-w-md bg-background rounded-t-[32px] max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-3 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="text-xl font-extrabold">{look.outfit_name}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pb-10 space-y-4">
          {look.style_description && (
            <p className="text-sm text-muted-foreground">{look.style_description}</p>
          )}

          {look.date_saved && (
            <p className="text-xs font-semibold text-muted-foreground">
              Saved on {format(new Date(look.date_saved), 'MMMM d, yyyy')}
            </p>
          )}

          {/* Items */}
          <div className="flex gap-3 flex-wrap">
            {(look.item_snapshots || []).map((snap, i) => (
              <ItemThumb key={i} snap={snap} />
            ))}
          </div>

          {/* Styling tip */}
          {look.styling_tip && (
            <div
              className="rounded-2xl px-4 py-3 flex gap-2.5 items-start"
              style={{ background: 'rgba(46,204,130,0.12)' }}
            >
              <span className="text-lg">💡</span>
              <p className="text-sm font-semibold" style={{ color: 'hsl(148 61% 28%)' }}>
                {look.styling_tip}
              </p>
            </div>
          )}

          {look.match_score && (
            <div className="inline-flex bg-primary/10 text-primary font-bold text-xs px-3 py-1.5 rounded-full">
              {look.match_score}% match
            </div>
          )}

          {look.occasion_prompt && (
            <div className="bg-secondary rounded-2xl px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Occasion</p>
              <p className="text-sm font-semibold">{look.occasion_prompt}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}