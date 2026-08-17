import React, { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import FitMeMarket from '@/components/market/FitMeMarket';
import MarketMessagesSheet from '@/components/market/MarketMessagesSheet';

export default function Market() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showMessages, setShowMessages] = useState(false);

  const { data: received = [] } = useQuery({
    queryKey: ['market-inbox', 'msgs', user?.id],
    queryFn: () => base44.entities.MarketMessage.list('-created_at'),
    initialData: [], enabled: !!user?.id,
  });
  const { data: offers = [] } = useQuery({
    queryKey: ['market-inbox', 'offers', user?.id],
    queryFn: () => base44.entities.MarketOffer.list('-created_at'),
    initialData: [], enabled: !!user?.id,
  });

  const unread =
    received.filter((m) => m.to_user === user?.id && !m.is_read).length +
    offers.filter((o) => o.to_user === user?.id && o.status === 'pending').length;

  // Live badge: refetch inbox on any message/offer change involving me.
  useEffect(() => {
    if (!user?.id) return;
    const refetch = () => qc.invalidateQueries({ queryKey: ['market-inbox'] });
    const ch = supabase
      .channel('market-inbox')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'market_message' }, refetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'market_offer' }, refetch)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, qc]);

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="px-5 pt-10 pb-4 flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] font-body font-medium mb-1" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>FitMe</p>
          <h1 className="text-[28px] leading-tight font-display font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>Le Marché</h1>
          <p className="text-sm font-body mt-1" style={{ color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}>Achète & échange entre membres</p>
        </div>
        <button
          onClick={() => setShowMessages(true)}
          className="relative w-10 h-10 flex items-center justify-center shrink-0"
          style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px' }}
        >
          <Mail className="w-4 h-4" style={{ color: '#0F0F0F' }} />
          {unread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-body text-white flex items-center justify-center" style={{ background: '#8B3A3A', fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>
              {unread}
            </span>
          )}
        </button>
      </div>

      <FitMeMarket />

      <AnimatePresence>
        {showMessages && <MarketMessagesSheet onClose={() => setShowMessages(false)} />}
      </AnimatePresence>
    </div>
  );
}
