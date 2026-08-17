import React from 'react';
import { useLanguage } from '@/lib/i18n.jsx';

export default function ActivityStatsRow({ stats }) {
  const { streak, outfitsLogged, tripsPlanned, looksGenerated } = stats;
  const { t } = useLanguage();

  const items = [
    { label: t('streak'), value: `${streak}d` },
    { label: t('outfits'), value: outfitsLogged },
    { label: t('trips'), value: tripsPlanned },
    { label: t('looks'), value: looksGenerated },
  ];

  return (
    <div className="px-5 mb-4">
      <p className="text-[11px] uppercase tracking-[0.08em] font-body font-medium mb-3" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
        {t('activity')}
      </p>
      <div className="bg-white grid grid-cols-4" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
        {items.map((it, i) => (
          <div
            key={it.label}
            className="flex flex-col items-center py-4"
            style={{ borderRight: i < items.length - 1 ? '1px solid #E8E6E1' : 'none' }}
          >
            <p className="font-display font-bold" style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: '#0F0F0F' }}>{it.value}</p>
            <p className="text-[10px] font-body mt-0.5" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>{it.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}