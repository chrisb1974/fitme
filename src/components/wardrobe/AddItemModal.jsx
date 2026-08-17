import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Sparkles, Loader2, Upload, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { analyzeClothingPhoto } from '@/functions/analyzeClothingPhoto';
import { SeasonMultiChips } from '@/components/shared/SeasonChips.jsx';
import { useLanguage } from '@/lib/i18n.jsx';

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Shoes', 'Bags', 'Accessories', 'Jewellery'];
const COLORS = ['White', 'Black', 'Blue', 'Red', 'Pink', 'Green', 'Brown', 'Beige', 'Grey', 'Multi', 'Yellow', 'Orange', 'Purple'];
const BRANDS = ['Zara', 'Stradivarius', 'Bershka', 'Pull&Bear', 'Mango', 'H&M', 'Shein', 'Nike', 'Adidas', 'New Balance', 'Hollister', 'Massimo Dutti', '& Other Stories', 'COS', 'Lefties', 'Springfield', 'Primark', "Levi's", 'Vans', 'Zara Home'];

const emptyForm = { name: '', category: '', color: '', brand: '', style_tags: [], notes: '', season: [], photo_url: '' };

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Gold dot shown next to AI-filled field labels
function AiDot() {
  return <span style={{ color: '#C9A96E', fontSize: '10px', marginLeft: '4px' }}>●</span>;
}

const labelStyle = {
  fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
  fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: '#A8A8A8',
  display: 'flex', alignItems: 'center',
};

const inputStyle = {
  background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px',
  fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: '#0F0F0F', height: '44px',
};

