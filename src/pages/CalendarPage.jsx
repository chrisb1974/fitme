import React, { useState } from 'react';
import { addMonths, subMonths, isSameDay } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useFitMeToast } from '@/components/ui/FitMeToaster';
import WeekStrip from '@/components/calendar/WeekStrip';
import MonthGrid from '@/components/calendar/MonthGrid';
import CalendarStats from '@/components/calendar/CalendarStats';
import DayDetailPanel from '@/components/calendar/DayDetailPanel';
import LogOutfitModal from '@/components/calendar/LogOutfitModal';
import FavouriteLooksGallery from '@/components/calendar/FavouriteLooksGallery';

export default function CalendarPage() {
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const [showLog, setShowLog] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const qc = useQueryClient();
  const { toast } = useFitMeToast();

  const { data: logs = [] } = useQuery({
    queryKey: ['outfit-logs'],
    queryFn: () => base44.entities.OutfitLog.list('-date'),
    initialData: [],
  });

  const { data: wardrobeItems = [] } = useQuery({
    queryKey: ['wardrobe'],
    queryFn: () => base44.entities.WardrobeItem.list(),
    initialData: [],
  });

  const { data: savedLooks = [] } = useQuery({
    queryKey: ['saved-looks'],
    queryFn: () => base44.entities.SavedLook.list('-date_saved'),
    initialData: [],
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-created_date'),
    initialData: [],
  });

  const selectedLog = logs.find((l) => isSameDay(new Date(l.date), selected));

  const handleDaySelect = (day) => {
    setSelected(day);
    setShowDetail(true);
  };

  const handleSaved = () => {
    qc.invalidateQueries({ queryKey: ['outfit-logs'] });
    qc.invalidateQueries({ queryKey: ['wardrobe'] });
    setShowLog(false);
    toast({ description: 'Outfit logged! 👗' });
  };

  return (
    <div className="pb-28 relative">
      {/* Header */}
      <div className="px-5 pt-10 pb-2">
        <p className="text-[11px] uppercase tracking-[0.1em] font-body font-medium mb-1" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>Diary</p>
        <h1 className="text-[28px] leading-tight font-display font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>Outfit Calendar</h1>
        <p className="text-sm font-body mt-1" style={{ color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}>Your daily style diary</p>
      </div>

      {/* Week strip */}
      <WeekStrip selected={selected} onSelect={handleDaySelect} logs={logs} />

      {/* Month grid */}
      <MonthGrid
        month={month}
        onPrev={() => setMonth(subMonths(month, 1))}
        onNext={() => setMonth(addMonths(month, 1))}
        selected={selected}
        onSelect={handleDaySelect}
        logs={logs}
        trips={trips}
      />

      {/* Stats */}
      <CalendarStats logs={logs} month={month} />

      {/* Favourite looks gallery */}
      <FavouriteLooksGallery looks={savedLooks} />

      {/* FAB — Log today's outfit */}
      <button
        onClick={() => setShowLog(true)}
        className="fixed bottom-28 right-5 z-30 h-12 px-5 flex items-center gap-2 text-white text-xs font-body uppercase tracking-[0.06em] font-semibold"
        style={{ background: '#0F0F0F', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' }}
      >
        <Plus className="w-4 h-4" strokeWidth={2.2} />
        Log today
      </button>

      {/* Day detail panel */}
      <AnimatePresence>
        {showDetail && (
          <DayDetailPanel
            day={selected}
            log={selectedLog}
            onClose={() => setShowDetail(false)}
            onLogOutfit={() => { setShowDetail(false); setShowLog(true); }}
          />
        )}
      </AnimatePresence>

      {/* Log outfit modal */}
      <AnimatePresence>
        {showLog && (
          <>
            <LogOutfitModal
              wardrobeItems={wardrobeItems}
              savedLooks={savedLooks}
              day={selected}
              onClose={() => setShowLog(false)}
              onSaved={handleSaved}
            />
            <div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowLog(false)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}