import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Heart } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import MarketCard from './MarketCard';
import MarketFilterPanel from './MarketFilterPanel';
import MarketItemDetail from './MarketItemDetail';
import SellerProfile from './SellerProfile';

const SORT_OPTIONS = [
  { id: 'newest', label: 'Récent' },
  { id: 'price_asc', label: 'Prix ↑' },
  { id: 'price_desc', label: 'Prix ↓' },
];

const DEFAULT_FILTERS = {
  categories: [], sizes: [], conditions: [], listingType: 'All', maxPrice: 100, brand: '',
};

// Map a Supabase market_listing row to the shape the market UI expects.
function normalize(l) {
  return {
    id: l.id,
    name: l.title,
    brand: l.brand || '',
    category: l.category || '',
    size: l.size || '',
    condition: l.condition || 'Good',
    price: l.price ?? 0,
    listingType: l.listing_type || 'sale',
    seller: l.seller_handle || l.seller_name || 'membre',
    seller_name: l.seller_name || l.seller_handle || 'Membre',
    seller_handle: l.seller_handle || '',
    seller_location: l.seller_location || '',
    seller_style_dna: l.seller_style_dna || '',
    emoji: l.emoji || '🧥',
    cover_photo: l.cover_photo || (l.photos && l.photos[0]) || null,
    photos: l.photos || [],
    description: l.description || '',
    created_by: l.created_by,
  };
}

export default function FitMeMarket({ initialSearch = '' }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState('newest');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [showFavs, setShowFavs] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sellerHandle, setSellerHandle] = useState(null);

  const { data: rawListings = [], isLoading } = useQuery({
    queryKey: ['market-listings'],
    queryFn: () => base44.entities.MarketListing.filter({ status: 'active' }, '-created_at'),
    initialData: [],
  });

  const { data: favRows = [] } = useQuery({
    queryKey: ['market-favorites'],
    queryFn: () => base44.entities.MarketFavorite.list(),
    initialData: [],
  });

  const favMap = useMemo(() => {
    const m = new Map();
    favRows.forEach((f) => m.set(f.listing_id, f.id));
    return m;
  }, [favRows]);

  const toggleFav = async (listingId) => {
    if (favMap.has(listingId)) {
      await base44.entities.MarketFavorite.delete(favMap.get(listingId));
    } else {
      await base44.entities.MarketFavorite.create({ listing_id: listingId });
    }
    qc.invalidateQueries({ queryKey: ['market-favorites'] });
  };

  const listings = useMemo(
    // Hide the current user's own listings from Browse (they live under "Sell").
    () => rawListings.filter((l) => l.created_by !== user?.id).map(normalize),
    [rawListings, user]
  );

  const filtered = useMemo(() => {
    let list = showFavs ? listings.filter((i) => favMap.has(i.id)) : [...listings];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }
    if (filters.categories?.length) list = list.filter((i) => filters.categories.includes(i.category));
    if (filters.sizes?.length) list = list.filter((i) => filters.sizes.includes(i.size));
    if (filters.conditions?.length) list = list.filter((i) => filters.conditions.includes(i.condition));
    if (filters.listingType === 'For Sale') list = list.filter((i) => i.listingType !== 'swap');
    if (filters.listingType === 'Swap only') list = list.filter((i) => i.listingType === 'swap' || i.listingType === 'both');
    if (filters.maxPrice < 100) list = list.filter((i) => i.listingType === 'swap' || i.price <= filters.maxPrice);
    if (filters.brand?.trim()) list = list.filter((i) => i.brand.toLowerCase().includes(filters.brand.toLowerCase()));

    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);

    return list;
  }, [listings, search, sort, filters, favMap, showFavs]);

  const activeFilterCount = (filters.categories?.length || 0) + (filters.sizes?.length || 0) + (filters.conditions?.length || 0) + (filters.listingType !== 'All' ? 1 : 0) + (filters.brand ? 1 : 0) + (filters.maxPrice < 100 ? 1 : 0);

  return (
    <div className="pb-4">
      {/* Search bar */}
      <div className="px-5 mb-3 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#A8A8A8' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une pièce, une marque…"
            className="w-full h-11 pl-10 pr-4 text-sm font-body outline-none bg-white"
            style={{ fontFamily: 'DM Sans, sans-serif', border: '1px solid #E8E6E1', borderRadius: '2px', color: '#0F0F0F' }}
          />
        </div>
        <button
          onClick={() => setShowFavs((p) => !p)}
          className="relative w-11 h-11 flex items-center justify-center"
          style={{ background: showFavs ? '#0F0F0F' : '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px' }}
        >
          <Heart className="w-4 h-4" fill={showFavs ? '#fff' : 'none'} stroke={showFavs ? '#fff' : '#6B6B6B'} />
          {favMap.size > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-body text-white flex items-center justify-center" style={{ background: '#C9A96E', fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>
              {favMap.size}
            </span>
          )}
        </button>
        <button
          onClick={() => setShowFilters(true)}
          className="relative w-11 h-11 flex items-center justify-center"
          style={{ background: activeFilterCount > 0 ? '#0F0F0F' : '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px' }}
        >
          <SlidersHorizontal className="w-4 h-4" style={{ color: activeFilterCount > 0 ? '#fff' : '#6B6B6B' }} />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-body text-white flex items-center justify-center" style={{ background: '#C9A96E', fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Sort chips */}
      <div className="flex gap-2 px-5 mb-4 overflow-x-auto hide-scrollbar">
        {SORT_OPTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSort(s.id)}
            className="h-8 px-3 text-xs font-body whitespace-nowrap transition-all shrink-0"
            style={{
              fontFamily: 'DM Sans, sans-serif', fontWeight: 500, borderRadius: '2px',
              background: sort === s.id ? '#0F0F0F' : '#F5F4F1',
              color: sort === s.id ? '#fff' : '#6B6B6B',
              border: sort === s.id ? '1px solid #0F0F0F' : '1px solid #E8E6E1',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {showFavs && (
        <p className="px-5 text-[11px] font-body uppercase tracking-[0.06em] font-medium mb-3" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
          Favoris ({favMap.size})
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>Chargement du marché…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-4xl mb-2">🛍️</p>
          <p className="font-display text-lg" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>{showFavs ? 'Aucun favori' : 'Aucune annonce'}</p>
          <p className="text-sm font-body mt-1" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>{showFavs ? 'Ajoute des pièces en favori (♥)' : "Reviens bientôt, ou mets une pièce en vente depuis l'armoire"}</p>
        </div>
      ) : (
        <div className="px-5 grid grid-cols-2 gap-3">
          {filtered.map((item) => (
            <MarketCard
              key={item.id}
              item={item}
              isFaved={favMap.has(item.id)}
              onFav={toggleFav}
              onOpen={() => setSelectedItem(item)}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showFilters && (
          <MarketFilterPanel filters={filters} onChange={setFilters} onClose={() => setShowFilters(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedItem && (
          <MarketItemDetail
            item={selectedItem}
            isFaved={favMap.has(selectedItem.id)}
            onFav={toggleFav}
            onClose={() => setSelectedItem(null)}
            onOpenSeller={(handle) => setSellerHandle(handle)}
            allListings={listings}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sellerHandle && (
          <SellerProfile
            handle={sellerHandle}
            onClose={() => setSellerHandle(null)}
            onOpenItem={(it) => { setSellerHandle(null); setSelectedItem(it); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
