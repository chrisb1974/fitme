import React from 'react';
import { useLanguage } from '@/lib/i18n.jsx';

export default function WardrobeHeader({ total, unworn }) {
  const { t } = useLanguage();
  return (
    <div className="px-5 pt-10 pb-5">
      <p className="text-[11px] uppercase tracking-[0.1em] font-body font-medium mb-1" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
        FitMe
      </p>
      <h1 className="text-[28px] leading-tight font-display font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>
        {t('myWardrobe')}
      </h1>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="bg-white p-4" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
          <p className="text-[10px] uppercase tracking-[0.08em] font-body font-medium mb-1" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
            {t('items')}
          </p>
          <p className="text-2xl font-display font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>{total}</p>
        </div>
        <div className="p-4" style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '4px' }}>
          <p className="text-[10px] uppercase tracking-[0.08em] font-body font-medium mb-1" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
            {t('unworn')}
          </p>
          <p className="text-2xl font-display font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#C9A96E' }}>{unworn}</p>
        </div>
      </div>
    </div>
  );
}