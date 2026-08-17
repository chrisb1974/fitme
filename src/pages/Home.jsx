import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Loader2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getWearStatus } from '@/components/wardrobe/wearStatus';
import { useSeason, SEASON_EMOJI } from '@/lib/SeasonContext.jsx';
import { SeasonSelectorBar } from '@/components/shared/SeasonChips.jsx';
import { useLanguage } from '@/lib/i18n.jsx';
import { CATEGORY_EMOJI } from '@/components/wardrobe/wearStatus';
import MyOutfitsSection from '@/components/outfits/MyOutfitsSection';
import OutfitBuilder from '@/components/outfits/OutfitBuilder';
import OutfitDetailSheet from '@/components/outfits/OutfitDetailSheet';

const WMO_DESCRIPTIONS = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  80: 'Rain showers', 81: 'Rain showers', 82: 'Heavy showers',
  95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm',
};

function WeatherIcon({ code, className }) {
  if (code >= 71 && code <= 77) return <CloudSnow className={className} style={{ color: '#C9A96E' }} />;
  if (code >= 51 && code <= 82) return <CloudRain className={className} style={{ color: '#C9A96E' }} />;
  if (code === 95 || code === 96 || code === 99) return <Wind className={className} style={{ color: '#C9A96E' }} />;
  if (code >= 2) return <Cloud className={className} style={{ color: '#C9A96E' }} />;
  return <Sun className={className} style={{ color: '#C9A96E' }} />;
}

async function fetchWeatherByCoords(latitude, longitude) {
  const [geoRes, wxRes] = await Promise.all([
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`),
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&temperature_unit=celsius`),
  ]);
  const geoData = await geoRes.json();
  const wxData = await wxRes.json();
  const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.county || '';
  const temp = Math.round(wxData.current?.temperature_2m ?? 0);
  const code = wxData.current?.weathercode ?? 0;
  return { city, temp, code, desc: WMO_DESCRIPTIONS[code] || 'Clear' };
}

function useWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (navigator.geolocation) {
        try {
          const coords = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 6000 })
          );
          const w = await fetchWeatherByCoords(coords.coords.latitude, coords.coords.longitude);
          setWeather(w);
          setLoading(false);
          return;
        } catch {
          // fall through to IP-based
        }
      }
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();
        if (ipData.latitude && ipData.longitude) {
          const w = await fetchWeatherByCoords(ipData.latitude, ipData.longitude);
          setWeather({ ...w, city: ipData.city || w.city });
          setLoading(false);
          return;
        }
      } catch {
        // ignore
      }
      setLoading(false);
    }
    load();
  }, []);

  return { weather, loading };
}

const OCCASION_KEYS = [
  { key: 'uni',    emoji: '🎓', styleTags: ['casual', 'minimal', 'streetwear'] },
  { key: 'dinner', emoji: '🍝', styleTags: ['chic', 'elegant', 'classic'] },
  { key: 'club',   emoji: '💃', styleTags: ['edgy', 'statement', 'bold'] },
  { key: 'date',   emoji: '💌', styleTags: ['romantic', 'chic', 'feminine'] },
  { key: 'sport',  emoji: '🏃‍♀️', styleTags: ['sporty', 'athletic', 'casual'] },
  { key: 'travel', emoji: '✈️', styleTags: ['casual', 'comfortable', 'minimal'] },
];

function isRealUrl(str) {
  return str && (str.startsWith('http://') || str.startsWith('https://'));
}

