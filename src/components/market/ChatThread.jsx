import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Tag, Repeat, Loader2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import SwapItemPicker from './SwapItemPicker';

function isRealUrl(s) { return s && (s.startsWith('http://') || s.startsWith('https://')); }

// One conversation = all messages + offers about `listingId` between me and `otherUserId`.
export default function ChatThread({ listingId, otherUserId, otherName, listingTitleFallback, listingEmojiFallback, initialAction, onClose }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [showSwap, setShowSwap] = useState(initialAction === 'swap');
  const [showPrice, setShowPrice] = useState(initialAction === 'price');
  const [priceInput, setPriceInput] = useState('');
  const bottomRef = useRef(null);

  const { data: listing } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => base44.entities.MarketListing.get(listingId),
    initialData: null,
    retry: false,
  });

  const sellerId = listing?.created_by;
  const amISeller = !!sellerId && sellerId === user?.id;
  const listingTitle = listing?.title || listingTitleFallback || 'Annonce';
  const listingEmoji = listing?.emoji || listingEmojiFallback || '🧥';

  const { data: messages = [] } = useQuery({
    queryKey: ['thread-msgs', listingId],
    queryFn: () => base44.entities.MarketMessage.filter({ listing_id: listingId }, 'created_at'),
    initialData: [],
  });
  const { data: offers = [] } = useQuery({
    queryKey: ['thread-offers', listingId],
    queryFn: () => base44.entities.MarketOffer.filter({ listing_id: listingId }, 'created_at'),
    initialData: [],
  });

  // Keep only the exchange between me and the other party.
  const between = (r) =>
    (r.from_user === user?.id && r.to_user === otherUserId) ||
    (r.from_user === otherUserId && r.to_user === user?.id);

  const timeline = useMemo(() => {
    const items = [
      ...messages.filter(between).map((m) => ({ kind: 'msg', ts: m.created_at, data: m })),
      ...offers.filter(between).map((o) => ({ kind: 'offer', ts: o.created_at, data: o })),
    ];
    items.sort((a, b) => new Date(a.ts) - new Date(b.ts));
    return items;
  }, [messages, offers, user, otherUserId]);

  // Realtime: refetch on any change to this listing's messages/offers.
  useEffect(() => {
    const refetch = () => {
      qc.invalidateQueries({ queryKey: ['thread-msgs', listingId] });
      qc.invalidateQueries({ queryKey: ['thread-offers', listingId] });
    };
    const ch = supabase
      .channel(`thread-${listingId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'market_message', filter: `listing_id=eq.${listingId}` }, refetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'market_offer', filter: `listing_id=eq.${listingId}` }, refetch)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [listingId, qc]);

  // Mark incoming messages read.
  useEffect(() => {
    const unread = messages.filter((m) => m.to_user === user?.id && m.from_user === otherUserId && !m.is_read);
    if (unread.length === 0) return;
    Promise.all(unread.map((m) => base44.entities.MarketMessage.update(m.id, { is_read: true })))
      .then(() => qc.invalidateQueries({ queryKey: ['market-inbox'] }))
      .catch(() => {});
  }, [messages, user, otherUserId, qc]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [timeline.length]);

  const recipient = amISeller ? otherUserId : (sellerId || otherUserId);

  const sendText = async () => {
    if (!draft.trim() || sending) return;
    setSending(true);
    const body = draft.trim();
    setDraft('');
    try {
      await base44.entities.MarketMessage.create({
        listing_id: listingId, to_user: recipient, body,
        listing_title: listingTitle, from_name: user?.full_name || 'Un membre FitMe',
      });
    } catch { setDraft(body); }
    setSending(false);
  };

  const sendPriceOffer = async () => {
    const price = parseFloat(priceInput);
    if (!price || price <= 0) return;
    setShowPrice(false); setPriceInput('');
    await base44.entities.MarketOffer.create({
      listing_id: listingId, to_user: sellerId, type: 'price', offered_price: price,
      from_name: user?.full_name || 'Un membre FitMe', listing_title: listingTitle,
      message: `Offre de €${price}`,
    });
  };

  const sendSwapOffer = async (item) => {
    setShowSwap(false);
    await base44.entities.MarketOffer.create({
      listing_id: listingId, to_user: sellerId, type: 'swap',
      offered_item_id: item.id, offered_item_title: item.name,
      offered_item_emoji: item.emoji || '👕',
      from_name: user?.full_name || 'Un membre FitMe', listing_title: listingTitle,
      message: `Échange proposé : ${item.name}`,
    });
  };

  const respondOffer = async (offer, status) => {
    await base44.entities.MarketOffer.update(offer.id, { status });
  };

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 bg-white z-[65] flex flex-col"
      style={{ maxWidth: 448, margin: '0 auto' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-11 pb-3" style={{ borderBottom: '1px solid #E8E6E1' }}>
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center" style={{ border: '1px solid #E8E6E1', borderRadius: '2px' }}>
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-display" style={{ background: '#0F0F0F', fontFamily: 'Playfair Display, serif' }}>
          {(otherName || 'M')[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-body font-semibold text-sm truncate" style={{ fontFamily: 'DM Sans, sans-serif', color: '#0F0F0F' }}>{otherName || 'Membre'}</p>
          <p className="text-[11px] font-body truncate" style={{ color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}>{listingEmoji} {listingTitle}{listing?.price != null ? ` · €${listing.price}` : ''}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5" style={{ background: '#fff' }}>
        {timeline.length === 0 && (
          <p className="text-center text-sm font-body py-8" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>Démarre la conversation ✨</p>
        )}
        {timeline.map((it) => {
          if (it.kind === 'msg') {
            const m = it.data;
            if (m.type === 'system') {
              return <p key={m.id} className="text-center text-[11px] font-body py-1" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>{m.body}</p>;
            }
            const mine = m.from_user === user?.id;
            return (
              <div key={m.id} className={`max-w-[80%] px-3.5 py-2.5 text-sm font-body ${mine ? 'ml-auto' : 'mr-auto'}`}
                style={{ background: mine ? '#0F0F0F' : '#F5F4F1', color: mine ? '#fff' : '#0F0F0F', borderRadius: 14, borderBottomRightRadius: mine ? 4 : 14, borderBottomLeftRadius: mine ? 14 : 4, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.45 }}>
                {m.body}
              </div>
            );
          }
          // Offer card
          const o = it.data;
          const iAmRecipient = o.to_user === user?.id;
          const statusStyle = {
            pending:  { label: 'En attente', color: '#9c7f47' },
            accepted: { label: 'Acceptée', color: '#4A7C59' },
            declined: { label: 'Refusée', color: '#8B3A3A' },
            cancelled:{ label: 'Annulée', color: '#6B6B6B' },
          }[o.status] || { label: o.status, color: '#6B6B6B' };
          return (
            <div key={o.id} className={`max-w-[86%] ${o.from_user === user?.id ? 'ml-auto' : 'mr-auto'}`}
              style={{ border: '1px solid #C9A96E', borderRadius: 6, padding: 13, background: 'linear-gradient(100deg,rgba(201,169,110,0.12),rgba(201,169,110,0.03))' }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-body font-bold uppercase tracking-[0.14em]" style={{ color: '#9c7f47', fontFamily: 'DM Sans, sans-serif' }}>
                  {o.type === 'swap' ? 'Offre d’échange' : 'Offre de prix'}
                </span>
                <span className="text-[11px] font-body font-semibold" style={{ color: statusStyle.color, fontFamily: 'DM Sans, sans-serif' }}>{statusStyle.label}</span>
              </div>
              <div className="flex items-center gap-2.5 mt-2">
                <span className="text-2xl">{o.type === 'swap' ? (o.offered_item_emoji || '🔁') : '💶'}</span>
                <div className="flex-1 min-w-0">
                  {o.type === 'swap' ? (
                    <p className="text-sm font-body font-semibold" style={{ color: '#0F0F0F', fontFamily: 'DM Sans, sans-serif' }}>{o.offered_item_title}</p>
                  ) : (
                    <p className="font-display font-semibold text-lg" style={{ color: '#0F0F0F', fontFamily: 'Playfair Display, serif' }}>€{o.offered_price}</p>
                  )}
                  <p className="text-[11px] font-body truncate" style={{ color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}>pour {listingTitle}</p>
                </div>
              </div>
              {o.status === 'pending' && iAmRecipient && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => respondOffer(o, 'accepted')} className="flex-1 py-2 text-xs font-body font-semibold text-white" style={{ background: '#4A7C59', borderRadius: 3, fontFamily: 'DM Sans, sans-serif' }}>Accepter</button>
                  <button onClick={() => respondOffer(o, 'declined')} className="flex-1 py-2 text-xs font-body font-semibold" style={{ border: '1px solid #E8E6E1', color: '#0F0F0F', borderRadius: 3, fontFamily: 'DM Sans, sans-serif' }}>Refuser</button>
                </div>
              )}
              {o.status === 'pending' && !iAmRecipient && (
                <button onClick={() => respondOffer(o, 'cancelled')} className="w-full mt-3 py-2 text-xs font-body" style={{ color: '#8B3A3A', fontFamily: 'DM Sans, sans-serif' }}>Annuler l'offre</button>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="px-3 py-3 flex items-center gap-2" style={{ borderTop: '1px solid #E8E6E1' }}>
        {!amISeller && (
          <>
            <button onClick={() => setShowPrice(true)} title="Offre de prix" className="w-9 h-9 flex items-center justify-center shrink-0" style={{ border: '1px solid #E8E6E1', borderRadius: 999, color: '#9c7f47' }}><Tag className="w-4 h-4" /></button>
            <button onClick={() => setShowSwap(true)} title="Proposer un échange" className="w-9 h-9 flex items-center justify-center shrink-0" style={{ border: '1px solid #E8E6E1', borderRadius: 999, color: '#9c7f47' }}><Repeat className="w-4 h-4" /></button>
          </>
        )}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendText()}
          placeholder="Écris un message…"
          className="flex-1 h-10 px-4 text-sm font-body outline-none"
          style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: 999, color: '#0F0F0F', fontFamily: 'DM Sans, sans-serif' }}
        />
        <button onClick={sendText} disabled={sending || !draft.trim()} className="w-10 h-10 flex items-center justify-center shrink-0 text-white disabled:opacity-50" style={{ background: '#0F0F0F', borderRadius: 999 }}>
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      {/* Price offer prompt */}
      {showPrice && (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-end justify-center" onClick={() => setShowPrice(false)}>
          <div className="w-full max-w-md bg-white rounded-t-[24px] p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-semibold text-lg mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Ton offre de prix</h3>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl">€</span>
              <input type="number" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} autoFocus placeholder="ex. 38"
                className="flex-1 h-12 px-3 text-base font-body outline-none" style={{ border: '1px solid #E8E6E1', borderRadius: 4, fontFamily: 'DM Sans, sans-serif' }} />
            </div>
            <button onClick={sendPriceOffer} className="w-full mt-4 py-3.5 text-sm font-body font-semibold text-white" style={{ background: '#0F0F0F', borderRadius: 4, fontFamily: 'DM Sans, sans-serif' }}>Envoyer l'offre</button>
          </div>
        </div>
      )}

      {showSwap && (
        <SwapItemPicker onPick={sendSwapOffer} onClose={() => setShowSwap(false)} />
      )}
    </motion.div>
  );
}
