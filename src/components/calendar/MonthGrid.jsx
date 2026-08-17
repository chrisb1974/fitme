import React from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function MonthGrid({ month, onPrev, onNext, selected, onSelect, logs, trips }) {
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const firstDay = (getDay(startOfMonth(month)) + 6) % 7;

  return (
    <div className="mx-5 mt-4 bg-white p-4" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onPrev}
          className="w-8 h-8 flex items-center justify-center"
          style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px' }}
        >
          <ChevronLeft className="w-4 h-4" style={{ color: '#6B6B6B' }} />
        </button>
        <p className="font-display font-semibold text-base" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>
          {format(month, 'MMMM yyyy')}
        </p>
        <button
          onClick={onNext}
          className="w-8 h-8 flex items-center justify-center"
          style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px' }}
        >
          <ChevronRight className="w-4 h-4" style={{ color: '#6B6B6B' }} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[9px] uppercase tracking-[0.08em] font-body font-medium py-1" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {days.map((day) => {
          const isSel = isSameDay(day, selected);
          const isToday = isSameDay(day, new Date());
          const log = logs.find((l) => isSameDay(new Date(l.date), day));
          const hasTrip = trips.some((t) => {
            const from = new Date(t.date_from);
            const to = new Date(t.date_to);
            return day >= from && day <= to;
          });
          const emoji = log?.item_snapshots?.[0]?.emoji || (log ? '👗' : null);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelect(day)}
              className="aspect-square flex flex-col items-center justify-center transition-all relative"
              style={{
                borderRadius: '2px',
                background: isSel ? '#0F0F0F' : isToday ? '#F5F4F1' : 'transparent',
              }}
            >
              <span
                className="text-sm font-body leading-none"
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: isToday || isSel ? 600 : 400,
                  color: isSel ? '#fff' : isToday ? '#0F0F0F' : '#0F0F0F',
                }}
              >
                {format(day, 'd')}
              </span>
              {log && (
                <span className="text-[9px] leading-none mt-0.5">{emoji}</span>
              )}
              {log && !isSel && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: '#C9A96E' }}
                />
              )}
              {hasTrip && (
                <span className="absolute top-0.5 right-0.5 text-[8px] leading-none">✈️</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}