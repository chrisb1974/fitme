// Pricing logic based on brand tier and wear count
const LUXURY_BRANDS = ['coach', 'massimo dutti', '& other stories', 'cos'];
const MID_BRANDS = ['zara', 'mango', "levi's", 'levis', 'nike', 'adidas'];
// Everything else = fast fashion tier

export function getSuggestedPrice(item) {
  const brand = (item.brand || '').toLowerCase();
  const worn = item.times_worn || 0;

  let base;
  if (LUXURY_BRANDS.some((b) => brand.includes(b))) {
    base = worn === 0 ? 45 : worn <= 3 ? 35 : 25;
  } else if (MID_BRANDS.some((b) => brand.includes(b))) {
    base = worn === 0 ? 25 : worn <= 3 ? 18 : 10;
  } else {
    base = worn === 0 ? 15 : worn <= 3 ? 10 : 5;
  }
  return base;
}

export function getDaysAgo(dateStr) {
  if (!dateStr) return null;
  const diff = Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
  return diff;
}

export function isSuggested(item) {
  if ((item.times_worn || 0) === 0) return true;
  const days = getDaysAgo(item.last_worn_date);
  return days === null || days > 30;
}