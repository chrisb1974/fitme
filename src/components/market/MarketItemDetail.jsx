import React, { useState } from 'react';
import { ArrowLeft, Heart, MessageCircle, Tag, Repeat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatThread from './ChatThread';

const CONDITION_STYLE = {
  'New with tags': { bg: 'rgba(74,124,89,0.1)', color: '#4A7C59' },
  'Like new':      { bg: 'rgba(74,124,89,0.1)', color: '#4A7C59' },
  'Good':          { bg: 'rgba(201,169,110,0.12)', color: '#b5893d' },
  'Fair':          { bg: 'rgba(168,168,168,0.15)', color: '#6B6B6B' },
};

function isRealUrl(str) {
  return str && (str.startsWith('http://') || str.startsWith('https://'));
}

export default function MarketItemDetail({ item, isFaved, onFav, onClose, onOpenSeller, allListings = [] }) {
  const [chat, setChat] = useState(null); // null | 'message' | 'price' | 'swap'
  const condStyle = CONDITION_STYLE[item.condition] || CONDITION_STYLE['Good'];
  const similar = allListings.filter((l) => l.id !== item.id && l.category === item.category).slice(0, 4);
  const sellerInitial = (item.seller || 'M')[0].toUpperCase();
  const cover = isRealUrl(item.cover_photo) ? item.cover_photo : null;
  const isSwap = item.listingType === 'swap';

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="fixed inset-0 bg-white z-50 overflow-y-auto"
      style={{ maxWidth: 448, margin: '0 auto' }}
    >
      {/* Photo area */}
      <div
        className="relative w-full flex items-center justify-center text-8xl overflow-hidden"
        style={{ background: '#F5F4F1', minHeight: 300 }}
      >
        {cover ? <img src={cover} alt={item.name} className="w-full object-cover" style={{ maxHeight: 420 }} /> : item.emoji}
        <button
          onClick={onClose}
          className="absolute top-12 left-4 w-9 h-9 flex items-center justify-center bg-white"
          style={{ border: '1px solid #E8E6E1', borderRadius: '2px' }}
        >
          <ArrowLeft className="w-4 h-4" style={{ color: '#0F0F0F' }} />
        </button>
        <button
          onClick={() => onFav(item.id)}
          className="absolute top-12 right-4 w-9 h-9 flex items-center justify-center bg-white"
          style={{ border: '1px solid #E8E6E1', borderRadius: '2px' }}
        >
          <Heart className="w-4 h-4" fill={isFaved ? '#8B3A3A' : 'none'} stroke={isFaved ? '#8B3A3A' : '#6B6B6B'} />
        </button>
        <span
          className="absolute bottom-4 left-4 text-xs font-body uppercase tracking-[0.06em] px-2 py-1"
          style={{ borderRadius: '2px', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, background: '#fff', border: '1px solid #E8E6E1', color: condStyle.color }}
        >
          {item.condition}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Title + price */}
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display font-bold text-2xl flex-1 leading-tight" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>{item.name}</h2>
          {isSwap ? (
            <span className="text-sm font-body px-3 py-1 shrink-0 uppercase tracking-[0.06em]" style={{ background: 'rgba(201,169,110,0.12)', color: '#9c7f47', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
              Échange
            </span>
          ) : (
            <span className="font-display font-bold shrink-0" style={{ fontSize: '24px', color: '#0F0F0F', fontFamily: 'Playfair Display, serif' }}>€{item.price}</span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex gap-2 flex-wrap">
          {[item.brand, item.size, item.category].filter(Boolean).map((v) => (
            <span key={v} className="h-7 px-3 text-xs font-body flex items-center" style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px', color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{v}</span>
          ))}
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm font-body leading-relaxed" style={{ color: '#33302c', fontFamily: 'DM Sans, sans-serif' }}>{item.description}</p>
        )}

        {/* Seller */}
        <button
          onClick={() => item.seller_handle && onOpenSeller(item.seller_handle)}
          className="w-full text-left p-4 flex items-center gap-3"
          style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '4px' }}
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center font-display font-semibold text-white shrink-0" style={{ background: '#0F0F0F', fontFamily: 'Playfair Display, serif' }}>
            {sellerInitial}
          </div>
          <div className="flex-1">
            <p className="font-body font-semibold text-sm" style={{ fontFamily: 'DM Sans, sans-serif', color: '#0F0F0F' }}>{item.seller_name}</p>
            <p className="text-xs font-body mt-0.5" style={{ color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}>
              @{item.seller_handle}{item.seller_location ? ` · ${item.seller_location}` : ''}
            </p>
            {item.seller_style_dna && (
              <p className="text-[11px] font-body mt-1" style={{ color: '#9c7f47', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>ADN — {item.seller_style_dna}</p>
            )}
          </div>
          <span className="text-lg" style={{ color: '#A8A8A8' }}>›</span>
        </button>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => setChat('message')}
            className="w-full font-body text-sm font-semibold text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            style={{ background: '#0F0F0F', borderRadius: '4px', padding: '15px', fontFamily: 'DM Sans, sans-serif' }}
          >
            <MessageCircle className="w-4 h-4" />
            Contacter le vendeur
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setChat('price')}
              className="flex-1 font-body text-xs font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              style={{ border: '1px solid #C9A96E', color: '#9c7f47', borderRadius: '4px', padding: '13px', fontFamily: 'DM Sans, sans-serif' }}
            >
              <Tag className="w-3.5 h-3.5" /> Faire une offre
            </button>
            <button
              onClick={() => setChat('swap')}
              className="flex-1 font-body text-xs font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              style={{ border: '1px solid #C9A96E', color: '#9c7f47', borderRadius: '4px', padding: '13px', fontFamily: 'DM Sans, sans-serif' }}
            >
              <Repeat className="w-3.5 h-3.5" /> Échange
            </button>
          </div>
        </div>

        {/* Similar items */}
        {similar.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.08em] font-body font-medium mb-3 mt-2" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>Pièces similaires</p>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              {similar.map((s) => {
                const sCover = isRealUrl(s.cover_photo) ? s.cover_photo : null;
                return (
                  <div key={s.id} className="shrink-0 w-28 bg-white overflow-hidden" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
                    <div className="w-full aspect-square flex items-center justify-center text-3xl overflow-hidden" style={{ background: '#F5F4F1' }}>
                      {sCover ? <img src={sCover} alt={s.name} className="w-full h-full object-cover" /> : s.emoji}
                    </div>
                    <div className="p-2">
                      <p className="text-[11px] font-body truncate" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: '#0F0F0F' }}>{s.name}</p>
                      <p className="text-[11px] font-body font-semibold mt-0.5" style={{ color: '#9c7f47', fontFamily: 'DM Sans, sans-serif' }}>
                        {s.listingType === 'swap' ? 'Échange' : `€${s.price}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {chat && (
          <ChatThread
            listingId={item.id}
            otherUserId={item.created_by}
            otherName={item.seller_name}
            listingTitleFallback={item.name}
            listingEmojiFallback={item.emoji}
            initialAction={chat === 'message' ? null : chat}
            onClose={() => setChat(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
