// Returns { color: 'green'|'orange'|'red', label } based on last_worn_date
export function getWearStatus(lastWornDate) {
  if (!lastWornDate) {
    return { color: 'red', label: 'Not worn this month', dot: 'bg-red-500' };
  }
  const now = new Date();
  const last = new Date(lastWornDate);
  const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) {
    return { color: 'green', label: 'Worn this week', dot: 'bg-accent' };
  }
  if (diffDays <= 30) {
    return { color: 'orange', label: 'Worn this month', dot: 'bg-amber-500' };
  }
  return { color: 'red', label: 'Not worn this month', dot: 'bg-red-500' };
}

export const CATEGORY_EMOJI = {
  Tops: '👚',
  Bottoms: '👖',
  Dresses: '👗',
  Shoes: '👟',
  Bags: '👜',
  Accessories: '🧣',
  Jewellery: '💍',
};

// Color-coded category badge styles
export const CATEGORY_BADGE = {
  Tops:        { bg: 'rgba(255,107,71,0.85)',  text: '#fff' },
  Bottoms:     { bg: 'rgba(59,130,246,0.85)',  text: '#fff' },
  Dresses:     { bg: 'rgba(139,92,246,0.85)',  text: '#fff' },
  Shoes:       { bg: 'rgba(245,158,11,0.85)',  text: '#fff' },
  Bags:        { bg: 'rgba(20,184,166,0.85)',  text: '#fff' },
  Accessories: { bg: 'rgba(236,72,153,0.85)',  text: '#fff' },
  Jewellery:   { bg: 'rgba(202,138,4,0.85)',   text: '#fff' },
};

export const COLOR_OPTIONS = [
  { label: 'White',  hex: '#F5F5F5' },
  { label: 'Black',  hex: '#1a1a1a' },
  { label: 'Blue',   hex: '#3B82F6' },
  { label: 'Red',    hex: '#EF4444' },
  { label: 'Pink',   hex: '#EC4899' },
  { label: 'Green',  hex: '#22C55E' },
  { label: 'Brown',  hex: '#92400E' },
  { label: 'Beige',  hex: '#D4B896' },
  { label: 'Grey',   hex: '#9CA3AF' },
  { label: 'Multi',  hex: 'linear-gradient(135deg,#FF6B47,#2ECC82,#3B82F6)' },
];