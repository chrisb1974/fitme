import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes', 'Bags', 'Accessories', 'Jewellery'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', '36', '37', '38', '39', '40'];
const CONDITIONS = ['New with tags', 'Like new', 'Good', 'Fair'];
const LISTING_TYPES = ['All', 'For Sale', 'Swap only'];

const chipStyle = (active) => ({
  fontFamily: 'DM Sans, sans-serif',
  fontWeight: 500,
  fontSize: '12px',
  borderRadius: '2px',
  padding: '6px 12px',
  background: active ? '#0F0F0F' : '#F5F4F1',
  color: active ? '#fff' : '#6B6B6B',
  border: active ? '1px solid #0F0F0F' : '1px solid #E8E6E1',
  cursor: 'pointer',
  transition: 'all 0.15s',
});

function PillChip({ label, active, onToggle }) {
  return <button onClick={onToggle} style={chipStyle(active)}>{label}</button>;
}

export default function MarketFilterPanel({ filters, onChange, onClose }) {
  const [local, setLocal] = useState({ ...filters });

  const toggleArr = (key, val) => {
    setLocal((p) => {
      const arr = p[key] || [];
      return { ...p, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
    });
  };

  const setSingle = (key, val) => setLocal((p) => ({ ...p, [key]: val }));
  const handleApply = () => { onChange(local); onClose(); };
  const handleReset = () => setLocal({ categories: [], sizes: [], conditions: [], listingType: 'All', maxPrice: 100, brand: '' });

  const labelStyle = { fontFamily: 'DM Sans, sans-serif', fontSize: '11px', fontWeight: 500, color: '#A8A8A8', textTransform: 'uppercase', letterSpacing: '0.08em' };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed bottom-0 inset-x-0 z-50 bg-white max-h-[85vh] overflow-y-auto"
        style={{ maxWidth: 448, margin: '0 auto', borderTop: '1px solid #E8E6E1', borderRadius: '4px 4px 0 0' }}
      >
        <div className="p-5">
          <div className="w-8 h-0.5 mx-auto mb-4" style={{ background: '#E8E6E1' }} />
          <div className="flex items-center justify-between mb-5">
            <p className="font-display font-semibold text-lg" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>Filters</p>
            <button onClick={onClose}><X className="w-4 h-4" style={{ color: '#6B6B6B' }} /></button>
          </div>

          <div className="mb-5">
            <p style={labelStyle} className="mb-2 block">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <PillChip key={c} label={c} active={c === 'All' ? !local.categories?.length : local.categories?.includes(c)} onToggle={() => c === 'All' ? setSingle('categories', []) : toggleArr('categories', c)} />
              ))}
            </div>
          </div>

          <div className="mb-5">
            <p style={labelStyle} className="mb-2 block">Max Price: <span style={{ color: '#C9A96E' }}>€{local.maxPrice}</span></p>
            <input type="range" min={0} max={100} value={local.maxPrice || 100} onChange={(e) => setSingle('maxPrice', Number(e.target.value))} className="w-full accent-foreground" />
            <div className="flex justify-between mt-1">
              <span className="text-xs font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>€0</span>
              <span className="text-xs font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>€100</span>
            </div>
          </div>

          <div className="mb-5">
            <p style={labelStyle} className="mb-2 block">Size</p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => <PillChip key={s} label={s} active={local.sizes?.includes(s)} onToggle={() => toggleArr('sizes', s)} />)}
            </div>
          </div>

          <div className="mb-5">
            <p style={labelStyle} className="mb-2 block">Brand</p>
            <input
              value={local.brand || ''}
              onChange={(e) => setSingle('brand', e.target.value)}
              placeholder="e.g. Zara, Nike..."
              className="w-full h-11 px-4 text-sm font-body outline-none"
              style={{ fontFamily: 'DM Sans, sans-serif', background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px' }}
            />
          </div>

          <div className="mb-5">
            <p style={labelStyle} className="mb-2 block">Condition</p>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map((c) => <PillChip key={c} label={c} active={local.conditions?.includes(c)} onToggle={() => toggleArr('conditions', c)} />)}
            </div>
          </div>

          <div className="mb-6">
            <p style={labelStyle} className="mb-2 block">Listing type</p>
            <div className="flex gap-2">
              {LISTING_TYPES.map((t) => <PillChip key={t} label={t} active={local.listingType === t} onToggle={() => setSingle('listingType', t)} />)}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 h-12 text-xs font-body uppercase tracking-[0.06em] font-semibold"
              style={{ fontFamily: 'DM Sans, sans-serif', background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px', color: '#6B6B6B' }}
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="flex-[2] h-12 text-xs font-body uppercase tracking-[0.06em] font-semibold text-white"
              style={{ fontFamily: 'DM Sans, sans-serif', background: '#0F0F0F', borderRadius: '2px' }}
            >
              Apply filters
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}