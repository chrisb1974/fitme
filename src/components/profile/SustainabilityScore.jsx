import React, { useMemo } from 'react';
import { useLanguage } from '@/lib/i18n.jsx';

export default function SustainabilityScore({ wardrobeItems, outfitLogs }) {
  const { t } = useLanguage();

  const { score, rewornCount, resaleCount, repeatRate } = useMemo(() => {
    const rewornCount = wardrobeItems.filter((i) => (i.times_worn || 0) > 1).length;
    const resaleCount = wardrobeItems.filter((i) => i.is_for_sale).length;
    const total = wardrobeItems.length || 1;

    const rewornPct = (rewornCount / total) * 100;
    const resalePct = Math.min((resaleCount / total) * 100, 30);
    const logsPct = Math.min(outfitLogs.length * 2, 20);

    const score = Math.min(Math.round(rewornPct * 0.5 + resalePct + logsPct + 10), 100);
    const uniqueItems = new Set(outfitLogs.flatMap((l) => l.item_ids || [])).size;
    const repeatRate = total > 0 ? Math.round((uniqueItems / total) * 100) : 0;

    return { score, rewornCount, resaleCount, repeatRate };
  }, [wardrobeItems, outfitLogs]);

  const labelKey = score >= 80 ? 'ecoChampion' : score >= 60 ? 'consciousFashionista' : score >= 40 ? 'gettingGreener' : 'roomToImprove';

  const bars = [
    { labelKey: 'itemsReworn', value: rewornCount, total: wardrobeItems.length || 1 },
    { labelKey: 'listedForResale', value: resaleCount, total: Math.max(wardrobeItems.length || 1, 1) },
    { labelKey: 'outfitRepeatRate', value: repeatRate, total: 100, pct: true },
  ];

  return (
    <div className="px-5 mb-4">
      <div className="p-5" style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '4px' }}>
        <p className="text-[11px] uppercase tracking-[0.08em] font-body font-medium mb-1" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
          {t('ecoScore')}
        </p>
        <div className="flex items-baseline gap-2 mb-1">
          <p className="font-display font-bold" style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', color: '#4A7C59', lineHeight: 1 }}>{score}</p>
          <p className="text-lg font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>/100</p>
          <p className="text-sm font-body font-medium" style={{ color: '#4A7C59', fontFamily: 'DM Sans, sans-serif' }}>{t(labelKey)}</p>
        </div>

        <div className="space-y-3 mt-4 mb-3">
          {bars.map((b) => (
            <div key={b.labelKey}>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs font-body" style={{ color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}>{t(b.labelKey)}</span>
                <span className="text-xs font-body font-semibold" style={{ color: '#4A7C59', fontFamily: 'DM Sans, sans-serif' }}>
                  {b.pct ? `${b.value}%` : `${b.value}/${b.total}`}
                </span>
              </div>
              <div className="w-full h-px" style={{ background: '#E8E6E1' }}>
                <div className="h-full transition-all" style={{ width: `${Math.min((b.value / b.total) * 100, 100)}%`, background: '#4A7C59' }} />
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
          {t('ecoFootnote')}
        </p>
      </div>
    </div>
  );
}