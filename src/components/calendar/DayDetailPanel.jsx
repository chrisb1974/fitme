import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { X, Share2 } from 'lucide-react';

function QRModal({ log, onClose }) {
  const dateStr = format(new Date(log.date), 'yyyy-MM-dd');
  const outfitName = encodeURIComponent((log.outfit_name || 'my-look').replace(/\s+/g, '-'));
  const qrData = `fitme-look-${dateStr}-${outfitName}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="relative w-full max-w-sm mx-auto bg-white rounded-t-[32px] p-6 pb-10 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-extrabold text-lg mb-1">Share your look 💕</p>
        <p className="text-sm text-muted-foreground mb-5">Share this QR with friends so they can like your look!</p>
        <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden soft-shadow">
          <img src={qrUrl} alt="QR Code" className="w-full h-full" />
        </div>
        <p className="text-xs text-muted-foreground mt-4">{log.outfit_name || 'My FitMe Look'} · {format(new Date(log.date), 'MMM d')}</p>
        <button
          onClick={onClose}
          className="mt-5 w-full h-12 rounded-full font-bold text-sm"
          style={{ background: '#FF6B47', color: '#fff' }}
        >
          Done
        </button>
      </motion.div>
    </div>
  );
}

export default function DayDetailPanel({ day, log, onClose, onLogOutfit }) {
  const [showQR, setShowQR] = useState(false);

  return (
    <>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-[32px] soft-shadow-lg pb-10"
        style={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              {log ? log.occasion : 'No outfit logged'}
            </p>
            <p className="text-xl font-extrabold">{format(day, 'EEEE, MMM d')}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {log ? (
          <div className="px-5 space-y-4">
            {/* Item row */}
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
              {(log.item_snapshots || []).map((item, i) => (
                <div key={i} className="shrink-0 flex flex-col items-center gap-1">
                  <div className="w-16 h-20 rounded-2xl bg-secondary flex items-center justify-center text-3xl overflow-hidden">
                    {item.photo_url && (item.photo_url.startsWith('http')) ? (
                      <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      item.emoji || '👗'
                    )}
                  </div>
                  <p className="text-[10px] font-semibold text-muted-foreground text-center max-w-[64px] truncate">
                    {item.name}
                  </p>
                </div>
              ))}
            </div>

            {log.outfit_name && (
              <div className="rounded-2xl bg-secondary p-3">
                <p className="text-xs text-muted-foreground font-semibold">Look name</p>
                <p className="font-extrabold">{log.outfit_name}</p>
              </div>
            )}

            {log.notes && (
              <div className="rounded-2xl bg-secondary p-3">
                <p className="text-xs text-muted-foreground font-semibold mb-1">Notes</p>
                <p className="text-sm">{log.notes}</p>
              </div>
            )}

            <button
              onClick={() => setShowQR(true)}
              className="w-full h-12 rounded-full font-bold text-sm flex items-center justify-center gap-2 border-2"
              style={{ borderColor: '#FF6B47', color: '#FF6B47' }}
            >
              <Share2 className="w-4 h-4" /> Share look
            </button>
          </div>
        ) : (
          <div className="px-5 py-8 text-center">
            <div className="text-5xl mb-3">📅</div>
            <p className="font-bold">No outfit logged for this day</p>
            <p className="text-xs text-muted-foreground mt-1 mb-6">Log your outfit using the button below</p>
            <button
              onClick={() => { onClose(); onLogOutfit && onLogOutfit(); }}
              className="w-full h-12 font-body font-semibold text-xs uppercase tracking-[0.06em] flex items-center justify-center gap-2"
              style={{ background: '#0F0F0F', color: '#fff', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' }}
            >
              + Log Outfit
            </button>
          </div>
        )}
      </motion.div>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {showQR && log && <QRModal log={log} onClose={() => setShowQR(false)} />}
    </>
  );
}