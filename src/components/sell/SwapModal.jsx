import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { CATEGORY_EMOJI } from '@/components/wardrobe/wearStatus';

function isRealUrl(str) {
  return str && (str.startsWith('http://') || str.startsWith('https://'));
}

export default function SwapModal({ item, onClose, onPosted }) {
  const [request, setRequest] = useState('');
  const emoji = item?.emoji || CATEGORY_EMOJI[item?.category] || '✨';
  const realPhoto = isRealUrl(item?.photo_url) ? item.photo_url : null;

  return (
    <AnimatePresence>
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
          className="w-full max-w-md bg-background rounded-t-[32px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pt-3 flex justify-center">
            <div className="w-10 h-1.5 rounded-full bg-border" />
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <h2 className="text-xl font-extrabold">Post Swap Offer</h2>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 pb-8 space-y-4">
            <div className="flex items-center gap-3 bg-secondary rounded-2xl p-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex items-center justify-center text-xl shrink-0">
                {realPhoto ? <img src={realPhoto} alt={item.name} className="w-full h-full object-cover" /> : emoji}
              </div>
              <p className="font-extrabold text-sm">{item?.name}</p>
            </div>

            <div>
              <p className="text-sm font-bold mb-2">What would you like in exchange?</p>
              <textarea
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                placeholder="e.g. Looking for white sneakers size 38 or a denim jacket…"
                rows={3}
                className="w-full bg-white rounded-2xl px-3 py-3 text-sm border border-input outline-none resize-none"
              />
            </div>

            <button
              onClick={() => request.trim() && onPosted()}
              disabled={!request.trim()}
              className="w-full h-14 rounded-full font-extrabold text-base flex items-center justify-center disabled:opacity-50"
              style={{ background: '#2ECC82', color: '#fff', boxShadow: '0 8px 24px -6px rgba(46,204,130,0.45)' }}
            >
              Post swap offer 🔄
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}