import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CATEGORY_EMOJI } from '@/components/wardrobe/wearStatus';

function isRealUrl(s) { return s && (s.startsWith('http://') || s.startsWith('https://')); }

export default function SwapItemPicker({ onPick, onClose }) {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['wardrobe'],
    queryFn: () => base44.entities.WardrobeItem.list('-created_at'),
    initialData: [],
  });

  return (
    <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-end justify-center" onClick={onClose}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="w-full max-w-md bg-white rounded-t-[24px] max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-3 flex justify-center"><div className="w-10 h-1.5 rounded-full" style={{ background: '#E8E6E1' }} /></div>
        <div className="flex items-center justify-between px-5 py-3 sticky top-0 bg-white">
          <div>
            <h2 className="font-display font-semibold text-lg" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>Proposer un échange</h2>
            <p className="text-xs font-body" style={{ color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}>Choisis une pièce de ton armoire</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#F5F4F1' }}><X className="w-4 h-4" /></button>
        </div>

        <div className="px-5 pb-8">
          {isLoading ? (
            <p className="py-8 text-center text-sm font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>Chargement…</p>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>Ton armoire est vide.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {items.map((it) => {
                const cover = isRealUrl(it.photo_url) ? it.photo_url : null;
                const emoji = it.emoji || CATEGORY_EMOJI[it.category] || '👕';
                return (
                  <button key={it.id} onClick={() => onPick({ ...it, emoji })} className="text-left active:scale-95 transition-transform">
                    <div className="w-full aspect-square flex items-center justify-center text-4xl overflow-hidden" style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: 4 }}>
                      {cover ? <img src={cover} alt={it.name} className="w-full h-full object-cover" /> : emoji}
                    </div>
                    <p className="text-[11px] font-body truncate mt-1" style={{ color: '#0F0F0F', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>{it.name}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
