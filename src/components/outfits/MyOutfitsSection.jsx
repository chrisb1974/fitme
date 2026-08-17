import React from 'react';

const OUTFIT_T = {
  en: {
    myOutfits: 'My Outfits',
    create: '+ Create',
    noOutfits: 'No outfits yet',
    noOutfitsSub: 'Create your first named outfit',
    createOutfit: '+ Create outfit',
    items: (n) => `${n} items`,
  },
  es: {
    myOutfits: 'Mis Outfits',
    create: '+ Crear',
    noOutfits: 'Aún no hay outfits',
    noOutfitsSub: 'Crea tu primer outfit con nombre',
    createOutfit: '+ Crear outfit',
    items: (n) => `${n} prenda${n !== 1 ? 's' : ''}`,
  },
  fr: {
    myOutfits: 'Mes Tenues',
    create: '+ Créer',
    noOutfits: "Aucune tenue pour l'instant",
    noOutfitsSub: 'Crée ta première tenue personnalisée',
    createOutfit: '+ Créer une tenue',
    items: (n) => `${n} article${n !== 1 ? 's' : ''}`,
  },
};

export default function MyOutfitsSection({ myOutfits, onCreateOutfit, onViewOutfit, lang = 'en' }) {
  const tO = OUTFIT_T[lang] || OUTFIT_T.en;

  return (
    <div style={{ padding: '0 16px', marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0, letterSpacing: '-0.02em', fontFamily: 'Playfair Display, serif' }}>{tO.myOutfits}</h3>
        <button
          onClick={onCreateOutfit}
          style={{ background: '#000', color: '#fff', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
          {tO.create}
        </button>
      </div>

      {myOutfits.length === 0 ? (
        <div style={{ background: '#f5f5f5', borderRadius: 20, padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>👗</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#000', margin: '0 0 4px' }}>{tO.noOutfits}</p>
          <p style={{ fontSize: 12, color: '#888', margin: '0 0 16px' }}>{tO.noOutfitsSub}</p>
          <button
            onClick={onCreateOutfit}
            style={{ background: '#000', color: '#fff', border: 'none', borderRadius: 16, padding: '10px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
            {tO.createOutfit}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {myOutfits.map(outfit => (
            <div key={outfit.id} onClick={() => onViewOutfit(outfit)}
              style={{ flexShrink: 0, width: 140, cursor: 'pointer' }}>
              <div style={{ width: 140, height: 140, borderRadius: 20, overflow: 'hidden', background: '#f5f5f5', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 8 }}>
                {(outfit.item_snapshots?.length > 0 ? outfit.item_snapshots : []).slice(0, 4).map((snap, i) => (
                  <div key={i} style={{ overflow: 'hidden', background: '#eee' }}>
                    {snap.photo_url
                      ? <img src={snap.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={snap.name} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{snap.emoji || '👕'}</div>
                    }
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 4 - (outfit.item_snapshots?.length || 0)) }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ background: '#eee' }} />
                ))}
              </div>
              <p style={{ fontSize: 13, fontWeight: 800, margin: '0 0 2px', color: '#000', fontFamily: 'DM Sans, sans-serif' }}>{outfit.outfit_name}</p>
              <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{tO.items(outfit.item_ids?.length || 0)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}