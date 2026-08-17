import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useFitMeToast } from '@/components/ui/FitMeToaster';
import { useLanguage } from '@/lib/i18n.jsx';
import TripInputCard from './TripInputCard';
import TripResult from './TripResult';
import MyTrips from './MyTrips';

const languageInstructions = {
  en: 'Respond in English.',
  es: 'Responde ÚNICAMENTE en español. Todo el texto generado debe estar en español.',
  fr: 'Réponds UNIQUEMENT en français. Tous les textes générés doivent être en français.',
  de: 'Antworte NUR auf Deutsch. Alle generierten Texte müssen auf Deutsch sein.',
  it: 'Rispondi SOLO in italiano. Tutto il testo generato deve essere in italiano.',
  pt: 'Responde APENAS em português. Todo o texto gerado deve estar em português.',
};

export default function TripPlanner() {
  const { t, lang } = useLanguage();
  const [result, setResult] = useState(null);
  const [packedItems, setPackedItems] = useState([]);
  const [pendingTrip, setPendingTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDestination, setLoadingDestination] = useState('');
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();
  const { toast } = useFitMeToast();

  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-created_date'),
    initialData: [],
  });

  const handlePack = async ({ destination, dateFrom, dateTo, tripTypes, specialEvent }) => {
    setLoading(true);
    setLoadingDestination(destination);
    setResult(null);
    setPackedItems([]);
    setPendingTrip({ destination, dateFrom, dateTo, tripTypes, specialEvent });

    // STEP 1: Always fetch fresh wardrobe items from DB
    const wardrobeItems = await base44.entities.WardrobeItem.list();

    // STEP 2: Build prompt
    const itemLines = wardrobeItems
      .map((i) => `ID:${i.id} | ${i.name} | ${i.category} | ${i.color || '?'} | Worn ${i.times_worn || 0} times`)
      .join('\n');

    const langInstruction = languageInstructions[lang] || languageInstructions['en'];
    const prompt = `${langInstruction}

You are a travel stylist. The user is travelling to ${destination} from ${dateFrom} to ${dateTo}. Trip types: ${tripTypes.join(', ') || 'general'}. Special event: ${specialEvent || 'none'}.

Their wardrobe items:
${itemLines || 'No wardrobe items available'}

Return ONLY a valid JSON object with NO markdown, NO backticks, NO extra text:
{
  "tripName": "Creative trip name",
  "packingList": [
    {"itemId": "actual-id-from-above", "reason": "short reason", "wearOn": "Day 1 - sightseeing"}
  ],
  "missingItems": [
    {"name": "item name", "reason": "why needed", "estimatedPrice": "€20"}
  ],
  "packingTips": ["tip 1", "tip 2", "tip 3"]
}

Select 6-10 items appropriate for the destination, weather and trip type. Include variety: tops, bottoms or dress, shoes, bag, accessories.`;

    try {
      // STEP 3: Call Claude (no response_json_schema so we get a string to parse safely)
      const responseText = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        prompt,
      });

      // STEP 4: Parse response carefully
      const cleaned = (typeof responseText === 'string' ? responseText : JSON.stringify(responseText))
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      const parsed = JSON.parse(cleaned);

      // STEP 5: Map packingList itemIds to actual wardrobe items
      const matched = (parsed.packingList || [])
        .map((p) => {
          const w = wardrobeItems.find((w) => w.id === p.itemId);
          return w ? { ...w, reason: p.reason, wearOn: p.wearOn, checked: false } : null;
        })
        .filter(Boolean);

      setPackedItems(matched);
      setResult(parsed);
    } catch (e) {
      toast({ description: 'Could not generate packing list. Try again!' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!result || !pendingTrip) return;
    setSaving(true);
    await base44.entities.Trip.create({
      destination: pendingTrip.destination,
      date_from: pendingTrip.dateFrom,
      date_to: pendingTrip.dateTo,
      trip_types: pendingTrip.tripTypes,
      special_event: pendingTrip.specialEvent,
      trip_name: result.tripName,
      packing_list: result.packingList,
      missing_items: result.missingItems,
      packing_tips: result.packingTips,
    });
    qc.invalidateQueries({ queryKey: ['trips'] });
    setSaving(false);
    toast({ description: 'Trip saved to calendar! ✈️' });
    setResult(null);
    setPackedItems([]);
    setPendingTrip(null);
  };

  return (
    <div className="mt-8">
      {/* Section header */}
      <div className="px-5 mb-4">
        <p className="text-[11px] uppercase tracking-[0.1em] font-body font-medium mb-1" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>{t('styleTravel')}</p>
        <h2 className="text-[28px] leading-tight font-display font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>{t('planATrip')}</h2>
        <p className="text-sm font-body mt-1" style={{ color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}>{t('tripSubtitle')}</p>
      </div>

      <TripInputCard onPack={handlePack} loading={loading} />

      {/* Loading */}
      {loading && (
        <div className="mx-5 mt-4 bg-white p-8 text-center" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
          <div className="w-12 h-12 border-4 border-secondary border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="font-body font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>{t('packingFor')} {loadingDestination}…</p>
          <p className="text-xs font-body mt-1" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>{t('packingSubtitle')}</p>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <TripResult
              result={result}
              packedItems={packedItems}
              onSave={handleSaveTrip}
              saving={saving}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved trips */}
      <MyTrips trips={trips} />
    </div>
  );
}