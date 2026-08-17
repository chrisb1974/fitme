import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

function isRealUrl(str) {
  return str && (str.startsWith('http://') || str.startsWith('https://'));
}

function normalize(l) {
  return {
    id: l.id, name: l.title, brand: l.brand || '', category: l.category || '', size: l.size || '',
    condition: l.condition || 'Good', price: l.price ?? 0, listingType: l.listing_type || 'sale',
    seller: l.seller_handle || l.seller_name || 'membre', seller_name: l.seller_name || l.seller_handle || 'Membre',
    seller_handle: l.seller_handle || '', seller_location: l.seller_location || '', seller_style_dna: l.seller_style_dna || '',
    emoji: l.emoji || '🧥', cover_photo: l.cover_photo || (l.photos && l.photos[0]) || null, photos: l.photos || [],
    description: l.description || '', created_by: l.created_by,
  };
}

export default function SellerProfile({ handle, onClose, onOpenItem }) {
  const { data: raw = [], isLoading } = useQuery({
    queryKey: ['seller-listings', handle],
    queryFn: () => base44.entities.MarketListing.filter({ seller_handle: handle, status: 'active' }, '-created_at'),
    initialData: [],
  });

  const listings = raw.map(normalize);
  const seller = listings[0];
  const name = seller?.seller_name || handle;
  const initial = (name || 'M')[0].toUpperCase();

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="fixed inset-0 bg-white z-[55] overflow-y-auto"
      style={{ maxWidth: 448, margin: '0 auto' }}
    >
      <div className="px-5 pt-12 pb-2">
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-white" style={{ border: '1px solid #E8E6E1', borderRadius: '2px' }}>
          <ArrowLeft className="w-4 h-4" style={{ color: '#0F0F0F' }} />
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col items-center text-center px-5 pt-2 pb-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center font-display text-3xl text-white" style={{ background: '#0F0F0F', fontFamily: 'Playfair Display, serif' }}>
          {initial}
        </div>
        <h1 className="font-display font-semibold text-2xl mt-3" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>{name}</h1>
        <p className="text-sm font-body mt-0.5" style={{ color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}>
          @{handle}{seller?.seller_location ? ` · ${seller.seller_location}` : ''}
        </p>
        {seller?.seller_style_dna && (
          <span className="mt-2 text-[11px] font-body font-semibold px-3 py-1.5" style={{ color: '#9c7f47', background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.4)', borderRadius: '999px', fontFamily: 'DM Sans, sans-serif' }}>
            ADN de style — {seller.seller_style_dna}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="mx-5 flex" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
        <div className="flex-1 text-center py-3">
          <p className="font-display font-semibold text-lg" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>{listings.length}</p>
          <p className="text-[10px] uppercase tracking-[0.06em] font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>Annonces</p>
        </div>
        <div className="flex-1 text-center py-3 flex flex-col items-center" style={{ borderLeft: '1px solid #E8E6E1' }}>
          <p className="font-display font-semibold text-lg flex items-center gap-1" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>
            <Star className="w-3.5 h-3.5" fill="#C9A96E" stroke="#C9A96E" />5.0
          </p>
          <p className="text-[10px] uppercase tracking-[0.06em] font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>Note</p>
        </div>
      </div>

      {/* Listings */}
      <p className="px-5 mt-6 mb-3 text-[11px] uppercase tracking-[0.16em] font-body font-semibold" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>Ses annonces</p>
      {isLoading ? (
        <p className="px-5 py-8 text-center text-sm font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>Chargement…</p>
      ) : (
        <div className="px-5 grid grid-cols-2 gap-3 pb-10">
          {listings.map((s) => {
            const cover = isRealUrl(s.cover_photo) ? s.cover_photo : null;
            return (
              <button key={s.id} onClick={() => onOpenItem(s)} className="bg-white text-left overflow-hidden active:scale-[0.97] transition-transform" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
                <div className="w-full aspect-square flex items-center justify-center text-5xl overflow-hidden" style={{ background: '#F5F4F1' }}>
                  {cover ? <img src={cover} alt={s.name} className="w-full h-full object-cover" /> : s.emoji}
                </div>
                <div className="p-2.5">
                  <p className="font-body text-sm leading-tight truncate" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: '#0F0F0F' }}>{s.name}</p>
                  <p className="text-[11px] font-body mt-0.5" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>{s.brand}{s.size ? ` · ${s.size}` : ''}</p>
                  <p className="font-display font-semibold text-sm mt-1" style={{ color: '#0F0F0F', fontFamily: 'Playfair Display, serif' }}>
                    {s.listingType === 'swap' ? 'Échange' : `€${s.price}`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
