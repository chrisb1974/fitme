import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useFitMeToast } from '@/components/ui/FitMeToaster';
import { base44 } from '@/api/base44Client';
import { seedWardrobe } from '@/lib/seedWardrobe';
import WardrobeHeader from '@/components/wardrobe/WardrobeHeader';
import CategoryFilter from '@/components/wardrobe/CategoryFilter';
import ColorFilter from '@/components/wardrobe/ColorFilter';
import SortButton from '@/components/wardrobe/SortButton';
import WardrobeItemCard from '@/components/wardrobe/WardrobeItemCard';
import EmptyWardrobe from '@/components/wardrobe/EmptyWardrobe';
import AddItemModal from '@/components/wardrobe/AddItemModal';
import AddMenu from '@/components/wardrobe/AddMenu';
import BatchScanSession from '@/components/wardrobe/BatchScanSession';
import GalleryImport from '@/components/wardrobe/GalleryImport';
import ItemDetailScreen from '@/components/wardrobe/ItemDetailScreen';
import OutfitBuilder from '@/components/outfits/OutfitBuilder';
import OutfitDetailSheet from '@/components/outfits/OutfitDetailSheet';
import { getWearStatus, COLOR_OPTIONS } from '@/components/wardrobe/wearStatus';
import { useLanguage } from '@/lib/i18n.jsx';

function sortItems(items, sortKey) {
  const arr = [...items];
  if (sortKey === 'most_worn') return arr.sort((a, b) => (b.times_worn || 0) - (a.times_worn || 0));
  if (sortKey === 'least_worn') return arr.sort((a, b) => (a.times_worn || 0) - (b.times_worn || 0));
  if (sortKey === 'last_worn') {
    return arr.sort((a, b) => {
      if (!a.last_worn_date) return 1;
      if (!b.last_worn_date) return -1;
      return new Date(b.last_worn_date) - new Date(a.last_worn_date);
    });
  }
  // date_added (default)
  return arr.sort((a, b) => {
    if (!a.date_added) return 1;
    if (!b.date_added) return -1;
    return new Date(b.date_added) - new Date(a.date_added);
  });
}

function matchesColor(item, colorFilter) {
  if (colorFilter === 'All') return true;
  const itemColor = (item.color || '').toLowerCase();
  return itemColor.includes(colorFilter.toLowerCase());
}

