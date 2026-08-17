import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Mic, Sparkles, Wand2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useFitMeToast } from '@/components/ui/FitMeToaster';
import { base44 } from '@/api/base44Client';
import { useSeason, itemMatchesSeason } from '@/lib/SeasonContext.jsx';
import { useLanguage } from '@/lib/i18n.jsx';
import OccasionChips from '@/components/looks/OccasionChips';
import VoiceModal from '@/components/looks/VoiceModal';
import GeneratingLoader from '@/components/looks/GeneratingLoader';
import OutfitResultCard from '@/components/looks/OutfitResultCard';
import MarketSuggestions from '@/components/looks/MarketSuggestions';
import SavedLooksSection from '@/components/looks/SavedLooksSection';
import TripPlanner from '@/components/trips/TripPlanner';

export default function LookGenerator() {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [showVoice, setShowVoice] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [genError, setGenError] = useState(false);
  const qc = useQueryClient();
  const { toast } = useFitMeToast();
  const { activeSeason } = useSeason();

  const { data: wardrobeItems = [] } = useQuery({
    queryKey: ['wardrobe'],
    queryFn: () => base44.entities.WardrobeItem.list(),
    initialData: [],
  });

  const emptyWardrobe = wardrobeItems.length === 0;

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return;
    setResult(null);
    setGenError(false);
    setGenerating(true);

    try {
      // Always fetch fresh items from DB
      const freshItems = await base44.entities.WardrobeItem.list();

      if (freshItems.length === 0) {
        toast({ description: 'Add clothes to your wardrobe first!' });
        setGenerating(false);
        return;
      }

      // Filter items to active season
      const seasonItems = freshItems.filter((i) => itemMatchesSeason(i, activeSeason));
      const itemsToUse = seasonItems.length > 0 ? seasonItems : freshItems;

      const itemLines = itemsToUse
        .map((i) => `ID: ${i.id} | ${i.name} | ${i.category} | ${i.color || 'unknown'} | Worn ${i.times_worn || 0} times`)
        .join('\n');

      const responseText = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        prompt: `You are a personal stylist. The user wants an outfit for: ${prompt}

Here are all their wardrobe items:
${itemLines}

Return ONLY a valid JSON object with NO extra text, NO markdown, NO backticks:
{
  "outfitName": "Creative outfit name",
  "matchScore": 88,
  "description": "One sentence describing the outfit combination",
  "stylingTip": "One practical styling tip",
  "selectedItemIds": ["id1", "id2", "id3"]
}

Select 3-5 items that work together. Prioritize items worn less often. Include a top or dress, bottom if needed, shoes, and a bag or accessory if available.`,
      });

      // Strip markdown backticks if present
      const cleaned = (typeof responseText === 'string' ? responseText : JSON.stringify(responseText))
        .replace(/```json|```/g, '')
        .trim();
      const parsed = typeof responseText === 'object' ? responseText : JSON.parse(cleaned);

      const chosen = itemsToUse.filter((i) => (parsed.selectedItemIds || []).includes(i.id));
      setSelectedItems(chosen);
      setResult(parsed);
    } catch (err) {
      setGenError(true);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveLook = async () => {
    if (!result) return;
    setSaving(true);
    await base44.entities.SavedLook.create({
      outfit_name: result.outfitName || result.outfit_name,
      style_description: result.description || result.style_description,
      styling_tip: result.stylingTip || result.styling_tip,
      item_ids: result.selectedItemIds || result.item_ids,
      item_snapshots: selectedItems.map((i) => ({
        id: i.id, name: i.name, photo_url: i.photo_url || '', emoji: i.emoji || '', category: i.category,
      })),
      match_score: result.matchScore || result.match_score,
      occasion_prompt: prompt,
      date_saved: new Date().toISOString().slice(0, 10),
      season: activeSeason,
      is_favourite: false,
    });
    qc.invalidateQueries({ queryKey: ['saved-looks'] });
    setSaving(false);
    toast({ description: 'Look saved! 💕' });
  };

  const handleRetry = () => {
    setResult(null);
    setSelectedItems([]);
    setGenError(false);
    handleGenerate();
  };

  const handleWearToday = async () => {
    const today = new Date().toISOString().slice(0, 10);
    await Promise.all(
      selectedItems.map((item) =>
        base44.entities.WardrobeItem.update(item.id, {
          times_worn: (item.times_worn || 0) + 1,
          last_worn_date: today,
        })
      )
    );
    qc.invalidateQueries({ queryKey: ['wardrobe'] });
    toast({ description: "You're wearing this today! 🎉" });
  };

  return (
    <div className="pb-10 bg-white">
      {/* Header */}
      <div className="px-5 pt-10 pb-4">
        <p className="text-[11px] uppercase tracking-[0.1em] font-body font-medium mb-1" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>{t('aiStylist')}</p>
        <h1 className="text-[28px] leading-tight font-display font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>{t('getALook')}</h1>
        <p className="text-sm font-body mt-1" style={{ color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}>{t('tellFitMe')}</p>
      </div>

      {/* Empty wardrobe state */}
      {emptyWardrobe ? (
        <div className="mx-5 mt-4 bg-white p-8 text-center" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
          <div className="text-5xl mb-4">👗</div>
          <p className="font-display font-semibold text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>{t('emptyWardrobeTitle')}</p>
          <p className="text-sm font-body mt-2 max-w-xs mx-auto" style={{ color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}>
            {t('emptyWardrobeDesc')}
          </p>
          <a
            href="/wardrobe"
            className="mt-5 inline-block text-xs font-body uppercase tracking-[0.06em] font-semibold px-6 py-3"
            style={{ background: '#0F0F0F', color: '#fff', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' }}
          >
            {t('goToWardrobe')}
          </a>
        </div>
      ) : (
        <>
          {/* Text input */}
          <div className="mx-5 bg-white p-4" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('promptPlaceholder')}
              rows={3}
              className="w-full resize-none bg-transparent border-0 outline-none text-sm font-body leading-relaxed"
              style={{ fontFamily: 'DM Sans, sans-serif', color: '#0F0F0F' }}
            />
          </div>

          {/* Voice button */}
          <div className="flex flex-col items-center mt-5 gap-2">
            <button
              onClick={() => setShowVoice(true)}
              className="w-14 h-14 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              style={{ background: '#0F0F0F' }}
            >
              <Mic className="w-6 h-6 text-white" />
            </button>
            <p className="text-[11px] font-body uppercase tracking-[0.06em]" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{t('orSpeakYourVibe')}</p>
          </div>

          {/* Occasion chips */}
          <div className="mt-5">
            <p className="px-5 text-[11px] uppercase tracking-[0.08em] font-body font-medium mb-2" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>{t('quickPick')}</p>
            <OccasionChips onSelect={(v) => setPrompt(v)} />
          </div>

          {/* Generate button */}
          <div className="px-5 mt-5">
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || generating}
              className="w-full h-12 font-body text-xs uppercase tracking-[0.06em] font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
              style={{
                background: !prompt.trim() || generating ? '#F5F4F1' : '#0F0F0F',
                color: !prompt.trim() || generating ? '#A8A8A8' : '#fff',
                border: '1px solid #E8E6E1',
                borderRadius: '2px',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              <Wand2 className="w-4 h-4" />
              {t('findMyOutfit')}
            </button>
          </div>

          {/* Generating loader */}
          {generating && <GeneratingLoader />}

          {/* Error state */}
          {!generating && genError && (
            <div className="mx-5 mt-6 bg-white p-8 text-center" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
              <p className="font-display font-semibold text-base" style={{ fontFamily: 'Playfair Display, serif' }}>{t('couldntGenerate')}</p>
              <p className="text-sm font-body mt-1" style={{ color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}>{t('hitASnag')}</p>
              <button
                onClick={handleRetry}
                className="mt-4 text-xs font-body uppercase tracking-[0.06em] font-semibold px-6 py-2.5"
                style={{ background: '#0F0F0F', color: '#fff', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' }}
              >
                {t('tryAgain')}
              </button>
            </div>
          )}

          {/* Result */}
          {!generating && !genError && result && (
            <>
              <OutfitResultCard
                result={result}
                selectedItems={selectedItems}
                onSave={handleSaveLook}
                onRetry={handleRetry}
                onWearToday={handleWearToday}
                saving={saving}
              />
              <MarketSuggestions />
            </>
          )}

          {/* Empty state when no result yet */}
          {!generating && !genError && !result && (
            <div className="mx-5 mt-6 p-8 text-center" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3" style={{ background: '#F5F4F1', borderRadius: '4px' }}>
                <Sparkles className="w-5 h-5" style={{ color: '#A8A8A8' }} />
              </div>
              <p className="font-display font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>{t('lookWillAppear')}</p>
              <p className="text-xs font-body mt-1" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
                {t('poweredByWardrobe')}
              </p>
            </div>
          )}
        </>
      )}

      {/* Saved looks */}
      <SavedLooksSection />

      {/* Trip Planner */}
      <TripPlanner />

      {/* Voice modal */}
      {showVoice && (
        <VoiceModal
          onClose={() => setShowVoice(false)}
          onConfirm={(text) => { setPrompt(text); setShowVoice(false); }}
        />
      )}
    </div>
  );
}