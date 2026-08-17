import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { base44 } from '@/api/base44Client';

const OCCASIONS = ['Uni', 'Dinner', 'Club', 'Date', 'Sport', 'Travel', 'Work'];

function isRealUrl(str) {
  return str && (str.startsWith('http://') || str.startsWith('https://'));
}

export default function LogOutfitModal({ wardrobeItems, savedLooks, onClose, onSaved, day }) {
  const [occasion, setOccasion] = useState('');
  const [mode, setMode] = useState('wardrobe'); // 'wardrobe' | 'look'
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [selectedLookId, setSelectedLookId] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleItem = (id) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Fix: simpler toggle
  const toggleItemId = (id) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const today = day ? format(day, 'yyyy-MM-dd') : new Date().toISOString().slice(0, 10);
    let itemIds = [];
    let itemSnapshots = [];
    let outfitName = '';
    let savedLookId = '';

    if (mode === 'look' && selectedLookId) {
      const look = savedLooks.find((l) => l.id === selectedLookId);
      if (look) {
        itemIds = look.item_ids || [];
        itemSnapshots = look.item_snapshots || [];
        outfitName = look.outfit_name || '';
        savedLookId = look.id;
      }
    } else {
      itemIds = selectedItemIds;
      itemSnapshots = wardrobeItems
        .filter((i) => selectedItemIds.includes(i.id))
        .map((i) => ({ id: i.id, name: i.name, photo_url: i.photo_url || '', emoji: i.emoji || '', category: i.category }));
    }

    // Create log
    await base44.entities.OutfitLog.create({
      date: today,
      occasion,
      item_ids: itemIds,
      item_snapshots: itemSnapshots,
      outfit_name: outfitName,
      saved_look_id: savedLookId,
      notes,
    });

    // Mark items as worn
    await Promise.all(
      itemIds.map((id) => {
        const item = wardrobeItems.find((i) => i.id === id);
        if (!item) return Promise.resolve();
        return base44.entities.WardrobeItem.update(id, {
          times_worn: (item.times_worn || 0) + 1,
          last_worn_date: today,
        });
      })
    );

    setSaving(false);
    onSaved();
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-[32px] soft-shadow-lg"
      style={{ maxHeight: '88vh', overflowY: 'auto', paddingBottom: '2rem' }}
    >
      {/* Handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full bg-border" />
      </div>

      <div className="flex items-center justify-between px-5 pt-2 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            {day && !isToday(day) ? format(day, 'MMM d, yyyy') : "Today's Outfit"}
          </p>
          <p className="text-xl font-extrabold">What are you wearing?</p>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5 space-y-5">
        {/* Occasion */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Occasion</p>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <button
                key={o}
                onClick={() => setOccasion(o)}
                className="h-9 px-4 rounded-full text-sm font-bold transition-all"
                style={occasion === o
                  ? { background: '#FF6B47', color: '#fff' }
                  : { background: 'hsl(var(--secondary))', color: 'hsl(var(--muted-foreground))' }
                }
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        {/* Mode toggle */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Add items from</p>
          <div className="flex gap-2">
            {['wardrobe', 'look'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 h-10 rounded-full text-sm font-bold transition-all"
                style={mode === m
                  ? { background: '#0F0F0F', color: '#fff' }
                  : { background: 'hsl(var(--secondary))', color: 'hsl(var(--muted-foreground))' }
                }
              >
                {m === 'wardrobe' ? '👗 Wardrobe' : '✨ Saved Look'}
              </button>
            ))}
          </div>
        </div>

        {/* Wardrobe picker */}
        {mode === 'wardrobe' && (
          <div className="grid grid-cols-3 gap-2">
            {wardrobeItems.map((item) => {
              const sel = selectedItemIds.includes(item.id);
              const realPhoto = isRealUrl(item.photo_url) ? item.photo_url : null;
              const emoji = item.emoji || '👗';
              return (
                <button
                  key={item.id}
                  onClick={() => toggleItemId(item.id)}
                  className="relative rounded-2xl overflow-hidden aspect-square border-2 transition-all"
                  style={{ borderColor: sel ? '#FF6B47' : 'transparent' }}
                >
                  <div className="w-full h-full bg-secondary flex items-center justify-center text-3xl">
                    {realPhoto ? (
                      <img src={realPhoto} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      emoji
                    )}
                  </div>
                  {sel && (
                    <div
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: '#FF6B47' }}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/30 py-1 px-1">
                    <p className="text-[9px] font-bold text-white truncate text-center">{item.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Look picker */}
        {mode === 'look' && (
          <div className="space-y-2">
            {savedLooks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No saved looks yet. Generate one in the Look Generator!</p>
            ) : (
              savedLooks.map((look) => (
                <button
                  key={look.id}
                  onClick={() => setSelectedLookId(look.id)}
                  className="w-full rounded-2xl p-3 text-left border-2 transition-all flex items-center gap-3"
                  style={{ borderColor: selectedLookId === look.id ? '#FF6B47' : 'hsl(var(--border))' }}
                >
                  <div className="flex gap-1">
                    {(look.item_snapshots || []).slice(0, 3).map((s, i) => (
                      <span key={i} className="text-xl">{s.emoji || '👗'}</span>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{look.outfit_name}</p>
                    <p className="text-xs text-muted-foreground">{look.occasion_prompt || look.date_saved}</p>
                  </div>
                  {selectedLookId === look.id && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: '#FF6B47' }}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Notes (optional)</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add a note about today..."
            rows={2}
            className="w-full resize-none bg-secondary rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/60"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving || (!selectedItemIds.length && !selectedLookId)}
          className="w-full h-14 rounded-full font-extrabold text-base disabled:opacity-50 transition-all"
          style={{ background: '#FF6B47', color: '#fff', boxShadow: '0 8px 24px -6px rgba(255,107,71,0.45)' }}
        >
          {saving ? 'Saving…' : 'Log outfit ✅'}
        </button>
      </div>
    </motion.div>
  );
}