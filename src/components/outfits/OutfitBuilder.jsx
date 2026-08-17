import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Bags', 'Accessories', 'Jewellery'];

const OUTFIT_T = {
  en: {
    namePlaceholder: 'Name your outfit… (ex: Crossfit, Uni day)',
    selectHint: 'Select items below to build your outfit',
    saveBtn: (n) => `Save outfit — ${n} item${n !== 1 ? 's' : ''}`,
    updateBtn: (n) => `Update outfit — ${n} items`,
    saving: 'Saving…',
    swap: 'SWAP',
    swapHint: (name) => `Tap an item below to swap "${name}"`,
    cancel: 'Cancel',
  },
  es: {
    namePlaceholder: 'Nombra tu outfit… (ej: Crossfit, Día de uni)',
    selectHint: 'Selecciona prendas para crear tu outfit',
    saveBtn: (n) => `Guardar outfit — ${n} prenda${n !== 1 ? 's' : ''}`,
    updateBtn: (n) => `Actualizar outfit — ${n} prendas`,
    saving: 'Guardando…',
    swap: 'CAMBIAR',
    swapHint: (name) => `Toca una prenda para cambiar "${name}"`,
    cancel: 'Cancelar',
  },
  fr: {
    namePlaceholder: 'Nomme ta tenue… (ex: Crossfit, Journée fac)',
    selectHint: 'Sélectionne des articles pour créer ta tenue',
    saveBtn: (n) => `Sauvegarder — ${n} article${n !== 1 ? 's' : ''}`,
    updateBtn: (n) => `Mettre à jour — ${n} articles`,
    saving: 'Sauvegarde…',
    swap: 'CHANGER',
    swapHint: (name) => `Touche un article pour remplacer "${name}"`,
    cancel: 'Annuler',
  },
};

