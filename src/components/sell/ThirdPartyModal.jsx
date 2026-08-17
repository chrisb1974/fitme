import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getSuggestedPrice } from './sellUtils';

export default function ThirdPartyModal({ platform, item, onClose, onOpen }) {
  const price = getSuggestedPrice(item);

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
            <h2 className="text-xl font-extrabold">Listing on {platform}</h2>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 pb-8 space-y-3">
            <div className="bg-secondary rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-semibold">Title</span>
                <span className="font-bold">{item?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-semibold">Category</span>
                <span className="font-bold">{item?.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-semibold">Brand</span>
                <span className="font-bold">{item?.brand || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-semibold">Suggested price</span>
                <span className="font-extrabold text-primary">€{price}</span>
              </div>
            </div>

            <button
              onClick={onOpen}
              className="w-full h-14 rounded-full font-extrabold text-base bg-primary text-primary-foreground"
              style={{ boxShadow: '0 8px 24px -6px rgba(255,107,71,0.45)' }}
            >
              Open {platform} →
            </button>
            <button onClick={onClose} className="w-full text-sm text-muted-foreground font-semibold py-2">
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}