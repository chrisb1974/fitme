import React from 'react';
import { base44 } from '@/api/base44Client';

const OUTFIT_T = {
  en: {
    items: (n) => `${n} items`,
    worn: (n) => `worn ${n}x`,
    saved: (d) => `saved ${d}`,
    woreToday: '👕 Wore this today',
    edit: '✏️ Edit',
  },
  es: {
    items: (n) => `${n} prenda${n !== 1 ? 's' : ''}`,
    worn: (n) => `usado ${n}x`,
    saved: (d) => `guardado ${d}`,
    woreToday: '👕 Lo llevé hoy',
    edit: '✏️ Editar',
  },
  fr: {
    items: (n) => `${n} article${n !== 1 ? 's' : ''}`,
    worn: (n) => `porté ${n}x`,
    saved: (d) => `sauvegardé ${d}`,
    woreToday: "👕 Porté aujourd'hui",
    edit: '✏️ Modifier',
  },
};

export default function OutfitDetailSheet({ outfit, onClose, onEdit, onDelete, lang = 'en' }) {
  const tO = OUTFIT_T[lang] || OUTFIT_T.en;

  const handleWoreToday = async () => {
    await base44.entities.SavedLook.update(outfit.id, {
      times_worn: (outfit.times_worn || 0) + 1,
      last_worn_date: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this outfit?')) {
      await base44.entities.SavedLook.delete(outfit.id);
      onDelete(outfit.id);
      onClose();
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: 430, margin: '0 auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ width: 36, height: 4, background: '#e0e0e0', borderRadius: 2, margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.02em', fontFamily: 'Playfair Display, serif' }}>{outfit.outfit_name}</h3>
            <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
              {tO.items(outfit.item_ids?.length || 0)}
              {outfit.times_worn > 0 && ` · ${tO.worn(outfit.times_worn)}`}
              {outfit.date_saved && ` · ${tO.saved(outfit.date_saved)}`}
            </p>
          </div>
          <button
            onClick={onEdit}
            style={{ background: '#f5f5f5', border: 'none', borderRadius: 12, padding: '8px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
            {tO.edit}
          </button>
        </div>

        {/* Items grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 24 }}>
          {outfit.item_snapshots?.map((snap, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ width: '100%', aspectRatio: '1', borderRadius: 14, overflow: 'hidden', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                {snap.photo_url
                  ? <img src={snap.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={snap.name} />
                  : <span style={{ fontSize: 28 }}>{snap.emoji || '👕'}</span>
                }
              </div>
              <p style={{ fontSize: 9, color: '#888', margin: 0, lineHeight: 1.2 }}>{snap.name?.split(' ').slice(0, 2).join(' ')}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleWoreToday}
            style={{ flex: 2, background: '#000', color: '#fff', border: 'none', borderRadius: 16, padding: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
            {tO.woreToday}
          </button>
          <button
            onClick={handleDelete}
            style={{ flex: 1, background: '#f5f5f5', color: '#ff3b30', border: 'none', borderRadius: 16, padding: 14, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}