export default function OutfitBuilder({ initialItem = null, editOutfit = null, onSave, onClose, allItems, lang = 'en' }) {
  const tO = OUTFIT_T[lang] || OUTFIT_T.en;
  const [name, setName] = useState(editOutfit?.outfit_name || '');
  const [selectedItems, setSelectedItems] = useState(
    editOutfit?.item_ids
      ? allItems.filter(i => editOutfit.item_ids.includes(i.id))
      : initialItem ? [initialItem] : []
  );
  const [activeCategory, setActiveCategory] = useState(
    initialItem ? (initialItem.category || 'Tops') : 'Tops'
  );
  const [swapTarget, setSwapTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const categoryItems = allItems.filter(i => i.category === activeCategory);

  const toggleItem = (item) => {
    if (swapTarget) {
      setSelectedItems(prev => prev.map(i => i.id === swapTarget.id ? item : i));
      setSwapTarget(null);
      return;
    }
    const alreadySelected = selectedItems.find(i => i.id === item.id);
    if (alreadySelected) {
      setSelectedItems(prev => prev.filter(i => i.id !== item.id));
    } else {
      setSelectedItems(prev => [...prev, item]);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || selectedItems.length === 0) return;
    setSaving(true);
    const payload = {
      outfit_name: name,
      item_ids: selectedItems.map(i => i.id),
      item_snapshots: selectedItems.map(i => ({
        id: i.id,
        name: i.name,
        photo_url: i.photo_url || '',
        emoji: i.emoji || '',
        category: i.category,
      })),
      is_manual: true,
      date_saved: new Date().toISOString().split('T')[0],
      times_worn: editOutfit?.times_worn || 0,
    };
    if (editOutfit?.id) {
      await base44.entities.SavedLook.update(editOutfit.id, payload);
    } else {
      await base44.entities.SavedLook.create(payload);
    }
    setSaving(false);
    onSave();
  };

  const canSave = name.trim() && selectedItems.length > 0;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 300, fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '52px 20px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: 0, color: '#000' }}>←</button>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={tO.namePlaceholder}
          style={{ flex: 1, border: 'none', fontSize: 18, fontWeight: 800, outline: 'none', color: '#000', letterSpacing: '-0.02em', fontFamily: 'Playfair Display, serif' }}
        />
      </div>

      {/* Selected items strip */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', minHeight: 100, background: '#fafafa' }}>
        {selectedItems.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 76, color: '#ccc', fontSize: 13 }}>
            {tO.selectHint}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {selectedItems.map(item => (
              <div key={item.id} style={{ flexShrink: 0, textAlign: 'center', position: 'relative' }}>
                <div
                  onClick={() => setSwapTarget(swapTarget?.id === item.id ? null : item)}
                  style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: swapTarget?.id === item.id ? '#fff3e0' : '#f5f5f5',
                    border: swapTarget?.id === item.id ? '2px solid #ff9500' : '2px solid transparent',
                    overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                  {item.photo_url
                    ? <img src={item.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.name} />
                    : <span style={{ fontSize: 28 }}>{item.emoji || '👕'}</span>
                  }
                </div>
                <button
                  onClick={() => setSelectedItems(prev => prev.filter(i => i.id !== item.id))}
                  style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#000', color: '#fff', border: 'none', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ×
                </button>
                <p style={{ fontSize: 9, color: '#888', marginTop: 4, maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                {swapTarget?.id === item.id && (
                  <p style={{ fontSize: 9, color: '#ff9500', fontWeight: 800, margin: 0 }}>{tO.swap}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Swap hint */}
      {swapTarget && (
        <div style={{ background: '#fff3e0', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 14 }}>🔄</span>
          <p style={{ fontSize: 12, color: '#ff9500', fontWeight: 700, margin: 0 }}>
            {tO.swapHint(swapTarget.name)}
          </p>
          <button onClick={() => setSwapTarget(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ff9500', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>{tO.cancel}</button>
        </div>
      )}

      {/* Category tabs */}
      <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            style={{
              padding: '10px 14px', background: 'none', border: 'none',
              borderBottom: activeCategory === cat ? '2px solid #000' : '2px solid transparent',
              fontSize: 12, fontWeight: activeCategory === cat ? 800 : 500,
              color: activeCategory === cat ? '#000' : '#999',
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
            }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {categoryItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#ccc' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>👗</p>
            <p style={{ fontSize: 13 }}>No {activeCategory} in your wardrobe yet</p>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {categoryItems.map(item => {
            const isSelected = !!selectedItems.find(i => i.id === item.id);
            const isSwapCandidate = swapTarget && swapTarget.category === item.category && swapTarget.id !== item.id;
            return (
              <div key={item.id} onClick={() => toggleItem(item)}
                style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer',
                  border: isSelected ? '3px solid #000' : isSwapCandidate ? '3px solid #ff9500' : '3px solid transparent',
                  background: '#f5f5f5',
                  opacity: swapTarget && !isSwapCandidate && !isSelected ? 0.35 : 1,
                  transition: 'all 0.15s',
                }}>
                {/* Square enforcer via padding-top trick */}
                <div style={{ paddingTop: '100%', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.photo_url ? (
                      <img
                        src={item.photo_url}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        alt={item.name}
                      />
                    ) : (
                      <span style={{ fontSize: 36 }}>{item.emoji || '👕'}</span>
                    )}
                  </div>
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    padding: '16px 6px 6px',
                  }}>
                    <p style={{ color: '#fff', fontSize: 10, fontWeight: 700, margin: 0, lineHeight: 1.2,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </p>
                  </div>
                  {isSelected && (
                    <div style={{
                      position: 'absolute', top: 6, right: 6,
                      width: 22, height: 22, borderRadius: '50%',
                      background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ color: '#fff', fontSize: 11 }}>✓</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save button */}
      <div style={{ padding: '12px 16px 40px', borderTop: '1px solid #f0f0f0', flexShrink: 0 }}>
        <button onClick={handleSave} disabled={saving || !canSave}
          style={{
            width: '100%', background: canSave ? '#000' : '#e0e0e0',
            color: canSave ? '#fff' : '#999',
            border: 'none', borderRadius: 20, padding: 18, fontSize: 15, fontWeight: 800, cursor: canSave ? 'pointer' : 'default'
          }}>
          {saving ? tO.saving : editOutfit ? tO.updateBtn(selectedItems.length) : tO.saveBtn(selectedItems.length)}
        </button>
      </div>
    </div>
  );
}