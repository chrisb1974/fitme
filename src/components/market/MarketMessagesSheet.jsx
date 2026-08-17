import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import ChatThread from './ChatThread';

function timeAgo(iso) {
  if (!iso) return '';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} h`;
  return `${Math.floor(s / 86400)} j`;
}

export default function MarketMessagesSheet({ onClose }) {
  const { user } = useAuth();
  const [openThread, setOpenThread] = useState(null);

  const { data: messages = [] } = useQuery({
    queryKey: ['market-inbox', 'msgs', user?.id],
    queryFn: () => base44.entities.MarketMessage.list('-created_at'),
    initialData: [], enabled: !!user?.id,
  });
  const { data: offers = [] } = useQuery({
    queryKey: ['market-inbox', 'offers', user?.id],
    queryFn: () => base44.entities.MarketOffer.list('-created_at'),
    initialData: [], enabled: !!user?.id,
  });

  const listingIds = useMemo(
    () => [...new Set([...messages, ...offers].map((r) => r.listing_id).filter(Boolean))],
    [messages, offers]
  );
  const { data: listings = [] } = useQuery({
    queryKey: ['market-inbox', 'listings', listingIds.join(',')],
    queryFn: () => (listingIds.length ? base44.entities.MarketListing.filter({ id: listingIds }) : []),
    initialData: [], enabled: listingIds.length > 0,
  });
  const listingById = useMemo(() => Object.fromEntries(listings.map((l) => [l.id, l])), [listings]);

  const conversations = useMemo(() => {
    const rows = [
      ...messages.map((m) => ({ ...m, _kind: 'msg' })),
      ...offers.map((o) => ({ ...o, _kind: 'offer' })),
    ];
    const groups = {};
    rows.forEach((r) => {
      if (!r.listing_id) return;
      const other = r.from_user === user?.id ? r.to_user : r.from_user;
      const key = `${r.listing_id}::${other}`;
      (groups[key] = groups[key] || { listing_id: r.listing_id, other, items: [] }).items.push(r);
    });
    return Object.values(groups).map((g) => {
      g.items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const last = g.items[0];
      const fromOther = g.items.find((r) => r.from_user === g.other);
      const listing = listingById[g.listing_id];
      const otherName = fromOther?.from_name || listing?.seller_name || 'Membre';
      const unread = g.items.filter((r) => r._kind === 'msg' && r.to_user === user?.id && !r.is_read).length;
      const preview = last._kind === 'offer'
        ? (last.type === 'swap' ? `↔ Échange : ${last.offered_item_title}` : `€ Offre : €${last.offered_price}`)
        : last.body;
      return {
        key: `${g.listing_id}::${g.other}`,
        listing_id: g.listing_id, other: g.other, otherName,
        listing_title: last.listing_title || listing?.title || 'Annonce',
        listing_emoji: listing?.emoji || '🧥',
        preview, ts: last.created_at, unread,
      };
    }).sort((a, b) => new Date(b.ts) - new Date(a.ts));
  }, [messages, offers, user, listingById]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="w-full max-w-md bg-white rounded-t-[24px] max-h-[82vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pt-3 flex justify-center"><div className="w-10 h-1.5 rounded-full" style={{ background: '#E8E6E1' }} /></div>
          <div className="flex items-center justify-between px-5 py-3 sticky top-0 bg-white z-10">
            <h2 className="font-display font-semibold text-lg" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>Messages</h2>
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#F5F4F1' }}><X className="w-4 h-4" /></button>
          </div>

          <div className="px-4 pb-8">
            {conversations.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-4xl mb-2">✉️</p>
                <p className="font-display text-lg" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>Aucune conversation</p>
                <p className="text-sm font-body mt-1" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>Contacte un vendeur ou reçois une offre pour démarrer.</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: '#E8E6E1' }}>
                {conversations.map((c) => (
                  <button key={c.key} onClick={() => setOpenThread(c)} className="w-full flex items-center gap-3 py-3 text-left">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-display shrink-0" style={{ background: '#0F0F0F', fontFamily: 'Playfair Display, serif' }}>
                      {(c.otherName || 'M')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-body font-semibold text-sm truncate" style={{ color: '#0F0F0F', fontFamily: 'DM Sans, sans-serif' }}>{c.otherName}</p>
                        <span className="text-[11px] font-body shrink-0" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>{timeAgo(c.ts)}</span>
                      </div>
                      <p className="text-[11px] font-body truncate" style={{ color: '#9c7f47', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>{c.listing_emoji} {c.listing_title}</p>
                      <p className="text-xs font-body truncate mt-0.5" style={{ color: c.unread ? '#0F0F0F' : '#6B6B6B', fontFamily: 'DM Sans, sans-serif', fontWeight: c.unread ? 600 : 400 }}>{c.preview}</p>
                    </div>
                    {c.unread > 0 && <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: '#8B3A3A' }} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {openThread && (
          <ChatThread
            listingId={openThread.listing_id}
            otherUserId={openThread.other}
            otherName={openThread.otherName}
            listingTitleFallback={openThread.listing_title}
            listingEmojiFallback={openThread.listing_emoji}
            onClose={() => setOpenThread(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
