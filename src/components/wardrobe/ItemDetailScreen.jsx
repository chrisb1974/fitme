import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { getWearStatus, CATEGORY_EMOJI } from './wearStatus';
import EditItemModal from './EditItemModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';

function ColorDot({ color }) {
  const colorMap = {
    white: '#F5F5F5', black: '#1a1a1a', blue: '#3B82F6', red: '#EF4444',
    pink: '#EC4899', green: '#22C55E', brown: '#92400E', beige: '#D4B896',
    grey: '#9CA3AF', gray: '#9CA3AF', orange: '#F97316', purple: '#A855F7',
    yellow: '#EAB308', gold: '#D97706',
  };
  const hex = colorMap[color?.toLowerCase()] || '#9CA3AF';
  return (
    <span
      className="inline-block w-4 h-4 rounded-full border-2 border-white shadow-sm"
      style={{ background: hex }}
    />
  );
}

export default function ItemDetailScreen({ item, onClose, onUpdate, onDelete, myOutfits = [], onAddToOutfit, onOpenOutfit }) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [marking, setMarking] = useState(false);
  const [localItem, setLocalItem] = useState(item);

  const status = getWearStatus(localItem.last_worn_date);
  const emoji = localItem.emoji || CATEGORY_EMOJI[localItem.category] || '✨';
  const dotColor = status.color === 'green' ? '#4A7C59' : status.color === 'orange' ? '#C9A96E' : '#8B3A3A';

  const handleMarkWorn = async () => {
    setMarking(true);
    const today = new Date().toISOString().slice(0, 10);
    const newItem = { ...localItem, times_worn: (localItem.times_worn || 0) + 1, last_worn_date: today };
    await base44.entities.WardrobeItem.update(localItem.id, {
      times_worn: newItem.times_worn,
      last_worn_date: today,
    });
    setLocalItem(newItem);
    onUpdate?.(newItem);
    setMarking(false);
  };

  const handleSaveEdit = (updated) => {
    setLocalItem(updated);
    onUpdate?.(updated);
    setShowEdit(false);
  };

  const handleDeleteConfirm = async () => {
    await base44.entities.WardrobeItem.delete(localItem.id);
    onDelete?.(localItem.id);
    onClose();
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '180px' }}>
        {/* Photo */}
        <div className="relative w-full aspect-[4/5] bg-secondary">
          {localItem.photo_url ? (
            <img src={localItem.photo_url} alt={localItem.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-9xl" style={{ background: '#F5F4F1' }}>
              {emoji}
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Back button */}
          <button
            onClick={onClose}
            className="absolute top-12 left-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          {/* Edit button */}
          <button
            onClick={() => setShowEdit(true)}
            className="absolute top-12 right-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
          >
            <Edit2 className="w-4 h-4 text-white" />
          </button>

          {/* Category badge — black, straight corners */}
          <div
            className="absolute bottom-4 left-4 text-[10px] font-body font-semibold uppercase tracking-[0.1em] px-2.5 py-1"
            style={{ background: '#0F0F0F', color: '#fff', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' }}
          >
            {localItem.category}
          </div>

          {/* Wear status on photo */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full" style={{ background: dotColor }} />
            <span className="text-[10px] font-semibold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{status.label}</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pt-5 space-y-4">
          {/* Name + color */}
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-display font-bold leading-tight flex-1" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>
              {localItem.name}
            </h1>
            {localItem.color && (
              <div className="flex items-center gap-1.5 mt-1 shrink-0">
                <ColorDot color={localItem.color} />
                <span className="text-xs font-body capitalize" style={{ color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}>{localItem.color}</span>
              </div>
            )}
          </div>

          {/* Brand */}
          {localItem.brand && (
            <p className="text-sm font-body -mt-2" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>by {localItem.brand}</p>
          )}

          {/* Season */}
          {localItem.season && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.08em] font-body font-medium" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>Season</span>
              <span
                className="text-[10px] font-body font-semibold uppercase tracking-[0.06em] px-2.5 py-1"
                style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px', color: '#0F0F0F', fontFamily: 'DM Sans, sans-serif' }}
              >
                {localItem.season}
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 text-center" style={{ background: '#0F0F0F', borderRadius: '4px' }}>
              <p className="text-2xl font-bold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{localItem.times_worn || 0}</p>
              <p className="text-[10px] uppercase tracking-wider mt-1 font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>Times worn</p>
            </div>
            <div className="p-4 text-center" style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '4px' }}>
              <p className="text-sm font-bold" style={{ fontFamily: 'DM Sans, sans-serif', color: '#0F0F0F' }}>
                {localItem.last_worn_date ? format(new Date(localItem.last_worn_date), 'MMM d') : '—'}
              </p>
              <p className="text-[10px] uppercase tracking-wider mt-1 font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>Last worn</p>
            </div>
            <div className="p-4 text-center" style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '4px' }}>
              <p className="text-sm font-bold" style={{ fontFamily: 'DM Sans, sans-serif', color: '#0F0F0F' }}>
                {localItem.date_added ? format(new Date(localItem.date_added), 'MMM d') : '—'}
              </p>
              <p className="text-[10px] uppercase tracking-wider mt-1 font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>Added</p>
            </div>
          </div>

          {/* Style tags */}
          {localItem.style_tags?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.08em] font-body font-medium mb-2" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>Style</p>
              <div className="flex flex-wrap gap-2">
                {localItem.style_tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-body font-semibold uppercase tracking-[0.06em] px-2.5 py-1"
                    style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px', color: '#0F0F0F', fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {localItem.tags?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.08em] font-body font-medium mb-2" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>Tags</p>
              <div className="flex flex-wrap gap-2">
                {localItem.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-body font-semibold uppercase tracking-[0.06em] px-2.5 py-1"
                    style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px', color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {localItem.notes && (
            <div className="p-4" style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '4px' }}>
              <p className="text-[10px] uppercase tracking-[0.08em] font-body font-medium mb-1.5" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>Notes</p>
              <p className="text-sm font-body leading-relaxed" style={{ color: '#0F0F0F', fontFamily: 'DM Sans, sans-serif' }}>{localItem.notes}</p>
            </div>
          )}

          {/* Outfits section */}
          <div style={{ borderTop: '1px solid #f5f5f5', paddingTop: 16 }}>
            <p className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] mb-2.5" style={{ color: '#ccc', fontFamily: 'DM Sans, sans-serif' }}>Outfits</p>
            {myOutfits.filter(o => o.item_ids?.includes(localItem.id)).map(o => (
              <div key={o.id}
                onClick={() => onOpenOutfit?.(o)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #f5f5f5', cursor: 'pointer' }}>
                <span style={{ fontSize: 20 }}>👗</span>
                <div style={{ flex: 1 }}>
                  <p className="text-sm font-body font-bold m-0" style={{ color: '#000', fontFamily: 'DM Sans, sans-serif' }}>{o.outfit_name}</p>
                  <p className="text-xs font-body m-0" style={{ color: '#888', fontFamily: 'DM Sans, sans-serif' }}>{o.item_ids.length} items · tap to edit</p>
                </div>
                <span style={{ color: '#ccc' }}>›</span>
              </div>
            ))}
            <button
              onClick={() => onAddToOutfit?.(localItem)}
              style={{ width: '100%', background: '#f5f5f5', color: '#000', border: 'none', borderRadius: 16, padding: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'DM Sans, sans-serif' }}>
              <span>＋</span> Add to a new outfit
            </button>
          </div>

          {/* Action buttons — inline in scroll area */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleMarkWorn}
              disabled={marking}
              className="w-full h-12 font-body font-semibold text-xs uppercase tracking-[0.06em] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ background: '#0F0F0F', color: '#fff', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' }}
            >
              <CheckCircle2 className="w-4 h-4" />
              {marking ? 'Marking…' : 'Mark as Worn Today'}
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEdit(true)}
                className="flex-1 h-11 font-body font-semibold text-xs uppercase tracking-[0.06em] transition-all active:scale-[0.98]"
                style={{ background: '#F5F4F1', color: '#0F0F0F', border: '1px solid #E8E6E1', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' }}
              >
                Edit Item
              </button>
              <button
                onClick={() => setShowDelete(true)}
                className="flex-1 h-11 font-body font-semibold text-xs uppercase tracking-[0.06em] transition-all active:scale-[0.98]"
                style={{ background: '#F5F4F1', color: '#8B3A3A', border: '1px solid #E8E6E1', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' }}
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {showEdit && (
          <EditItemModal
            item={localItem}
            onClose={() => setShowEdit(false)}
            onSaved={handleSaveEdit}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {showDelete && (
          <DeleteConfirmDialog
            onCancel={() => setShowDelete(false)}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}