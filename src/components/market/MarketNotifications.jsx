import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { useFitMeToast } from '@/components/ui/FitMeToaster';

// App-wide realtime popups for the marketplace: fires a toast whenever an
// offer or message lands for you, or when an offer you sent is answered.
// Mounted once in AppShell so it works on every page (not just the Market tab).
export default function MarketNotifications() {
  const { user } = useAuth();
  const { toast } = useFitMeToast();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;
    const refreshInbox = () => qc.invalidateQueries({ queryKey: ['market-inbox'] });

    const ch = supabase
      .channel('market-notifications')
      // Someone made an offer on one of your listings
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'market_offer', filter: `to_user=eq.${user.id}` },
        ({ new: o }) => {
          const detail = o.type === 'swap'
            ? `Échange proposé${o.offered_item_title ? ` : ${o.offered_item_title}` : ''}`
            : `Offre de €${o.offered_price}`;
          toast({ title: '💶 Nouvelle offre', description: `${detail}${o.listing_title ? ` · ${o.listing_title}` : ''}` });
          refreshInbox();
        })
      // Someone sent you a message
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'market_message', filter: `to_user=eq.${user.id}` },
        ({ new: m }) => {
          toast({ title: '✉️ Nouveau message', description: `${m.from_name || 'Un membre'}${m.listing_title ? ` · ${m.listing_title}` : ''}` });
          refreshInbox();
        })
      // An offer you sent was accepted or declined
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'market_offer', filter: `from_user=eq.${user.id}` },
        ({ new: o }) => {
          if (o.status === 'accepted') {
            toast({ title: '✅ Offre acceptée !', description: o.listing_title ? `« ${o.listing_title} »` : 'Le vendeur a accepté ton offre.' });
            refreshInbox();
          } else if (o.status === 'declined') {
            toast({ title: 'Offre refusée', description: o.listing_title ? `« ${o.listing_title} »` : 'Le vendeur a refusé ton offre.' });
            refreshInbox();
          }
        })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [user?.id, toast, qc]);

  return null;
}
