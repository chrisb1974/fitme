import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MESSAGES = [
  'Scanning your wardrobe…',
  'Matching the vibe…',
  'Curating the perfect look…',
  'Almost there…',
];

export default function GeneratingLoader() {
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % MESSAGES.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mx-5 mt-6 bg-white rounded-[28px] soft-shadow p-8 flex flex-col items-center text-center">
      {/* Animated coral rings */}
      <div className="relative w-20 h-20 mb-5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-primary"
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 1.8 }}
            transition={{ duration: 1.6, delay: i * 0.5, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
        <div className="absolute inset-0 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-3xl">✨</span>
        </div>
      </div>

      <p className="font-extrabold text-lg">FitMe is styling you…</p>
      <motion.p
        key={idx}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-muted-foreground mt-1"
      >
        {MESSAGES[idx]}
      </motion.p>
    </div>
  );
}