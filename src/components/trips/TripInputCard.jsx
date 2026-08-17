import React, { useState } from 'react';
import { Plane } from 'lucide-react';
import { useLanguage } from '@/lib/i18n.jsx';

const TRIP_TYPE_KEYS = [
  { id: 'Sightseeing',          tKey: 'tripTypeSightseeing' },
  { id: 'Dining out',           tKey: 'tripTypeDining' },
  { id: 'Business',             tKey: 'tripTypeBusiness' },
  { id: 'Nightlife',            tKey: 'tripTypeNightlife' },
  { id: 'Beach',                tKey: 'tripTypeBeach' },
  { id: 'Winter sport',         tKey: 'tripTypeWinterSport' },
  { id: 'University exchange',  tKey: 'tripTypeUniversity' },
];

export default function TripInputCard({ onPack, loading }) {
  const { t } = useLanguage();
  const [destination, setDestination] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [tripTypes, setTripTypes] = useState([]);
  const [specialEvent, setSpecialEvent] = useState('');

  const toggleType = (id) => {
    setTripTypes((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleSubmit = () => {
    if (!destination || !dateFrom || !dateTo) return;
    onPack({ destination, dateFrom, dateTo, tripTypes, specialEvent });
  };

  const labelStyle = {
    fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
    fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: '#A8A8A8',
  };
  const inputStyle = {
    background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px',
    fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: '#0F0F0F', height: '44px',
  };

  return (
    <div className="mx-5 space-y-4" style={{ background: '#fff', border: '1px solid #E8E6E1', borderRadius: '4px', padding: '20px' }}>
      {/* Destination */}
      <div>
        <p style={labelStyle} className="mb-1.5">{t('destination')}</p>
        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder={t('destinationPlaceholder')}
          className="w-full px-3 outline-none font-body"
          style={inputStyle}
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p style={labelStyle} className="mb-1.5">{t('dateFrom')}</p>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 outline-none font-body"
            style={inputStyle}
          />
        </div>
        <div>
          <p style={labelStyle} className="mb-1.5">{t('dateTo')}</p>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 outline-none font-body"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Trip types */}
      <div>
        <p style={labelStyle} className="mb-2">{t('tripType')}</p>
        <div className="flex flex-wrap gap-2">
          {TRIP_TYPE_KEYS.map((type) => {
            const active = tripTypes.includes(type.id);
            return (
              <button
                key={type.id}
                onClick={() => toggleType(type.id)}
                className="px-3 py-1.5 text-xs font-body font-medium transition-all"
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  borderRadius: '2px',
                  border: active ? '1px solid #0F0F0F' : '1px solid #E8E6E1',
                  background: active ? '#0F0F0F' : '#F5F4F1',
                  color: active ? '#fff' : '#6B6B6B',
                }}
              >
                {t(type.tKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Special event */}
      <div>
        <p style={labelStyle} className="mb-1.5">{t('specialEvent')}</p>
        <input
          value={specialEvent}
          onChange={(e) => setSpecialEvent(e.target.value)}
          placeholder={t('specialEventPlaceholder')}
          className="w-full px-3 outline-none font-body"
          style={inputStyle}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!destination || !dateFrom || !dateTo || loading}
        className="w-full h-12 font-body font-semibold text-xs uppercase tracking-[0.06em] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
        style={{ background: '#0F0F0F', color: '#fff', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' }}
      >
        <Plane className="w-4 h-4" />
        {loading ? t('packing') : t('packMyBag')}
      </button>
    </div>
  );
}