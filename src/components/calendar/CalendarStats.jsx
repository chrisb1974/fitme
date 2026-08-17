import React from 'react';
import { format, differenceInCalendarDays, parseISO } from 'date-fns';

function getStreak(logs) {
  if (!logs.length) return 0;
  const sorted = [...logs].map((l) => l.date).sort().reverse();
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (const dateStr of sorted) {
    const d = parseISO(dateStr);
    d.setHours(0, 0, 0, 0);
    const diff = differenceInCalendarDays(cursor, d);
    if (diff === 0 || diff === 1) { streak++; cursor = d; } else { break; }
  }
  return streak;
}

function getMostWornItem(logs) {
  const counts = {};
  logs.forEach((log) => {
    (log.item_snapshots || []).forEach((s) => {
      if (!s.name) return;
      counts[s.name] = (counts[s.name] || 0) + 1;
    });
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : null;
}

export default function CalendarStats({ logs, month }) {
  const monthLogs = logs.filter((l) => {
    const d = new Date(l.date);
    return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
  });

  const streak = getStreak(logs);
  const outfitCount = monthLogs.length;
  const mostWorn = getMostWornItem(monthLogs);
  const uniqueLooks = new Set(monthLogs.map((l) => l.outfit_name || JSON.stringify(l.item_ids))).size;

  const stats = [
    { label: 'Streak', value: `${streak}d` },
    { label: 'Logged', value: outfitCount },
    { label: 'Top item', value: mostWorn ? mostWorn.split(' ')[0] : '—' },
    { label: 'Looks', value: uniqueLooks },
  ];

  return (
    <div className="mx-5 mt-4">
      <p className="text-[11px] uppercase tracking-[0.08em] font-body font-medium mb-3" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
        {format(month, 'MMMM')} stats
      </p>
      <div className="grid grid-cols-4 gap-0 bg-white overflow-hidden" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="py-4 flex flex-col items-center"
            style={{ borderRight: i < stats.length - 1 ? '1px solid #E8E6E1' : 'none' }}
          >
            <p className="font-display font-bold" style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: '#0F0F0F', lineHeight: 1 }}>{s.value}</p>
            <p className="text-[9px] font-body mt-1" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}