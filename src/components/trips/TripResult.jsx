import React, { useState } from 'react';
import { Check, Save } from 'lucide-react';
import { CATEGORY_EMOJI } from '@/components/wardrobe/wearStatus';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n.jsx';

const resultsLabels = {
  en: { yourTrip: 'YOUR TRIP', packingList: '🧳 Your packing list', packed: 'packed', missingItems: '🛍 Consider buying', tips: '💡 Packing tips', saveTrip: 'Save trip to calendar ✈️', saving: 'Saving…', findInMarket: 'Find in Market →' },
  es: { yourTrip: 'TU VIAJE', packingList: '🧳 Tu lista de equipaje', packed: 'empaquetado(s)', missingItems: '🛍 Artículos que faltan', tips: '💡 Consejos prácticos', saveTrip: 'Guardar viaje en el calendario ✈️', saving: 'Guardando…', findInMarket: 'Buscar en el Mercado →' },
  fr: { yourTrip: 'VOTRE VOYAGE', packingList: '🧳 Votre liste de voyage', packed: 'emballé(s)', missingItems: '🛍 Articles manquants', tips: '💡 Conseils pratiques', saveTrip: 'Sauvegarder le voyage ✈️', saving: 'Sauvegarde…', findInMarket: 'Trouver au Marché →' },
  de: { yourTrip: 'DEINE REISE', packingList: '🧳 Deine Packliste', packed: 'gepackt', missingItems: '🛍 Fehlende Artikel', tips: '💡 Packtipps', saveTrip: 'Reise im Kalender speichern ✈️', saving: 'Speichern…', findInMarket: 'Im Markt finden →' },
  it: { yourTrip: 'IL TUO VIAGGIO', packingList: '🧳 La tua lista', packed: 'preparato/i', missingItems: '🛍 Articoli mancanti', tips: '💡 Consigli pratici', saveTrip: 'Salva viaggio nel calendario ✈️', saving: 'Salvataggio…', findInMarket: 'Trova nel Mercato →' },
  pt: { yourTrip: 'A TUA VIAGEM', packingList: '🧳 A tua lista de mala', packed: 'embalado(s)', missingItems: '🛍 Artigos em falta', tips: '💡 Dicas de embalagem', saveTrip: 'Guardar viagem no calendário ✈️', saving: 'A guardar…', findInMarket: 'Encontrar no Mercado →' },
};

function isRealUrl(str) {
  return str && (str.startsWith('http://') || str.startsWith('https://'));
}

