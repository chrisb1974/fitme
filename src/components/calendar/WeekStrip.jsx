import React from 'react';
import { startOfWeek, addDays, format, isSameDay } from 'date-fns';

export default function WeekStrip({ selected, onSelect, logs }) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="mx-5 mt-5 bg-white rounded-[24px] soft-shadow p-3">
      <div className="flex gap-1">
        {days.map((day) => {
          const isSelected = isSameDay(day, selected);
          const isToday = isSameDay(day, new Date());
          const log = logs.find((l) => isSameDay(new Date(l.date), day));
          const emoji = log?.item_snapshots?.[0]?.emoji || (log ? '👗' : null);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelect(day)}
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all"
              style={isSelected ? { background: '#FF6B47' } : isToday ? { background: 'rgba(255,107,71,0.1)' } : {}}
            >
              <span
                className="text-[10px] font-bold uppercase"
                style={{ color: isSelected ? 'rgba(255,255,255,0.75)' : 'hsl(var(--muted-foreground))' }}
              >
                {format(day, 'EEEEE')}
              </span>
              <span
                className="text-sm font-extrabold leading-none"
                style={{ color: isSelected ? '#fff' : isToday ? '#FF6B47' : 'hsl(var(--foreground))' }}
              >
                {format(day, 'd')}
              </span>
              <span className="text-[11px] h-4 leading-none">
                {emoji || '·'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}