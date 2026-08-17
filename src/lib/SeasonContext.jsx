import React, { createContext, useContext, useState } from 'react';

export const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];

export const SEASON_EMOJI = {
  Spring: '🌸',
  Summer: '☀️',
  Autumn: '🍂',
  Winter: '❄️',
};

function getCurrentSeason() {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Autumn';
  return 'Winter';
}

function getInitialSeason() {
  try {
    const stored = localStorage.getItem('fitme_active_season');
    if (stored && SEASONS.includes(stored)) return stored;
  } catch {}
  return getCurrentSeason();
}

const SeasonContext = createContext(null);

export function SeasonProvider({ children }) {
  const [activeSeason, setActiveSeason] = useState(getInitialSeason);

  const setSeason = (season) => {
    setActiveSeason(season);
    try { localStorage.setItem('fitme_active_season', season); } catch {}
  };

  return (
    <SeasonContext.Provider value={{ activeSeason, setSeason }}>
      {children}
    </SeasonContext.Provider>
  );
}

export function useSeason() {
  const ctx = useContext(SeasonContext);
  if (!ctx) throw new Error('useSeason must be used within SeasonProvider');
  return ctx;
}

// Returns true if an item is compatible with the given season
export function itemMatchesSeason(item, season) {
  if (!item.season || item.season.length === 0) return true; // no season = all seasons
  return item.season.includes(season);
}