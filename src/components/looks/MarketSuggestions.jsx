import React from 'react';
import { ShoppingBag } from 'lucide-react';

const PLACEHOLDERS = [
  { name: 'Silk slip skirt', emoji: '👗', price: '€24', tag: 'trending' },
  { name: 'Gold hoop earrings', emoji: '💍', price: '€12', tag: 'bestseller' },
];

export default function MarketSuggestions() {
  return (
    <div className="mx-5 mt-4 mb-2">
      <div className="flex items-center gap-2 mb-3">
        <ShoppingBag className="w-4 h-4 text-primary" />
        <p className="font-extrabold text-sm">Complete the look 🛍</p>
      </div>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
        {PLACEHOLDERS.map((item) => (
          <div key={item.name} className="bg-white rounded-[20px] soft-shadow p-3 min-w-[140px] flex-shrink-0">
            <div className="w-full aspect-square rounded-2xl bg-secondary flex items-center justify-center text-4xl mb-2">
              {item.emoji}
            </div>
            <p className="font-bold text-xs truncate">{item.name}</p>
            <p className="text-[11px] text-primary font-bold mt-0.5">{item.price}</p>
            <button className="mt-2 w-full text-[10px] font-extrabold bg-primary text-primary-foreground py-1.5 rounded-full">
              Find on FitMe Market
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}