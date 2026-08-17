import React, { useState, useRef } from 'react';
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

export default function BatchScanSession({ onDone, onClose }) {
  const { lang, t } = useLanguage();
  const [queue, setQueue] = useState([]);
  const [analyzed, setAnalyzed] = useState([]);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const takePhoto = () => fileInputRef.current?.click();

  const handleCapture = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    e.target.value = '';

    const newItems = files.map((f) => ({ file: f, url: URL.createObjectURL(f), status: 'pending' }));
    setQueue((prev) => [...prev, ...newItems]);
    analyzeItems(newItems);
  };

  const analyzeItems = async (items) => {
    for (const item of items) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: item.file });
        const raw = await base44.integrations.Core.InvokeLLM({
          prompt: buildPrompt(lang),
          file_urls: [file_url],
          model: 'gemini_3_flash',
        });
        const cleaned = (typeof raw === 'string' ? raw : JSON.stringify(raw)).replace(/```json|```/g, '').trim();
        const result = JSON.parse(cleaned);
        setAnalyzed((prev) => [...prev, { ...result, photo_url: file_url, confirmed: true }]);
      } catch {
        // skip failed items silently
      }
      setQueue((prev) => prev.map((q) => q.url === item.url ? { ...q, status: 'done' } : q));
    }
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

  const pending = queue.filter((q) => q.status === 'pending');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: '#000', fontFamily: 'DM Sans, sans-serif', overflowY: 'auto' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleCapture}
        style={{ display: 'none' }}
      />

      {/* Header */}
      <div style={{ padding: '52px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', margin: '0 0 4px', textTransform: 'uppercase' }}>
            {t('batchScan')}
          </p>
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 900, margin: 0 }}>
            {t('photosScanned', queue.length)}
          </h2>
          {pending.length > 0 && (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '4px 0 0' }}>
              {t('analysingRemaining', pending.length)}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {analyzed.length > 0 && (
            <button
              onClick={saveAll}
              disabled={processing}
              style={{ background: '#fff', color: '#000', border: 'none', borderRadius: 20, padding: '10px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer', opacity: processing ? 0.6 : 1 }}
            >
              {processing ? '…' : t('saveCount', analyzed.filter(i => i.confirmed).length)}
            </button>
          )}
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X style={{ color: '#fff', width: 16, height: 16 }} />
          </button>
        </div>
      </div>

      {/* Grid */}
      {(analyzed.length > 0 || pending.length > 0) && (
        <div style={{ padding: '0 16px 140px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
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
                  background: item.confirmed ? '#22c55e' : 'rgba(255,255,255,0.3)',
                  border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {item.confirmed ? '✓' : '×'}
              </button>
            </div>
          ))}
          {pending.map((q, i) => (
            <div key={i} style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '3/4', position: 'relative' }}>
              <img src={q.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #fff', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {queue.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 40px', color: 'rgba(255,255,255,0.4)' }}>
          <p style={{ fontSize: 48, margin: '0 0 16px' }}>📷</p>
          <p style={{ fontSize: 14 }}>{t('tapToScanFirst')}</p>
        </div>
      )}

      {/* Bottom CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px 40px', background: 'linear-gradient(transparent,#000)' }}>
        <button
          onClick={takePhoto}
          style={{ width: '100%', background: '#fff', color: '#000', border: 'none', borderRadius: 20, padding: 18, fontSize: 16, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
        >
          <span style={{ fontSize: 22 }}>📸</span>
          {queue.length === 0 ? t('scanAnItem') : t('scanAnotherItem')}
        </button>
      </div>
    </div>
  );
}