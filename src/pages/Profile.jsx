import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import ProfileHeader from '@/components/profile/ProfileHeader';
import StyleDNACard from '@/components/profile/StyleDNACard';
import WardrobeStatsGrid from '@/components/profile/WardrobeStatsGrid';
import ActivityStatsRow from '@/components/profile/ActivityStatsRow';
import PreferencesSection from '@/components/profile/PreferencesSection';
import LanguageSelector from '@/components/profile/LanguageSelector';
import SustainabilityScore from '@/components/profile/SustainabilityScore';
import AccountSection from '@/components/profile/AccountSection';


const DEFAULT_PREFS = {
  language: 'en',
  weatherSuggestions: true,
  dailyReminder: false,
  reminderTime: '08:00',
  rotationReminders: true,
  shareStyleData: false,
};

export default function Profile() {
  const { setLang, t } = useLanguage();
  const [user, setUser] = useState(null);
  const [settingsId, setSettingsId] = useState(null);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [savedLabel, setSavedLabel] = useState(false);

  // Load user and settings on mount
  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.entities.UserSettings.filter({ created_by: undefined }, '-created_date', 1)
      .then((rows) => {
        // filter by current user via created_by
        return base44.entities.UserSettings.list('-created_date', 1);
      })
      .then((rows) => {
        if (rows && rows.length > 0) {
          const s = rows[0];
          setSettingsId(s.id);
          setPrefs({
            language: s.language ?? DEFAULT_PREFS.language,
            weatherSuggestions: s.weatherSuggestions ?? DEFAULT_PREFS.weatherSuggestions,
            dailyReminder: s.dailyReminder ?? DEFAULT_PREFS.dailyReminder,
            reminderTime: s.reminderTime ?? DEFAULT_PREFS.reminderTime,
            rotationReminders: s.rotationReminders ?? DEFAULT_PREFS.rotationReminders,
            shareStyleData: s.shareStyleData ?? DEFAULT_PREFS.shareStyleData,
          });
        }
      })
      .catch(() => {});
  }, []);

  const showSaved = () => {
    setSavedLabel(true);
    setTimeout(() => setSavedLabel(false), 1500);
  };

  const saveSettings = useCallback(async (newPrefs) => {
    try {
      if (settingsId) {
        await base44.entities.UserSettings.update(settingsId, newPrefs);
      } else {
        const created = await base44.entities.UserSettings.create(newPrefs);
        setSettingsId(created.id);
      }
      showSaved();
    } catch {}
  }, [settingsId]);

  const handleToggle = (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    saveSettings(updated);
  };

  const handleReminderTime = (time) => {
    const updated = { ...prefs, reminderTime: time };
    setPrefs(updated);
    saveSettings(updated);
  };

  const handleLanguage = (code) => {
    const updated = { ...prefs, language: code };
    setPrefs(updated);
    setLang(code);
    saveSettings(updated);
  };

  const { data: wardrobeItems = [] } = useQuery({
    queryKey: ['wardrobe'],
    queryFn: () => base44.entities.WardrobeItem.list(),
    initialData: [],
  });

  const { data: outfitLogs = [] } = useQuery({
    queryKey: ['outfit-logs'],
    queryFn: () => base44.entities.OutfitLog.list(),
    initialData: [],
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list(),
    initialData: [],
  });

  const { data: savedLooks = [] } = useQuery({
    queryKey: ['saved-looks'],
    queryFn: () => base44.entities.SavedLook.list(),
    initialData: [],
  });

  const unwornCount = wardrobeItems.filter((i) => {
    if (!i.last_worn_date) return true;
    const days = Math.floor((Date.now() - new Date(i.last_worn_date)) / 86400000);
    return days > 30;
  }).length;

  const mostWorn = wardrobeItems.reduce((best, i) =>
    (i.times_worn || 0) > (best?.times_worn || 0) ? i : best, null);

  const favouritesCount = savedLooks.filter((l) => l.is_favourite).length;

  const logDates = [...new Set(outfitLogs.map((l) => l.date))].sort().reverse();
  let streak = 0;
  let checkDate = new Date();
  for (const d of logDates) {
    const check = checkDate.toISOString().slice(0, 10);
    if (d === check) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else break;
  }

  const stats = {
    totalItems: wardrobeItems.length,
    unwornCount,
    mostWorn,
    favouritesCount,
    streak,
    outfitsLogged: outfitLogs.length,
    tripsPlanned: trips.length,
    looksGenerated: savedLooks.length,
  };

  return (
    <div className="pb-10">
      <ProfileHeader user={user} onProfileUpdated={showSaved} />
      <StyleDNACard wardrobeItems={wardrobeItems} />
      <WardrobeStatsGrid stats={stats} />
      <ActivityStatsRow stats={stats} />

      <PreferencesSection
        prefs={prefs}
        reminderTime={prefs.reminderTime}
        onToggle={handleToggle}
        onReminderTime={handleReminderTime}
      />
      <LanguageSelector active={prefs.language} onChange={handleLanguage} />

      {/* Saved confirmation */}
      <div
        className="px-5 mb-2 text-center text-xs font-body transition-opacity duration-500"
        style={{
          color: '#A8A8A8',
          fontFamily: 'DM Sans, sans-serif',
          opacity: savedLabel ? 1 : 0,
          pointerEvents: 'none',
          height: '16px',
        }}
      >
        {t('saved')}
      </div>

      <SustainabilityScore wardrobeItems={wardrobeItems} outfitLogs={outfitLogs} />
      <AccountSection user={user} />
    </div>
  );
}