export default function Wardrobe() {
  const { t, lang } = useLanguage();
  const [activeCat, setActiveCat] = useState('All');
  const [activeColor, setActiveColor] = useState('All');
  const [sortKey, setSortKey] = useState('date_added');
  const [modalOpen, setModalOpen] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showBatchScan, setShowBatchScan] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [showOutfitBuilder, setShowOutfitBuilder] = useState(false);
  const [outfitInitialItem, setOutfitInitialItem] = useState(null);
  const [editOutfit, setEditOutfit] = useState(null);
  const [viewOutfit, setViewOutfit] = useState(null);
  const [myOutfits, setMyOutfits] = useState([]);
  const qc = useQueryClient();
  const { toast } = useFitMeToast();

  useEffect(() => {
    base44.entities.SavedLook.list().then(all => {
      setMyOutfits(all.filter(o => o.is_manual === true));
    }).catch(() => {});
  }, []);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['wardrobe'],
    queryFn: () => base44.entities.WardrobeItem.list(),
    initialData: [],
  });

  const unwornCount = items.filter((i) => getWearStatus(i.last_worn_date).color === 'red').length;

  const filtered = sortItems(
    items.filter((i) => {
      const catMatch = activeCat === 'All' || i.category === activeCat;
      const colorMatch = matchesColor(i, activeColor);
      return catMatch && colorMatch;
    }),
    sortKey
  );

  const handleMarkWorn = async (item) => {
    const today = new Date().toISOString().slice(0, 10);
    await base44.entities.WardrobeItem.update(item.id, {
      times_worn: (item.times_worn || 0) + 1,
      last_worn_date: today,
    });
    qc.invalidateQueries({ queryKey: ['wardrobe'] });
    toast({ description: 'Marked as worn today! 👗', duration: 2000 });
  };

  const handleItemUpdate = (updated) => {
    qc.invalidateQueries({ queryKey: ['wardrobe'] });
    // keep detail screen open with updated data
    setSelectedItem(updated);
  };

  const handleItemDelete = () => {
    qc.invalidateQueries({ queryKey: ['wardrobe'] });
    setSelectedItem(null);
  };

  const handleBatchDone = (count) => {
    setShowBatchScan(false);
    qc.invalidateQueries({ queryKey: ['wardrobe'] });
    toast({ description: `${count} article${count !== 1 ? 's' : ''} ajouté${count !== 1 ? 's' : ''} au dressing! 🎉` });
  };

  const handleGalleryDone = (count) => {
    setShowGallery(false);
    qc.invalidateQueries({ queryKey: ['wardrobe'] });
    toast({ description: `${count} article${count !== 1 ? 's' : ''} ajouté${count !== 1 ? 's' : ''} au dressing! 🎉` });
  };

  const handleLoadSample = async () => {
    setSeeding(true);
    await seedWardrobe(toast);
    qc.invalidateQueries({ queryKey: ['wardrobe'] });
    setSeeding(false);
  };

  return (
    <div className="relative">
      <WardrobeHeader total={items.length} unworn={unwornCount} />
      <CategoryFilter active={activeCat} onChange={setActiveCat} />
      <ColorFilter active={activeColor} onChange={setActiveColor} />

      {/* Seed banner — only when wardrobe has < 5 items */}
      {items.length < 5 && (
        <div className="px-5 pt-3 pb-1">
          <button
            onClick={handleLoadSample}
            disabled={seeding}
            className="w-full h-11 font-body text-xs uppercase tracking-[0.06em] font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-40"
            style={{ background: '#0F0F0F', color: '#fff', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' }}
          >
            {seeding ? t('generating') : 'Load Sample Wardrobe'}
          </button>
        </div>
      )}

      {/* Sort row */}
      <div className="px-5 py-2 flex items-center justify-end">
        <SortButton value={sortKey} onChange={setSortKey} />
      </div>

      {isLoading ? (
        <div className="px-5 grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-white rounded-[22px] soft-shadow animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyWardrobe onAdd={() => setShowAddMenu(true)} />
      ) : filtered.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-muted-foreground">{t('noItems')}</p>
        </div>
      ) : (
        <div className="px-5 grid grid-cols-2 gap-3 pb-6">
          {filtered.map((item) => (
            <WardrobeItemCard
              key={item.id}
              item={item}
              onOpen={() => setSelectedItem(item)}
              onMarkWorn={() => handleMarkWorn(item)}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowAddMenu(true)}
        className="fixed bottom-28 right-5 z-30 w-12 h-12 flex items-center justify-center active:scale-95 transition-transform"
        style={{ background: '#0F0F0F', borderRadius: '2px' }}
        aria-label="Add item"
      >
        <Plus className="w-5 h-5 text-white" strokeWidth={2} />
      </button>

      <AddItemModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => qc.invalidateQueries({ queryKey: ['wardrobe'] })}
      />

      {showAddMenu && (
        <AddMenu
          onClose={() => setShowAddMenu(false)}
          onManual={() => { setShowAddMenu(false); setTimeout(() => setModalOpen(true), 50); }}
          onBatchScan={() => setShowBatchScan(true)}
          onGallery={() => setShowGallery(true)}
        />
      )}

      {showBatchScan && (
        <BatchScanSession
          onDone={handleBatchDone}
          onClose={() => setShowBatchScan(false)}
        />
      )}

      {showGallery && (
        <GalleryImport
          onDone={handleGalleryDone}
          onClose={() => setShowGallery(false)}
        />
      )}

      {/* Item detail screen */}
      <AnimatePresence>
        {selectedItem && (
          <ItemDetailScreen
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onUpdate={handleItemUpdate}
            onDelete={handleItemDelete}
            myOutfits={myOutfits}
            onAddToOutfit={(item) => { setOutfitInitialItem(item); setEditOutfit(null); setSelectedItem(null); setShowOutfitBuilder(true); }}
            onOpenOutfit={(outfit) => { setSelectedItem(null); setViewOutfit(outfit); }}
          />
        )}
      </AnimatePresence>

      {/* Outfit Builder */}
      {showOutfitBuilder && (
        <OutfitBuilder
          initialItem={outfitInitialItem}
          editOutfit={editOutfit}
          allItems={items}
          lang={lang}
          onSave={() => {
            setShowOutfitBuilder(false);
            setEditOutfit(null);
            setOutfitInitialItem(null);
            base44.entities.SavedLook.list().then(all => setMyOutfits(all.filter(o => o.is_manual === true))).catch(() => {});
          }}
          onClose={() => { setShowOutfitBuilder(false); setEditOutfit(null); setOutfitInitialItem(null); }}
        />
      )}

      {/* Outfit detail */}
      {viewOutfit && (
        <OutfitDetailSheet
          outfit={viewOutfit}
          onClose={() => setViewOutfit(null)}
          onEdit={() => { setEditOutfit(viewOutfit); setViewOutfit(null); setShowOutfitBuilder(true); }}
          onDelete={(id) => setMyOutfits(prev => prev.filter(o => o.id !== id))}
          lang={lang}
        />
      )}
    </div>
  );
}