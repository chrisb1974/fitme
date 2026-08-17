import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n.jsx';

const languageInstructions = {
  en: 'Respond in English.',
  es: 'Responde ÚNICAMENTE en español. El nombre, color, notas y style_tags deben estar en español.',
  fr: 'Réponds UNIQUEMENT en français. Le nom, la couleur, les notes et les style_tags doivent être en français.',
  de: 'Antworte NUR auf Deutsch.',
  it: 'Rispondi SOLO in italiano.',
  pt: 'Responde APENAS em português.',
};

const buildPrompt = (lang) => `${languageInstructions[lang] || languageInstructions['en']}

Analyze this clothing item photo and return ONLY valid JSON with no markdown:
{
  "name": "descriptive name in the requested language",
  "category": "Tops|Bottoms|Dresses|Shoes|Bags|Accessories|Jewellery",
  "color": "main color in the requested language",
  "brand": "brand if visible or empty string",
  "season": ["Spring","Summer","Autumn","Winter"],
  "style_tags": ["tag1","tag2","tag3"],
  "notes": "one sentence description in the requested language"
}`;

export default function GalleryImport({ onDone, onClose }) {
  const { lang, t } = useLanguage();
  const [analyzed, setAnalyzed] = useState([]);
  const [progress, setProgress] = useState(null); // { current, total }
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setProgress({ current: 0, total: files.length });
    setAnalyzed([]);

    for (let i = 0; i < files.length; i++) {
      setProgress({ current: i + 1, total: files.length });
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: files[i] });
        const raw = await base44.integrations.Core.InvokeLLM({
          prompt: buildPrompt(lang),
          file_urls: [file_url],
          model: 'gemini_3_flash',
        });
        const cleaned = (typeof raw === 'string' ? raw : JSON.stringify(raw)).replace(/```json|```/g, '').trim();
        const result = JSON.parse(cleaned);
        setAnalyzed((prev) => [...prev, { ...result, photo_url: file_url, confirmed: true }]);
      } catch {
        // skip failed
      }
    }
    setProgress(null);
  };

  const saveAll = async () => {
    setProcessing(true);
    const toSave = analyzed.filter((i) => i.confirmed);
    for (const item of toSave) {
      await base44.entities.WardrobeItem.create({
        name: item.name || 'Item',
        category: item.category || 'Tops',
        color: item.color || '',
        brand: item.brand || '',
        season: item.season || [],
        style_tags: item.style_tags || [],
        notes: item.notes || '',
        photo_url: item.photo_url,
        times_worn: 0,
        date_added: new Date().toISOString().split('T')[0],
      });
    }
    setProcessing(false);
    onDone(toSave.length);
  };

  // On mount, immediately open file picker
  React.useEffect(() => {
    fileInputRef.current?.click();
  }, []);

  const isImporting = progress !== null;
  const isDone = !isImporting && analyzed.length > 0;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: '#fff', fontFamily: 'DM Sans, sans-serif', overflowY: 'auto' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        style={{ display: 'none' }}
      />

      {/* Header */}
      <div style={{ padding: '52px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E8E6E1' }}>
        <div>
          <p style={{ color: '#A8A8A8', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', margin: '0 0 4px', textTransform: 'uppercase' }}>
            {t('galleryImport')}
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, fontFamily: 'Playfair Display, serif' }}>
            {isImporting ? t('analysing') : isDone ? t('itemsDetected', analyzed.length) : t('importFromGallery')}
          </h2>
        </div>
        <button onClick={onClose} style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <X style={{ color: '#6B6B6B', width: 16, height: 16 }} />
        </button>
      </div>

      {/* Progress bar */}
      {isImporting && (
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{t('aiAnalysing')}</span>
            <span style={{ fontSize: 13, color: '#888' }}>{progress.current}/{progress.total}</span>
          </div>
          <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3 }}>
            <div style={{ height: '100%', background: '#0F0F0F', borderRadius: 3, width: `${(progress.current / progress.total) * 100}%`, transition: 'width 0.3s ease' }} />
          </div>
        </div>
      )}

      {/* Analyzed grid */}
      {analyzed.length > 0 && (
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {analyzed.map((item, i) => (
            <div key={i} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '3/4' }}>
              <img src={item.photo_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.85))', padding: '20px 8px 8px' }}>
                <p style={{ color: '#fff', fontSize: 11, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{item.name}</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, margin: '2px 0 0' }}>{item.category} · {item.color}</p>
              </div>
              <button
                onClick={() => setAnalyzed((prev) => prev.map((a, j) => j === i ? { ...a, confirmed: !a.confirmed } : a))}
                style={{
                  position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%',
                  background: item.confirmed ? '#22c55e' : 'rgba(0,0,0,0.4)',
                  border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {item.confirmed ? '✓' : '×'}
              </button>
            </div>
          ))}
          {/* Pending spinner placeholders */}
          {isImporting && (
            <div style={{ borderRadius: 12, background: '#F5F4F1', aspectRatio: '3/4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #0F0F0F', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}
        </div>
      )}

      {/* Empty / initial state */}
      {!isImporting && analyzed.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 40px', color: '#A8A8A8' }}>
          <p style={{ fontSize: 48, margin: '0 0 16px' }}>🖼️</p>
          <p style={{ fontSize: 14 }}>{t('selectFromGallery')}</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ marginTop: 24, background: '#0F0F0F', color: '#fff', border: 'none', borderRadius: 2, padding: '14px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            {t('openGallery')}
          </button>
        </div>
      )}

      {/* Save button */}
      {isDone && (
        <div style={{ padding: '16px 20px 48px' }}>
          <button
            onClick={saveAll}
            disabled={processing || analyzed.filter(i => i.confirmed).length === 0}
            style={{ width: '100%', background: '#0F0F0F', color: '#fff', border: 'none', borderRadius: 2, padding: 18, fontSize: 15, fontWeight: 800, cursor: 'pointer', opacity: processing ? 0.6 : 1 }}
          >
            {processing ? t('saving') : t('addItemsToDressing', analyzed.filter(i => i.confirmed).length)}
          </button>
        </div>
      )}
    </div>
  );
}