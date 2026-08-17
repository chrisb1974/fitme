import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CATEGORY_EMOJI } from '@/components/wardrobe/wearStatus';

const CONDITIONS = ['New with tags', 'Like new', 'Good', 'Fair'];
const MAX_PHOTOS = 5;

function isRealUrl(str) {
  return str && (str.startsWith('http://') || str.startsWith('https://'));
}

const compressImage = (file, maxWidthPx = 1200, qualityJpeg = 0.78) =>
  new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidthPx / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        blob => resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })),
        'image/jpeg',
        qualityJpeg
      );
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });

// Props:
//   item           – WardrobeItem being listed/edited
//   suggestedPrice – number
//   initialPhotos  – pre-loaded photo objects [{id, preview, url, uploading}] (for edit mode)
//   initialFormData– { title, description, price, condition, size } (for edit mode)
//   onClose        – fn()
//   onListed       – fn() called after save
export default function SellModal({ item, suggestedPrice, initialPhotos, initialFormData, onClose, onListed }) {
  const [formData, setFormData] = useState({
    title:       initialFormData?.title       || item?.name || '',
    description: initialFormData?.description || '',
    price:       String(initialFormData?.price || suggestedPrice || ''),
    size:        initialFormData?.size        || '',
    condition:   initialFormData?.condition   || 'Like new',
  });
  const [photos, setPhotos] = useState(initialPhotos || []);
  const [loadingDesc, setLoadingDesc] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  useEffect(() => {
    // Only auto-generate description if opening fresh (no initial data)
    if (!item || initialFormData?.description) return;
    generateDescription();
  }, [item]);

  const generateDescription = async () => {
    setLoadingDesc(true);
    const text = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a short 2-sentence marketplace listing description for this clothing item:
Name: ${item.name}
Brand: ${item.brand || 'unknown brand'}
Category: ${item.category}
Worn: ${item.times_worn || 0} times
Style tags: ${(item.style_tags || []).join(', ')}

Write naturally, like a real seller. Mention brand if known. Keep it under 40 words.`,
    });
    handleField('description', typeof text === 'string' ? text : '');
    setLoadingDesc(false);
  };

  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files);
    const remaining = MAX_PHOTOS - photos.length;
    const toProcess = files.slice(0, remaining);
    e.target.value = '';

    for (const file of toProcess) {
      const compressed = await compressImage(file);
      const preview = URL.createObjectURL(compressed);
      const tempId = Date.now() + Math.random();

      setPhotos(prev => [...prev, { id: tempId, preview, uploading: true, url: null }]);

      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: compressed });

        setPhotos(prev => prev.map(p =>
          p.id === tempId ? { ...p, uploading: false, url: file_url } : p
        ));

        // FIX 2: immediately persist uploaded photo URLs to WardrobeItem
        if (item?.id) {
          setPhotos(currentPhotos => {
            const allUrls = currentPhotos
              .filter(p => p.url && p.id !== tempId)
              .map(p => p.url)
              .concat([file_url]);

            base44.entities.WardrobeItem.update(item.id, {
              photo_url: allUrls[0],
              extra_photos: allUrls,
              season: Array.isArray(item.season) ? item.season : [],
            });

            return currentPhotos;
          });
        }
      } catch {
        setPhotos(prev => prev.filter(p => p.id !== tempId));
      }
    }
  };

  const removePhoto = (id) => setPhotos(prev => prev.filter(p => p.id !== id));

  const handleList = async () => {
    if (!formData.title) return;
    if (photos.some(p => p.uploading)) {
      alert('Please wait for photos to finish uploading.');
      return;
    }
    setSaving(true);

    const pickedPhotos = photos.map(p => p.url).filter(Boolean);
    // Fall back to the wardrobe item's own photos when none were added in the modal,
    // so the listing shows the real garment photo instead of an emoji.
    const inheritedPhotos = [item.photo_url, ...(Array.isArray(item.extra_photos) ? item.extra_photos : [])]
      .filter(isRealUrl);
    const photoUrls = pickedPhotos.length > 0 ? pickedPhotos : inheritedPhotos;

    await base44.entities.WardrobeItem.update(item.id, {
      is_for_sale: true,
      notes: formData.description,
      size: formData.size,
      ...(photoUrls.length > 0 && { photo_url: photoUrls[0], extra_photos: photoUrls }),
      season: Array.isArray(item.season) ? item.season : [],
    });

    // Denormalize seller info onto the listing so buyers can browse without
    // reading the seller's private profile row (profiles stays owner-only).
    let seller = {};
    try {
      const me = await base44.auth.me();
      const handle = (me.email ? me.email.split('@')[0] : (me.full_name || 'membre'))
        .toLowerCase().replace(/[^a-z0-9._]/g, '');
      seller = {
        seller_name: me.full_name || handle,
        seller_handle: handle,
        seller_location: me.location || '',
      };
    } catch { /* stay anonymous if profile unavailable */ }

    const listingPayload = {
      wardrobe_item_id: item.id,
      title:       formData.title || item.name,
      description: formData.description || '',
      price:       parseFloat(formData.price) || 0,
      condition:   formData.condition,
      size:        formData.size,
      category:    item.category,
      brand:       item.brand || '',
      color:       item.color || '',
      season:      Array.isArray(item.season) ? item.season : [],
      photos:      photoUrls,
      cover_photo: photoUrls[0] || null,
      emoji:       item.emoji || CATEGORY_EMOJI[item.category] || '✨',
      listing_type: 'sale',
      status:      'active',
      ...seller,
    };

    const existingListings = await base44.entities.MarketListing.filter({ wardrobe_item_id: item.id });
    if (existingListings.length > 0) {
      await base44.entities.MarketListing.update(existingListings[0].id, listingPayload);
    } else {
      await base44.entities.MarketListing.create(listingPayload);
    }

    setSaving(false);
    onListed();
  };

  const emoji = item?.emoji || CATEGORY_EMOJI[item?.category] || '✨';
  const realPhoto = isRealUrl(item?.photo_url) ? item.photo_url : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="w-full max-w-md bg-background rounded-t-[32px] max-h-[92vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pt-3 flex justify-center">
            <div className="w-10 h-1.5 rounded-full bg-border" />
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <h2 className="text-xl font-extrabold">
              {initialFormData ? 'Edit Listing' : 'List on FitMe Market'}
            </h2>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 pb-8 space-y-4">
            {/* Item preview */}
            <div className="flex items-center gap-3 bg-secondary rounded-2xl p-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white flex items-center justify-center text-2xl shrink-0">
                {realPhoto ? <img src={realPhoto} alt={item.name} className="w-full h-full object-cover" /> : emoji}
              </div>
              <div>
                <p className="font-extrabold text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.brand || item.category}</p>
              </div>
            </div>

            {/* Multi-photo upload */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px' }}>
                Photos ({photos.length}/{MAX_PHOTOS})
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {photos.map((p, idx) => (
                  <div key={p.id} style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', background: '#f5f5f5' }}>
                    <div style={{ paddingTop: '100%', position: 'relative' }}>
                      <div style={{ position: 'absolute', inset: 0 }}>
                        <img src={p.preview} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: p.uploading ? 0.5 : 1 }} alt="" />
                        {p.uploading && (
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid #fff', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                          </div>
                        )}
                        {!p.uploading && (
                          <button onClick={() => removePhoto(p.id)}
                            style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            ×
                          </button>
                        )}
                        {idx === 0 && (
                          <div style={{ position: 'absolute', bottom: 6, left: 6, background: 'rgba(0,0,0,0.6)', borderRadius: 8, padding: '2px 8px' }}>
                            <p style={{ color: '#fff', fontSize: 9, fontWeight: 800, margin: 0 }}>COVER</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <label style={{ borderRadius: 16, border: '2px dashed #e0e0e0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fafafa', gap: 6, aspectRatio: '1' }}>
                    <span style={{ fontSize: 28, color: '#ccc' }}>+</span>
                    <span style={{ fontSize: 11, color: '#bbb', fontWeight: 600 }}>{photos.length === 0 ? 'Add photo' : 'Add more'}</span>
                    <input type="file" accept="image/*" multiple onChange={handlePhotoSelect} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
              {photos.length === MAX_PHOTOS && (
                <p style={{ fontSize: 11, color: '#aaa', marginTop: 8, textAlign: 'center' }}>Maximum 5 photos reached</p>
              )}
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</Label>
              <Input value={formData.title} onChange={(e) => handleField('title', e.target.value)} className="mt-1.5 bg-white rounded-2xl h-12" />
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
              {loadingDesc ? (
                <div className="mt-1.5 bg-white rounded-2xl h-20 flex items-center justify-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> AI writing…
                </div>
              ) : (
                <textarea
                  value={formData.description}
                  onChange={(e) => handleField('description', e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full bg-white rounded-2xl px-3 py-3 text-sm border border-input outline-none resize-none"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Price (€)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleField('price', e.target.value)}
                  className="mt-1.5 bg-white rounded-2xl h-12"
                />
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Size</Label>
                <Input
                  value={formData.size}
                  onChange={(e) => handleField('size', e.target.value)}
                  placeholder="S / M / 38…"
                  className="mt-1.5 bg-white rounded-2xl h-12"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Condition</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {CONDITIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleField('condition', c)}
                    style={{
                      padding: '8px 16px', borderRadius: 20, border: '1.5px solid',
                      borderColor: formData.condition === c ? '#000' : '#e0e0e0',
                      background: formData.condition === c ? '#000' : '#fff',
                      color: formData.condition === c ? '#fff' : '#000',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleList}
              disabled={saving || loadingDesc}
              className="w-full h-14 rounded-full font-extrabold text-base bg-primary text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ boxShadow: '0 8px 24px -6px rgba(255,107,71,0.45)' }}
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : initialFormData ? 'Save changes ✓' : 'List on FitMe Market 🎉'}
            </button>
            <button onClick={onClose} className="w-full text-sm text-muted-foreground font-semibold py-2">
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}