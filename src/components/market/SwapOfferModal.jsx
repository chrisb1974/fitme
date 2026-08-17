import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORY_EMOJI } from '@/components/wardrobe/wearStatus';

function isRealUrl(s) { return s && (s.startsWith('http://') || s.startsWith('https://')); }

export default function SwapOfferModal({ targetItem, wardrobeItems, onSend, onClose }) {
  const [selected, setSelected] = useState(null);
  const [customText, setCustomText] = useState('');
  const swappable = wardrobeItems.filter((i) => i.is_for_sale || (i.times_worn || 0) <= 2);

  const handleSend = () => {
    const offerText = selected
      ? `my ${selected.name}`
      : customText.trim() || 'one of my items';
    onSend(offerText);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-60" onClick={onClose} />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed bottom-0 inset-x-0 z-[61] bg-background rounded-t-[28px] max-h-[80vh] overflow-y-auto"
        style={{ maxWidth: 448, margin: '0 auto' }}
      >
        <div className="p-5">
          <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4" />
          <div className="flex items-center justify-between mb-1">
            <p className="font-extrabold text-lg">Make a swap offer</p>
            <button onClick={onClose}><X className="w-5 h-5" /></button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            What would you offer for <span className="font-bold text-foreground">{targetItem.name}</span>?
          </p>

          {swappable.length > 0 && (
            <>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">From your wardrobe</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {swappable.slice(0, 9).map((item) => {
                  const emoji = item.emoji || CATEGORY_EMOJI[item.category] || '✨';
                  const photo = isRealUrl(item.photo_url) ? item.photo_url : null;
                  const isSelected = selected?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelected(isSelected ? null : item)}
                      className="rounded-[16px] overflow-hidden border-2 transition-all"
                      style={{ borderColor: isSelected ? '#FF6B47' : 'transparent' }}
                    >
                      <div className="aspect-square flex items-center justify-center text-3xl bg-secondary">
                        {photo ? <img src={photo} alt={item.name} className="w-full h-full object-cover" /> : emoji}
                      </div>
                      <div className="p-1.5 bg-white">
                        <p className="text-[10px] font-bold truncate">{item.name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Or describe your offer</p>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="e.g. A Zara blazer size M, barely worn..."
            rows={2}
            className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm font-medium outline-none resize-none mb-4"
          />

          <button
            onClick={handleSend}
            disabled={!selected && !customText.trim()}
            className="w-full h-14 rounded-full font-extrabold text-base text-white disabled:opacity-50 transition-all active:scale-[0.98]"
            style={{ background: '#2ECC82' }}
          >
            Send swap offer 🔄
          </button>
        </div>
      </motion.div>
    </>
  );
}