export default function TripResult({ result, packedItems, onSave, saving }) {
  const { lang } = useLanguage();
  const tR = resultsLabels[lang] || resultsLabels['en'];
  const [checked, setChecked] = useState({});
  const navigate = useNavigate();

  const toggle = (id) => setChecked((p) => ({ ...p, [id]: !p[id] }));
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const total = packedItems.length;

  const goToMarket = (itemName) => {
    // Navigate to Sell page with market search param
    navigate('/sell?tab=market&search=' + encodeURIComponent(itemName));
  };

  return (
    <div className="mx-5 mt-4 space-y-4">
      {/* Trip name */}
      <div className="p-5" style={{ background: '#0F0F0F', borderRadius: '4px' }}>
        <p className="text-[11px] uppercase tracking-[0.1em] font-body font-medium mb-1" style={{ color: '#C9A96E', fontFamily: 'DM Sans, sans-serif' }}>
          {tR.yourTrip}
        </p>
        <p className="text-2xl font-display font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
          {result.tripName}
        </p>
      </div>

      {/* Packing list */}
      {packedItems.length > 0 && (
        <div className="bg-white p-4" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-bold text-base" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>
              {tR.packingList}
            </p>
            <p className="text-[11px] font-body font-medium" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
              {checkedCount}/{total} {tR.packed}
            </p>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1 mb-4 overflow-hidden" style={{ background: '#E8E6E1', borderRadius: '999px' }}>
            <div
              className="h-full transition-all"
              style={{ width: `${total ? (checkedCount / total) * 100 : 0}%`, background: '#0F0F0F', borderRadius: '999px' }}
            />
          </div>
          <div className="space-y-2">
            {packedItems.map((item, i) => {
              const emoji = item.emoji || CATEGORY_EMOJI[item.category] || '👗';
              const realPhoto = isRealUrl(item.photo_url) ? item.photo_url : null;
              const isChecked = checked[item.id];
              return (
                <button
                  key={item.id || i}
                  onClick={() => toggle(item.id)}
                  className="w-full flex items-center gap-3 p-3 text-left transition-all"
                  style={{
                    background: isChecked ? 'rgba(15,15,15,0.04)' : '#F5F4F1',
                    borderRadius: '2px',
                    border: '1px solid #E8E6E1',
                  }}
                >
                  <div className="w-9 h-9 overflow-hidden flex items-center justify-center text-xl shrink-0" style={{ background: '#fff', borderRadius: '2px', border: '1px solid #E8E6E1' }}>
                    {realPhoto ? (
                      <img src={realPhoto} alt={item.name} className="w-full h-full object-cover" />
                    ) : emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-sm" style={{ color: isChecked ? '#A8A8A8' : '#0F0F0F', textDecoration: isChecked ? 'line-through' : 'none', fontFamily: 'DM Sans, sans-serif' }}>
                      {item.name}
                    </p>
                    {item.reason && <p className="text-[11px] font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>{item.reason}</p>}
                  </div>
                  <div
                    className="w-5 h-5 flex items-center justify-center shrink-0 transition-all"
                    style={{
                      borderRadius: '2px',
                      border: isChecked ? '1px solid #0F0F0F' : '1px solid #D0D0D0',
                      background: isChecked ? '#0F0F0F' : 'transparent',
                    }}
                  >
                    {isChecked && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Missing items — Consider buying */}
      {result.missingItems?.length > 0 && (
        <div className="p-4" style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '4px' }}>
          <p className="font-display font-bold text-base mb-3" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>
            {tR.missingItems}
          </p>
          <div className="space-y-2">
            {result.missingItems.map((item, i) => (
              <div key={i} className="bg-white p-3 flex items-center gap-3" style={{ border: '1px solid #E8E6E1', borderRadius: '2px' }}>
                <div className="w-8 h-8 flex items-center justify-center text-lg shrink-0" style={{ background: '#F5F4F1', borderRadius: '2px' }}>
                  🛍
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-sm" style={{ color: '#0F0F0F', fontFamily: 'DM Sans, sans-serif' }}>{item.name}</p>
                  <p className="text-[11px] font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>{item.reason}</p>
                </div>
                <div className="text-right shrink-0">
                  {item.estimatedPrice && (
                    <p className="text-xs font-body font-semibold mb-1" style={{ color: '#0F0F0F', fontFamily: 'DM Sans, sans-serif' }}>{item.estimatedPrice}</p>
                  )}
                  <button
                    onClick={() => goToMarket(item.name)}
                    className="text-[11px] font-body font-semibold underline transition-opacity hover:opacity-70"
                    style={{ color: '#0F0F0F', fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {tR.findInMarket}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Packing tips */}
      {result.packingTips?.length > 0 && (
        <div className="p-4" style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '4px' }}>
          <p className="font-body font-semibold text-sm mb-2" style={{ color: '#0F0F0F', fontFamily: 'DM Sans, sans-serif' }}>{tR.tips}</p>
          <ul className="space-y-1">
            {result.packingTips.map((tip, i) => (
              <li key={i} className="text-sm font-body flex gap-2" style={{ color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}>
                <span>·</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Save button */}
      <button
        onClick={onSave}
        disabled={saving}
        className="w-full h-12 font-body font-semibold text-xs uppercase tracking-[0.06em] flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98]"
        style={{ background: '#0F0F0F', color: '#fff', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' }}
      >
        <Save className="w-4 h-4" />
        {saving ? tR.saving : tR.saveTrip}
      </button>
    </div>
  );
}