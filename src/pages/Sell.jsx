import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useFitMeToast } from '@/components/ui/FitMeToaster';
import { useLanguage } from '@/lib/i18n.jsx';
import { CATEGORY_EMOJI } from '@/components/wardrobe/wearStatus';
import { getSuggestedPrice, isSuggested, getDaysAgo } from '@/components/sell/sellUtils';
import SellItemCard from '@/components/sell/SellItemCard';
import SellModal from '@/components/sell/SellModal';
import SwapModal from '@/components/sell/SwapModal';
import ThirdPartyModal from '@/components/sell/ThirdPartyModal';

function isRealUrl(str) {
  return str && (str.startsWith('http://') || str.startsWith('https://'));
}

export default function Sell() {
  const { t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const [mainTab, setMainTab] = useState(urlParams.get('tab') === 'market' ? 'market' : 'myitems');
  const [marketInitialSearch, setMarketInitialSearch] = useState(urlParams.get('search') || '');
  const [activeTab, setActiveTab] = useState('suggestions');
  const [sellItem, setSellItem] = useState(null);
  const [sellInitialPhotos, setSellInitialPhotos] = useState(null);
  const [sellInitialFormData, setSellInitialFormData] = useState(null);
  const [swapItem, setSwapItem] = useState(null);
  const [thirdParty, setThirdParty] = useState(null); // { item, platform }
  const qc = useQueryClient();
  const { toast } = useFitMeToast();

  const { data: items = [] } = useQuery({
    queryKey: ['wardrobe'],
    queryFn: () => base44.entities.WardrobeItem.list(),
    initialData: [],
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.MarketListing.list(),
    initialData: [],
  });

  // Map wardrobe_item_id -> actual listing price
  const listingPriceMap = Object.fromEntries(
    listings.filter(l => l.price != null).map(l => [l.wardrobe_item_id, l.price])
  );

  const SELL_TABS = [
    { key: 'suggestions', label: t('suggestions') },
    { key: 'listed',      label: t('listedTabLabel') },
    { key: 'all',         label: t('allItems') },
  ];

  // Suggested = never worn or not worn in 30+ days
  const suggested = items
    .filter(isSuggested)
    .sort((a, b) => {
      const wornDiff = (a.times_worn || 0) - (b.times_worn || 0);
      if (wornDiff !== 0) return wornDiff;
      const da = getDaysAgo(a.last_worn_date) ?? 9999;
      const db = getDaysAgo(b.last_worn_date) ?? 9999;
      return db - da;
    });

  const allSorted = [...items].sort((a, b) => (a.times_worn || 0) - (b.times_worn || 0));
  const listedItems = items.filter((i) => i.is_for_sale);
  const listedCount = listedItems.length;

  const filteredItems =
    activeTab === 'suggestions' ? suggested :
    activeTab === 'listed' ? listedItems :
    allSorted;

  const unwornCount = items.filter(i => !i.is_for_sale && (i.times_worn || 0) === 0).length;
  const estimatedValue = suggested.reduce((sum, i) => sum + getSuggestedPrice(i), 0);

  const openSellModal = async (item) => {
    // For new listings, open immediately with no pre-load
    if (!item.is_for_sale) {
      setSellInitialPhotos(null);
      setSellInitialFormData(null);
      setSellItem(item);
      return;
    }

    // For edit mode: fetch first, THEN open modal so useState initializers get real values
    const listings = await base44.entities.MarketListing.filter({ wardrobe_item_id: item.id });
    const existing = listings[0];

    const photos = existing?.photos?.length > 0
      ? existing.photos.map((url, i) => ({ id: `existing-${i}`, preview: url, url, uploading: false }))
      : isRealUrl(item.photo_url)
        ? [{ id: 'main', preview: item.photo_url, url: item.photo_url, uploading: false }]
        : [];

    const formData = {
      title:       existing?.title       || item.name,
      description: existing?.description || item.notes || '',
      price:       existing?.price       != null ? String(existing.price) : '',
      condition:   existing?.condition   || 'Good',
      size:        existing?.size        || '',
    };

    setSellInitialPhotos(photos);
    setSellInitialFormData(formData);
    setSellItem(item); // open modal last, after all initial state is set
  };

  const handleListed = () => {
    qc.invalidateQueries({ queryKey: ['wardrobe'] });
    qc.invalidateQueries({ queryKey: ['listings'] });
    setSellItem(null);
    setSellInitialPhotos(null);
    setSellInitialFormData(null);
    toast({ description: 'Listed on FitMe Market! 🎉', duration: 2500 });
  };

  const handleSwapPosted = () => {
    setSwapItem(null);
    toast({ description: 'Swap offer posted! 🔄', duration: 2500 });
  };

  const handleThirdPartyOpen = () => {
    const name = thirdParty?.platform;
    setThirdParty(null);
    toast({ description: `Opening ${name}... (API integration coming soon)`, duration: 3000 });
  };

  const handleRemoveListing = async (item) => {
    await base44.entities.WardrobeItem.update(item.id, { is_for_sale: false });
    qc.invalidateQueries({ queryKey: ['wardrobe'] });
    toast({ description: 'Listing removed', duration: 2000 });
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="px-5 pt-10 pb-4">
        <p className="text-[11px] uppercase tracking-[0.1em] font-body font-medium mb-1" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>{t('declutter')}</p>
        <h1 className="text-[28px] leading-tight font-display font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>{t('sellAndSwap')}</h1>
        <p className="text-sm font-body mt-1" style={{ color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}>{t('sellSubtitle')}</p>
      </div>

      {/* Summary banner */}
      <div className="mx-5 p-5 text-white" style={{ background: '#0F0F0F', borderRadius: '4px' }}>
        <p className="font-body font-medium text-base leading-tight" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          {t('youHave')} <span style={{ color: '#C9A96E' }}>{unwornCount}</span> {t('itemsNotWorn')}
        </p>
        {listedCount > 0 && (
          <p className="font-body font-bold text-sm mt-2" style={{ color: '#22c55e', fontFamily: 'DM Sans, sans-serif' }}>
            {t('alreadyListed', listedCount)}
          </p>
        )}
        <p className="text-sm mt-1 font-body" style={{ color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}>
          {t('estimatedValue')}: <span className="font-semibold" style={{ color: '#C9A96E' }}>€{estimatedValue}</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 mt-4">
        {SELL_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 h-10 text-xs font-body uppercase tracking-[0.06em] font-semibold transition-all flex items-center justify-center gap-1.5"
            style={activeTab === tab.key
              ? { background: '#0F0F0F', color: '#fff', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' }
              : { background: '#F5F4F1', color: '#6B6B6B', border: '1px solid #E8E6E1', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' }
            }
          >
            {tab.label}
            {tab.key === 'listed' && listedCount > 0 && (
              <span style={{
                background: activeTab === 'listed' ? '#fff' : '#000',
                color: activeTab === 'listed' ? '#000' : '#fff',
                borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 900,
              }}>
                {listedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Items list */}
      <div className="px-5 mt-4 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="rounded-[24px] border-2 border-dashed border-border p-8 text-center">
            <p className="text-4xl">{activeTab === 'listed' ? '🏷️' : '🧺'}</p>
            <p className="font-bold mt-2">{activeTab === 'listed' ? t('noListedItems') : t('nothingToSuggest')}</p>
            <p className="text-xs text-muted-foreground mt-1">{activeTab === 'listed' ? t('listItemHint') : t('keepWearing')}</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <SellItemCard
              key={item.id}
              item={item}
              listingPrice={listingPriceMap[item.id]}
              onSell={(i) => openSellModal(i)}
              onSwap={(i) => setSwapItem(i)}
              onThirdParty={(i, p) => setThirdParty({ item: i, platform: p })}
              onRemove={handleRemoveListing}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {sellItem && (
          <SellModal
            item={sellItem}
            suggestedPrice={getSuggestedPrice(sellItem)}
            initialPhotos={sellInitialPhotos}
            initialFormData={sellInitialFormData}
            onClose={() => { setSellItem(null); setSellInitialPhotos(null); setSellInitialFormData(null); }}
            onListed={handleListed}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {swapItem && (
          <SwapModal
            item={swapItem}
            onClose={() => setSwapItem(null)}
            onPosted={handleSwapPosted}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {thirdParty && (
          <ThirdPartyModal
            platform={thirdParty.platform}
            item={thirdParty.item}
            onClose={() => setThirdParty(null)}
            onOpen={handleThirdPartyOpen}
          />
        )}
      </AnimatePresence>
    </div>
  );
}