import React, { useMemo } from 'react';
import { useLanguage } from '@/lib/i18n.jsx';

const STYLE_BARS = [
  { key: 'chic', label: 'Chic', dnaKey: 'styleDnaEffortlessChic' },
  { key: 'casual', label: 'Casual', dnaKey: 'styleDnaLaidbackCool' },
  { key: 'boho', label: 'Boho', dnaKey: 'styleDnaFreeSpirit' },
  { key: 'streetwear', label: 'Streetwear', dnaKey: 'styleDnaStreetSavvy' },
  { key: 'minimalist', label: 'Minimalist', dnaKey: 'styleDnaCleanMinimalist' },
  { key: 'elegant', label: 'Elegant', dnaKey: 'styleDnaClassicElegance' },
];

export default function StyleDNACard({ wardrobeItems }) {
  const { t } = useLanguage();

  const { scores, dominantKey } = useMemo(() => {
    const counts = {};
    wardrobeItems.forEach((item) => {
      (item.style_tags || []).forEach((tag) => {
        const lower = tag.toLowerCase();
        STYLE_BARS.forEach((b) => {
          if (lower.includes(b.key)) counts[b.key] = (counts[b.key] || 0) + 1;
        });
      });
    });

    const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
    const scores = STYLE_BARS
      .filter((b) => counts[b.key])
      .map((b) => ({ ...b, pct: Math.round((counts[b.key] / total) * 100) }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 4);

    if (!scores.length) {
      return {
        scores: [
          { ...STYLE_BARS[0], pct: 35 },
          { ...STYLE_BARS[1], pct: 30 },
          { ...STYLE_BARS[2], pct: 20 },
          { ...STYLE_BARS[3], pct: 15 },
        ],
        dominantKey: 'styleDnaEffortlessChic',
      };
    }

    const dominantKeyMap = {
      chic: 'styleDnaEffortlessChic',
      casual: 'styleDnaLaidbackCool',
      boho: 'styleDnaFreeSpirit',
      streetwear: 'styleDnaStreetSavvy',
      minimalist: 'styleDnaCleanMinimalist',
      elegant: 'styleDnaClassicElegance',
    };

    return { scores, dominantKey: dominantKeyMap[scores[0]?.key] || 'styleDnaUniqueMix' };
  }, [wardrobeItems]);

  return (
    <div className="mx-5 mb-4 p-5" style={{ background: '#0F0F0F', borderRadius: '4px' }}>
      <p className="text-[11px] uppercase tracking-[0.1em] font-body font-medium mb-1.5" style={{ color: '#C9A96E', fontFamily: 'DM Sans, sans-serif' }}>
        {t('yourStyleDna')}
      </p>
      <p className="text-[26px] font-display font-bold text-white mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
        {t(dominantKey)}
      </p>

      <div className="space-y-3">
        {scores.map((s) => (
          <div key={s.key}>
            <div className="flex justify-between mb-1.5">
              <span className="text-xs font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{s.label}</span>
              <span className="text-xs font-body" style={{ color: '#C9A96E', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>{s.pct}%</span>
            </div>
            <div className="w-full h-px bg-white/10 overflow-hidden">
              <div className="h-full transition-all" style={{ width: `${s.pct}%`, background: '#C9A96E' }} />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] font-body mt-4" style={{ color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}>
        {t('basedOnItems')} {wardrobeItems.length} {t('basedOnItemsSuffix')}
      </p>
    </div>
  );
}