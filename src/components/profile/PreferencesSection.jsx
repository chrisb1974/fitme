import React from 'react';
import { useLanguage } from '@/lib/i18n.jsx';

function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="relative w-10 h-5 shrink-0 transition-all"
      style={{ background: on ? '#0F0F0F' : '#E8E6E1', borderRadius: '999px' }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
        style={{ left: on ? '1.25rem' : '0.125rem' }}
      />
    </button>
  );
}

export default function PreferencesSection({ prefs, reminderTime, onToggle, onReminderTime }) {
  const { t } = useLanguage();

  const rows = [
    { key: 'weatherSuggestions', label: t('weatherSuggestions'), sub: t('weatherSuggestionsSub') },
    { key: 'dailyReminder', label: t('dailyReminder'), sub: t('dailyReminderSub') },
    { key: 'rotationReminders', label: t('rotationReminders'), sub: t('rotationRemindersSub') },
    { key: 'shareStyleData', label: t('shareStyleData'), sub: t('shareStyleDataSub') },
  ];

  return (
    <div className="px-5 mb-4">
      <p className="text-[11px] uppercase tracking-[0.08em] font-body font-medium mb-3" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
        {t('preferences')}
      </p>
      <div className="bg-white" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
        {rows.map((row, i) => (
          <div key={row.key} style={{ borderBottom: i < rows.length - 1 ? '1px solid #E8E6E1' : 'none' }}>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-medium" style={{ fontFamily: 'DM Sans, sans-serif', color: '#0F0F0F' }}>{row.label}</p>
                <p className="text-xs font-body mt-0.5" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>{row.sub}</p>
              </div>
              <Toggle on={!!prefs[row.key]} onToggle={() => onToggle(row.key)} />
            </div>
            {row.key === 'dailyReminder' && prefs.dailyReminder && (
              <div className="px-4 pb-3 flex items-center gap-2">
                <span className="text-xs font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>{t('reminderTime')}</span>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => onReminderTime(e.target.value)}
                  className="h-8 px-3 text-sm font-body outline-none"
                  style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}