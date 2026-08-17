import React from 'react';
import { motion } from 'framer-motion';

export default function DeleteConfirmDialog({ onCancel, onConfirm }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-end justify-center"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        className="w-full max-w-md bg-background rounded-t-[32px] px-5 pt-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1.5 rounded-full bg-border" />
        </div>
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🗑️</span>
        </div>
        <h2 className="text-xl font-extrabold text-center">Remove this item?</h2>
        <p className="text-sm text-muted-foreground text-center mt-2">
          "Remove this item from your wardrobe?" This can't be undone.
        </p>
        <div className="mt-6 space-y-3">
          <button
            onClick={onConfirm}
            className="w-full h-13 rounded-full bg-destructive text-white font-extrabold text-base py-3"
          >
            Remove
          </button>
          <button
            onClick={onCancel}
            className="w-full h-13 rounded-full bg-secondary font-extrabold text-base py-3"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}