export default function Home() {
  const { activeSeason, setSeason } = useSeason();
  const { weather, loading: weatherLoading } = useWeather();
  const { t, lang } = useLanguage();

  // Bug 1 fix: selectedOccasion as state
  const [selectedOccasionKey, setSelectedOccasionKey] = useState('uni');
  const [suggestion, setSuggestion] = useState(null);
  const [showFitModal, setShowFitModal] = useState(false);

  // My Outfits state
  const [showOutfitBuilder, setShowOutfitBuilder] = useState(false);
  const [editOutfit, setEditOutfit] = useState(null);
  const [initialItem, setInitialItem] = useState(null);
  const [viewOutfit, setViewOutfit] = useState(null);
  const [myOutfits, setMyOutfits] = useState([]);
  const [allItems, setAllItems] = useState([]);

  useEffect(() => {
    base44.entities.WardrobeItem.list().then(setAllItems).catch(() => {});
    base44.entities.SavedLook.list().then(all => {
      setMyOutfits(all.filter(o => o.is_manual === true));
    }).catch(() => {});
  }, []);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me().catch(() => null),
  });
  const { data: items = [] } = useQuery({
    queryKey: ['wardrobe'],
    queryFn: () => base44.entities.WardrobeItem.list(),
    initialData: [],
  });

  const unworn = items.filter((i) => getWearStatus(i.last_worn_date).color === 'red').length;
  const initials = (user?.full_name || 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  // Bug 2 fix: recompute suggestion when season or occasion changes
  useEffect(() => {
    if (!items.length) {
      setSuggestion(null);
      return;
    }

    const seasonalItems = items.filter((item) =>
      !item.season ||
      (Array.isArray(item.season)
        ? item.season.length === 0 || item.season.includes(activeSeason)
        : item.season === activeSeason || item.season === 'All Season')
    );

    const occasionData = OCCASION_KEYS.find((o) => o.key === selectedOccasionKey) || OCCASION_KEYS[0];
    const targetTags = occasionData.styleTags;

    const score = (item) =>
      (item.style_tags || []).filter((tag) => targetTags.some((t) => tag.toLowerCase().includes(t))).length;

    const tops     = seasonalItems.filter((i) => i.category === 'Tops');
    const bottoms  = seasonalItems.filter((i) => i.category === 'Bottoms' || i.category === 'Dresses');
    const shoes    = seasonalItems.filter((i) => i.category === 'Shoes');

    const top    = [...tops].sort((a, b) => score(b) - score(a))[0];
    const bottom = [...bottoms].sort((a, b) => score(b) - score(a))[0];
    const shoe   = [...shoes].sort((a, b) => score(b) - score(a))[0];

    const outfitItems = [top, bottom, shoe].filter(Boolean);

    if (outfitItems.length > 0) {
      setSuggestion({
        title: `${activeSeason} · ${t(selectedOccasionKey)}`,
        items: outfitItems,
      });
    } else {
      setSuggestion(null);
    }
  }, [activeSeason, selectedOccasionKey, items]);

  return (
    <div className="pb-4 bg-background">
      {/* Header */}
      <div className="px-5 pt-10 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] font-body font-medium" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
            FitMe
          </p>
          <h1 className="text-[28px] leading-tight font-display font-bold mt-0.5" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>
            Hey, {user?.full_name?.split(' ')[0] || 'there'}
          </h1>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-body"
          style={{ background: '#0F0F0F', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}
        >
          {initials}
        </div>
      </div>

      {/* Weather strip */}
      <div
        className="mx-5 mt-5 px-4 py-3 flex items-center gap-3"
        style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '4px' }}
      >
        <div className="w-7 h-7 bg-white flex items-center justify-center shrink-0" style={{ border: '1px solid #E8E6E1', borderRadius: '2px' }}>
          {weatherLoading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#C9A96E' }} />
            : weather
              ? <WeatherIcon code={weather.code} className="w-3.5 h-3.5" />
              : <Sun className="w-3.5 h-3.5" style={{ color: '#C9A96E' }} />
          }
        </div>
        <p className="text-sm font-body" style={{ fontFamily: 'DM Sans, sans-serif', color: '#0F0F0F', fontWeight: 400 }}>
          {weatherLoading
            ? t('weatherLoading')
            : weather
              ? `${weather.temp}°C · ${weather.city} · ${weather.desc}`
              : t('weatherUnavailable')
          }
        </p>
      </div>

      {/* Season selector */}
      <div className="mx-5 mt-4">
        <p className="text-[11px] uppercase tracking-[0.08em] font-body font-medium mb-2" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
          {t('season')}
        </p>
        <SeasonSelectorBar active={activeSeason} onChange={setSeason} />
      </div>

      {/* Bug 1 fix: Occasion chips with selectedOccasionKey state */}
      <div className="mt-7">
        <p className="px-5 text-[11px] uppercase tracking-[0.08em] font-body font-medium mb-3" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
          {t('occasion')}
        </p>
        <div className="px-5 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 w-max pb-1">
            {OCCASION_KEYS.map((o) => {
              const isActive = selectedOccasionKey === o.key;
              return (
                <button
                  key={o.key}
                  onClick={() => setSelectedOccasionKey(o.key)}
                  className="px-4 py-2.5 flex items-center gap-2 active:scale-95 transition-transform font-body"
                  style={{
                    background: isActive ? '#0F0F0F' : '#F5F4F1',
                    border: `1px solid ${isActive ? '#0F0F0F' : '#E8E6E1'}`,
                    borderRadius: '2px',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: isActive ? '#fff' : '#6B6B6B',
                    cursor: 'pointer',
                  }}
                >
                  <span className="text-base">{o.emoji}</span>
                  <span>{t(o.key)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bug 2 + 3 fix: Dynamic suggestion card */}
      <div
        className="mx-5 mt-7"
        style={{ background: '#0F0F0F', borderRadius: '4px', padding: '24px' }}
      >
        <p className="text-[11px] uppercase tracking-[0.12em] font-body font-medium mb-2" style={{ color: '#C9A96E', fontFamily: 'DM Sans, sans-serif' }}>
          {SEASON_EMOJI[activeSeason]} {suggestion ? suggestion.title : `${t(activeSeason.toLowerCase() + 'Look')}`}
        </p>

        {suggestion ? (
          <>
            <h2 className="text-[20px] leading-tight text-white font-display" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
              {suggestion.items.map((i) => i.name).join(' · ')}
            </h2>
            <div className="flex gap-2 mt-5">
              {suggestion.items.map((item) => {
                const realPhoto = isRealUrl(item.photo_url) ? item.photo_url : null;
                const emoji = item.emoji || CATEGORY_EMOJI[item.category] || '✨';
                return (
                  <div
                    key={item.id}
                    className="flex-1 aspect-square flex items-center justify-center text-2xl overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}
                  >
                    {realPhoto
                      ? <img src={realPhoto} alt={item.name} className="w-full h-full object-cover" />
                      : emoji}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-[22px] leading-tight text-white font-display" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
              {t('effortlessCampusDay')}
            </h2>
            <p className="text-sm mt-1.5 font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif', fontWeight: 400 }}>
              {t('campusDayDesc')}
            </p>
            <div className="flex gap-2 mt-5">
              {['👚', '👖', '👟'].map((e, i) => (
                <div
                  key={i}
                  className="flex-1 aspect-square flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}
                >
                  {e}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Bug 3 fix: "See the full fit" opens modal */}
        <button
          onClick={() => suggestion && setShowFitModal(true)}
          className="mt-5 font-body text-xs uppercase tracking-[0.06em] font-semibold"
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '2px',
            color: suggestion ? '#fff' : 'rgba(255,255,255,0.4)',
            padding: '10px 20px',
            fontFamily: 'DM Sans, sans-serif',
            cursor: suggestion ? 'pointer' : 'default',
          }}
        >
          {t('seeFullFit')} →
        </button>
      </div>

      {/* My Outfits */}
      <div className="mt-7">
        <MyOutfitsSection
          myOutfits={myOutfits}
          onCreateOutfit={() => { setEditOutfit(null); setInitialItem(null); setShowOutfitBuilder(true); }}
          onViewOutfit={setViewOutfit}
          lang={lang}
        />
      </div>

      {/* Stats */}
      <div className="mx-5 mt-5 grid grid-cols-3 gap-2">
        {[
          { label: t('items'), value: items.length },
          { label: t('unworn'), value: unworn, gold: true },
          { label: t('style'), value: 'Effortless', small: true },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 bg-white"
            style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}
          >
            <p className="text-[10px] uppercase tracking-[0.08em] font-body font-medium mb-1.5" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
              {s.label}
            </p>
            <p
              className="font-display leading-none"
              style={{
                fontFamily: 'Playfair Display, serif',
                fontWeight: 700,
                fontSize: s.small ? '13px' : '22px',
                color: s.gold ? '#C9A96E' : '#0F0F0F',
              }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Outfit Builder */}
      {showOutfitBuilder && (
        <OutfitBuilder
          initialItem={initialItem}
          editOutfit={editOutfit}
          allItems={allItems}
          lang={lang}
          onSave={() => {
            setShowOutfitBuilder(false);
            setEditOutfit(null);
            setInitialItem(null);
            base44.entities.SavedLook.list().then(all => setMyOutfits(all.filter(o => o.is_manual === true))).catch(() => {});
          }}
          onClose={() => { setShowOutfitBuilder(false); setEditOutfit(null); setInitialItem(null); }}
        />
      )}

      {/* Outfit Detail Sheet */}
      {viewOutfit && (
        <OutfitDetailSheet
          outfit={viewOutfit}
          onClose={() => setViewOutfit(null)}
          onEdit={() => { setEditOutfit(viewOutfit); setViewOutfit(null); setShowOutfitBuilder(true); }}
          onDelete={(id) => setMyOutfits(prev => prev.filter(o => o.id !== id))}
          lang={lang}
        />
      )}

      {/* Full-fit modal */}
      {showFitModal && suggestion && (
        <div
          className="fixed inset-0 z-[200] flex items-end"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setShowFitModal(false)}
        >
          <div
            className="w-full bg-white p-7"
            style={{ borderRadius: '16px 16px 0 0' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-xl" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>
                {suggestion.title}
              </h3>
              <button onClick={() => setShowFitModal(false)} style={{ color: '#A8A8A8' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-3 flex-wrap">
              {suggestion.items.map((item) => {
                const realPhoto = isRealUrl(item.photo_url) ? item.photo_url : null;
                const emoji = item.emoji || CATEGORY_EMOJI[item.category] || '✨';
                return (
                  <div key={item.id} className="flex flex-col items-center" style={{ width: 90 }}>
                    <div
                      className="w-[90px] h-[90px] flex items-center justify-center text-4xl overflow-hidden"
                      style={{ background: '#F5F4F1', borderRadius: '8px' }}
                    >
                      {realPhoto
                        ? <img src={realPhoto} alt={item.name} className="w-full h-full object-cover" style={{ borderRadius: '8px' }} />
                        : emoji}
                    </div>
                    <p className="text-[11px] font-body font-semibold mt-2 text-center leading-tight" style={{ color: '#0F0F0F', fontFamily: 'DM Sans, sans-serif' }}>
                      {item.name}
                    </p>
                    <p className="text-[10px] font-body mt-0.5" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
                      {item.category}
                    </p>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setShowFitModal(false)}
              className="w-full mt-6 py-4 font-body font-semibold text-sm uppercase tracking-[0.06em]"
              style={{ background: '#0F0F0F', color: '#fff', borderRadius: '4px', fontFamily: 'DM Sans, sans-serif' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}