import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useFitMeToast } from '@/components/ui/FitMeToaster';

export default function ContactSellerSheet({ item, onClose }) {
  const { user } = useAuth();
  const { toast } = useFitMeToast();
  const [body, setBody] = useState(`Bonjour ! Je suis intéressé·e par « ${item.name} ». Est-elle toujours disponible ?`);
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      await base44.entities.MarketMessage.create({
        listing_id: item.id,
        to_user: item.created_by,
        body: body.trim(),
        listing_title: item.name,
        from_name: user?.full_name || 'Un membre FitMe',
      });
      toast({ description: 'Message envoyé au vendeur ✉️', duration: 2500 });
      onClose();
    } catch (e) {
      toast({ description: "Échec de l'envoi. Réessaie.", duration: 2500 });
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="w-full max-w-md bg-white rounded-t-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-3 flex justify-center"><div className="w-10 h-1.5 rounded-full" style={{ background: '#E8E6E1' }} /></div>
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="font-display font-semibold text-lg" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>Contacter le vendeur</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#F5F4F1' }}><X className="w-4 h-4" /></button>
        </div>

        <div className="px-5 pb-8 space-y-4">
          <div className="flex items-center gap-3 p-3" style={{ background: '#F5F4F1', borderRadius: '4px' }}>
            <div className="w-11 h-11 flex items-center justify-center text-2xl shrink-0 bg-white" style={{ borderRadius: '3px' }}>{item.emoji}</div>
            <div>
              <p className="font-body font-semibold text-sm" style={{ color: '#0F0F0F', fontFamily: 'DM Sans, sans-serif' }}>{item.name}</p>
              <p className="text-xs font-body" style={{ color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}>
                {item.listingType === 'swap' ? 'Échange' : `€${item.price}`} · @{item.seller_handle}
              </p>
            </div>
          </div>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full px-3 py-3 text-sm font-body outline-none resize-none bg-white"
            style={{ border: '1px solid #E8E6E1', borderRadius: '4px', color: '#0F0F0F', fontFamily: 'DM Sans, sans-serif' }}
          />

          <button
            onClick={send}
            disabled={sending || !body.trim()}
            className="w-full font-body text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: '#0F0F0F', borderRadius: '4px', padding: '15px', fontFamily: 'DM Sans, sans-serif' }}
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Envoyer
          </button>
          <p className="text-[11px] text-center font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
            Le vendeur verra ton message dans sa boîte de réception FitMe.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
