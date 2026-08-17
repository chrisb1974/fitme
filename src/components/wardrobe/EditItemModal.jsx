import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SeasonMultiChips } from '@/components/shared/SeasonChips.jsx';

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Shoes', 'Bags', 'Accessories', 'Jewellery'];

function normalizeSeason(s) {
  if (!s) return [];
  if (Array.isArray(s)) return s;
  if (s === 'All Season') return ['Spring', 'Summer', 'Autumn', 'Winter'];
  if (s === 'Spring/Summer') return ['Spring', 'Summer'];
  if (s === 'Autumn/Winter') return ['Autumn', 'Winter'];
  return [s];
}

export default function EditItemModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: item.name || '',
    category: item.category || '',
    color: item.color || '',
    brand: item.brand || '',
    tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
    season: normalizeSeason(item.season),
    notes: item.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.category) return;
    setSaving(true);
    await base44.entities.WardrobeItem.update(item.id, {
      name: form.name,
      category: form.category,
      color: form.color,
      brand: form.brand,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      season: form.season,
      notes: form.notes,
    });
    setSaving(false);
    onSaved?.({ ...item, ...form, tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [] });
  };

  const labelStyle = {
    fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
    fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: '#A8A8A8',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="w-full max-w-md bg-background rounded-t-[16px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1" style={{ background: '#E8E6E1', borderRadius: '999px' }} />
        </div>
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #E8E6E1' }}>
          <h2 className="text-lg font-display font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>Edit item</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center"
            style={{ background: '#F5F4F1', borderRadius: '2px', border: '1px solid #E8E6E1' }}>
            <X className="w-4 h-4" style={{ color: '#6B6B6B' }} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div>
            <p style={labelStyle} className="mb-1.5">Name</p>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 outline-none font-body"
              style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: '#0F0F0F', height: '44px' }}
            />
          </div>

          <div>
            <p style={labelStyle} className="mb-1.5">Category</p>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="font-body" style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px', height: '44px', paddingLeft: '12px' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p style={labelStyle} className="mb-1.5">Season</p>
            <SeasonMultiChips selected={form.season} onChange={(v) => setForm({ ...form, season: v })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p style={labelStyle} className="mb-1.5">Colour</p>
              <input
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                placeholder="Beige"
                className="w-full px-3 outline-none font-body"
                style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: '#0F0F0F', height: '44px' }}
              />
            </div>
            <div>
              <p style={labelStyle} className="mb-1.5">Brand</p>
              <input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="Zara"
                className="w-full px-3 outline-none font-body"
                style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: '#0F0F0F', height: '44px' }}
              />
            </div>
          </div>

          <div>
            <p style={labelStyle} className="mb-1.5">Tags (comma-separated)</p>
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full px-3 outline-none font-body"
              style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: '#0F0F0F', height: '44px' }}
            />
          </div>

          <div>
            <p style={labelStyle} className="mb-1.5">Notes</p>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2.5 outline-none font-body resize-none"
              style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: '#0F0F0F', lineHeight: '1.5' }}
            />
          </div>

          <button
            disabled={!form.name || !form.category || saving}
            onClick={handleSave}
            className="w-full h-12 font-body font-semibold text-xs uppercase tracking-[0.06em] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ background: '#0F0F0F', color: '#fff', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}