import React from 'react';
import { useLanguage } from '@/lib/i18n.jsx';

export default function AddMenu({ onClose, onManual, onBatchScan, onGallery }) {
  const { t } = useLanguage();

  const options = [
    { emoji: '📸', label: t('addMenuBatchScan'), sublabel: t('addMenuBatchScanSub'), onClick: onBatchScan },
    { emoji: '🖼️', label: t('addMenuGallery'), sublabel: t('addMenuGallerySub'), onClick: onGallery },
    { emoji: '✏️', label: t('addMenuManual'), sublabel: t('addMenuManualSub'), onClick: onManual },
  ];

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }}
      onClick={onClose}
    >
      <div
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '24px 24px 0 0', padding: '24px 20px 48px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: 36, height: 4, background: '#e0e0e0', borderRadius: 2, margin: '0 auto 24px' }} />
        <h3 style={{ fontWeight: 900, fontSize: 18, margin: '0 0 20px', fontFamily: 'Playfair Display, serif' }}>{t('addMenuTitle')}</h3>
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => { opt.onClick(); onClose(); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 16,
              padding: '14px 0',
              background: 'none', border: 'none', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 16, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              {opt.emoji}
            </div>
            <div>
              <p style={{ color: '#000', fontSize: 15, fontWeight: 800, margin: 0, fontFamily: 'DM Sans, sans-serif' }}>{opt.label}</p>
              <p style={{ color: '#888', fontSize: 12, margin: '2px 0 0', fontFamily: 'DM Sans, sans-serif' }}>{opt.sublabel}</p>
            </div>
            <span style={{ marginLeft: 'auto', color: '#ccc', fontSize: 18 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}