export default function AddItemModal({ open, onClose, onSaved }) {
  const { t, lang } = useLanguage();
  const fileRef = useRef(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(null); // null | 'vision' | 'ai' | 'success' | 'error' | 'low_confidence' | 'done'
  const [aiFields, setAiFields] = useState({}); // tracks which fields were AI-filled
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const reset = () => { setForm(emptyForm); setAnalysisStep(null); setAiFields({}); setTagInput(''); };
  const handleClose = () => { reset(); onClose(); };

  const setFormField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleBrandChip = (brand) => {
    setForm((f) => ({ ...f, brand: f.brand === brand ? '' : brand }));
    setAiFields((a) => ({ ...a, brand: false })); // manual selection removes ai dot
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm((f) => ({ ...f, photo_url: file_url }));
    setUploading(false);

    // Wait for analysis to complete before allowing save
    setAnalysisStep('vision');
    await analyzePhoto(file, file_url);
  };

  const analyzePhoto = async (file, photoUrl) => {
    setAnalysisStep('vision');
    setAiFields({});

    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 45000));

    const doAnalysis = async () => {
      const base64Image = await fileToBase64(file);

      // Step 1: Vision scan indicator
      setAnalysisStep('vision');
      await new Promise((r) => setTimeout(r, 300)); // brief pause so UI shows step

      // Call backend (handles Vision + Claude)
      setAnalysisStep('ai');
  const response = await analyzeClothingPhoto({ base64Image, photoUrl, lang });
  console.log('Full response:', response);
  return response.data || response;
    };

    try {
      const result = await Promise.race([doAnalysis(), timeout]);
      console.log('Result received:', result);
      if (!result || result.error) throw new Error(result?.error || 'No result');

      const filled = {};
      setForm((f) => {
        const next = { ...f };
        if (result.name)       { next.name = result.name;             filled.name = true; }
        if (result.category)   { next.category = result.category;     filled.category = true; }
        if (result.color)      { next.color = result.color;           filled.color = true; }
        if (result.brand)      { next.brand = result.brand;           filled.brand = true; }
        if (result.season?.length > 0) {
          next.season = result.season;
          filled.season = true;
        }
        if (result.notes) { next.notes = result.notes; filled.notes = true; }
        if (result.style_tags?.length > 0) { next.style_tags = result.style_tags; filled.style_tags = true; }
        return next;
      });
      setAiFields(filled);

      setAnalysisStep(result.low_confidence ? 'low_confidence' : 'success');
      if (!result.low_confidence) {
        setTimeout(() => setAnalysisStep((s) => s === 'success' ? 'done' : s), 2000);
      }
    } catch {
      setAnalysisStep('error');
    }
  };

  const addTag = (raw) => {
    const tags = raw.split(/[,\n]/).map((t) => t.trim()).filter(Boolean);
    if (!tags.length) return;
    setForm((f) => ({ ...f, style_tags: [...new Set([...f.style_tags, ...tags])] }));
    setTagInput('');
  };
  const removeTag = (tag) => setForm((f) => ({ ...f, style_tags: f.style_tags.filter((t) => t !== tag) }));
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); }
    else if (e.key === 'Backspace' && !tagInput && form.style_tags.length > 0) removeTag(form.style_tags[form.style_tags.length - 1]);
  };

  const handleSave = async () => {
    if (!form.name || !form.category) return;
    setSaving(true);
    await base44.entities.WardrobeItem.create({
      name: form.name, category: form.category, color: form.color,
      brand: form.brand, style_tags: form.style_tags, photo_url: form.photo_url,
      notes: form.notes, season: form.season || [], times_worn: 0,
      date_added: new Date().toISOString().slice(0, 10),
    });
    setSaving(false);
    reset();
    onSaved?.();
    onClose();
  };

  const analyzing = analysisStep === 'vision' || analysisStep === 'ai';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="w-full max-w-md bg-background rounded-t-[16px] sm:rounded-[8px] flex flex-col"
            style={{ maxHeight: '92vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="pt-3 pb-1 flex justify-center shrink-0 sm:hidden">
              <div className="w-10 h-1" style={{ background: '#E8E6E1', borderRadius: '999px' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ borderBottom: '1px solid #E8E6E1' }}>
              <h2 className="text-lg font-display font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>
                {t('addToCloset')}
              </h2>
              <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center"
                style={{ background: '#F5F4F1', borderRadius: '2px', border: '1px solid #E8E6E1' }}>
                <X className="w-4 h-4" style={{ color: '#6B6B6B' }} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4" style={{ paddingBottom: '8px' }}>

              {/* ── Photo upload ── */}
              <div>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full relative overflow-hidden flex items-center justify-center"
                  style={{ aspectRatio: '4/5', background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '4px' }}
                >
                  {form.photo_url ? (
                    <>
                      <img src={form.photo_url} alt="item" className="w-full h-full object-cover" onError={(e) => e.target.style.opacity = '0.3'} />

                      {/* Analysing overlay */}
                      {analyzing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
                          <Loader2 className="w-7 h-7 animate-spin text-white" />
                          <p className="text-xs font-body font-semibold text-white flex items-center gap-1.5"
                            style={{ fontFamily: 'DM Sans, sans-serif' }}>
                            <Sparkles className="w-3.5 h-3.5" style={{ color: '#C9A96E' }} />
                            {analysisStep === 'vision' ? t('scanningVision') : t('structuringAI')}
                          </p>
                        </div>
                      )}

                      {/* Success banner */}
                      {analysisStep === 'success' && (
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-1.5 py-2 px-3"
                          style={{ background: 'rgba(0,0,0,0.65)', borderRadius: '4px' }}>
                          <CheckCircle2 className="w-4 h-4" style={{ color: '#C9A96E' }} />
                          <span className="text-xs font-body font-semibold" style={{ color: '#C9A96E', fontFamily: 'DM Sans, sans-serif' }}>
                            {t('analysisComplete')}
                          </span>
                        </div>
                      )}

                      {/* Change button */}
                      {!analyzing && analysisStep !== 'success' && (
                        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5"
                          style={{ background: 'rgba(255,255,255,0.92)', borderRadius: '2px' }}>
                          <Upload className="w-3 h-3" style={{ color: '#0F0F0F' }} />
                          <span className="text-[11px] font-body font-semibold" style={{ color: '#0F0F0F', fontFamily: 'DM Sans, sans-serif' }}>{t('change')}</span>
                        </div>
                      )}
                    </>
                  ) : uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#0F0F0F' }} />
                  ) : (
                    <div className="text-center px-4">
                      <div className="w-14 h-14 flex items-center justify-center mx-auto mb-3"
                        style={{ background: '#E8E6E1', borderRadius: '4px' }}>
                        <Camera className="w-7 h-7" style={{ color: '#0F0F0F' }} strokeWidth={2} />
                      </div>
                      <p className="font-body font-semibold text-sm" style={{ color: '#0F0F0F', fontFamily: 'DM Sans, sans-serif' }}>{t('snapOrUpload')}</p>
                      <p className="text-xs font-body mt-1 flex items-center gap-1 justify-center" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
                      <Sparkles className="w-3 h-3" style={{ color: '#C9A96E' }} /> {t('aiAutoFills')}
                      </p>
                    </div>
                  )}
                </button>
              </div>

              {/* Status messages */}
              {analysisStep === 'low_confidence' && (
                <p className="text-xs font-body text-center" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
                  {t('verifyDetails')}
                </p>
              )}
              {analysisStep === 'error' && (
                <p className="text-xs font-body text-center" style={{ color: '#8B3A3A', fontFamily: 'DM Sans, sans-serif' }}>
                  {t('analysisUnavailable')}
                </p>
              )}

              {/* ── Brand quick-select ── */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p style={labelStyle}>{t('brand')} {aiFields.brand && <AiDot />}</p>
                  <p className="text-[10px] font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>{t('tapToSelect')}</p>
                </div>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                  {BRANDS.map((b) => {
                    const active = form.brand === b;
                    return (
                      <button
                        key={b}
                        onClick={() => handleBrandChip(b)}
                        className="shrink-0 text-xs font-body font-medium transition-all"
                        style={{
                          padding: '6px 14px',
                          borderRadius: '2px',
                          fontFamily: 'DM Sans, sans-serif',
                          fontSize: '12px',
                          background: active ? '#0F0F0F' : '#F5F4F1',
                          color: active ? '#fff' : '#0F0F0F',
                          border: active ? '1px solid #0F0F0F' : '1px solid #E8E6E1',
                        }}
                      >
                        {b}
                      </button>
                    );
                  })}
                </div>
                <input
                  value={form.brand}
                  onChange={(e) => { setFormField('brand', e.target.value); setAiFields((a) => ({ ...a, brand: false })); }}
                  placeholder={t('orTypeBrand')}
                  className="w-full px-3 outline-none font-body mt-2"
                  style={inputStyle}
                />
              </div>

              {/* ── Name ── */}
              <div>
                <p style={labelStyle} className="mb-1.5">{t('name')} {aiFields.name && <AiDot />}</p>
                <input
                  value={form.name}
                  onChange={(e) => { setFormField('name', e.target.value); setAiFields((a) => ({ ...a, name: false })); }}
                  placeholder={t('namePlaceholder')}
                  className="w-full px-3 outline-none font-body"
                  style={inputStyle}
                />
              </div>

              {/* ── Category ── */}
              <div>
                <p style={labelStyle} className="mb-1.5">{t('category')} {aiFields.category && <AiDot />}</p>
                <Select value={form.category} onValueChange={(v) => { setFormField('category', v); setAiFields((a) => ({ ...a, category: false })); }}>
                  <SelectTrigger className="font-body" style={{ ...inputStyle, paddingLeft: '12px' }}>
                    <SelectValue placeholder={t('pickCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* ── Season multi-select ── */}
              <div>
                <p style={labelStyle} className="mb-1.5">{t('seasonLabel')} {aiFields.season && <AiDot />}</p>
                <SeasonMultiChips
                  selected={form.season}
                  onChange={(v) => { setFormField('season', v); setAiFields((a) => ({ ...a, season: false })); }}
                />
              </div>

              {/* ── Colour ── */}
              <div>
                <p style={labelStyle} className="mb-1.5">{t('colour')} {aiFields.color && <AiDot />}</p>
                <Select value={form.color} onValueChange={(v) => { setFormField('color', v); setAiFields((a) => ({ ...a, color: false })); }}>
                  <SelectTrigger className="font-body" style={{ ...inputStyle, paddingLeft: '12px' }}>
                    <SelectValue placeholder={t('pickColour')} />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* ── Style tags ── */}
              <div>
                <p style={labelStyle} className="mb-1.5">{t('styleTags')} {aiFields.style_tags && <AiDot />}</p>
                <div
                  className="w-full min-h-[44px] px-2 py-2 flex flex-wrap gap-1.5 items-center cursor-text"
                  style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px' }}
                  onClick={() => document.getElementById('tag-input')?.focus()}
                >
                  {form.style_tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 text-[11px] font-body font-semibold px-2 py-0.5"
                      style={{ background: '#0F0F0F', color: '#fff', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' }}>
                      {tag}
                      <button onClick={(e) => { e.stopPropagation(); removeTag(tag); }} className="opacity-60 hover:opacity-100 ml-0.5 leading-none">×</button>
                    </span>
                  ))}
                  <input
                    id="tag-input"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => tagInput && addTag(tagInput)}
                    placeholder={form.style_tags.length === 0 ? t('styleTagsPlaceholder') : ''}
                    className="flex-1 min-w-[80px] outline-none bg-transparent text-[13px] font-body"
                    style={{ fontFamily: 'DM Sans, sans-serif', color: '#0F0F0F' }}
                  />
                </div>
              </div>

              {/* ── Notes ── */}
              <div>
                <p style={labelStyle} className="mb-1.5">{t('notes')}</p>
                <textarea
                  value={form.notes}
                  onChange={(e) => setFormField('notes', e.target.value)}
                  placeholder={t('notesPlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2.5 outline-none font-body resize-none"
                  style={{ ...inputStyle, height: 'auto', lineHeight: '1.5' }}
                />
              </div>

            </div>

            {/* ── Sticky Save footer ── */}
            <div className="shrink-0 px-5 py-4" style={{ borderTop: '1px solid #E8E6E1', background: '#fff' }}>
              <button
                disabled={!form.name || !form.category || saving || analyzing}
                onClick={handleSave}
                className="w-full h-12 font-body font-semibold text-xs uppercase tracking-[0.06em] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
                style={{ background: '#0F0F0F', color: '#fff', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('addToWardrobe')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}