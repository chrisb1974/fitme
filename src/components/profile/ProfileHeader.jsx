import React, { useRef, useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useFitMeToast } from '@/components/ui/FitMeToaster';
import { useLanguage } from '@/lib/i18n.jsx';

export default function ProfileHeader({ user, onProfileUpdated }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const { toast } = useFitMeToast();
  const { t, lang } = useLanguage();

  useEffect(() => {
    if (user) {
      setName(user.full_name || '');
      setLocation(user.location || '');
    }
  }, [user]);

  const initials = (name || user?.full_name || 'U')
    .split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const memberSince = user?.created_date
    ? new Date(user.created_date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-GB', { month: 'long', year: 'numeric' })
    : '';

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ avatar_url: file_url });
    toast({ description: t('photoUpdated') });
    setUploading(false);
    window.location.reload();
  };

  const handleSave = async () => {
    await base44.auth.updateMe({ location });
    setEditing(false);
    if (onProfileUpdated) onProfileUpdated();
  };

  if (!user) return (
    <div className="px-5 pt-10 pb-6 flex flex-col items-center gap-3">
      <div className="w-20 h-20 rounded-full animate-pulse" style={{ background: '#F5F4F1' }} />
    </div>
  );

  return (
    <div className="px-5 pt-10 pb-6 flex flex-col items-center gap-2">
      {/* Avatar */}
      <button onClick={() => fileRef.current?.click()} className="relative mb-2">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl overflow-hidden font-body font-semibold"
          style={{ background: '#0F0F0F', fontFamily: 'DM Sans, sans-serif' }}
        >
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
          ) : initials}
        </div>
        <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white flex items-center justify-center" style={{ border: '1px solid #E8E6E1' }}>
          {uploading
            ? <div className="w-3 h-3 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
            : <Pencil className="w-2.5 h-2.5" style={{ color: '#6B6B6B' }} />}
        </div>
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

      {/* Name */}
      <div className="flex items-center gap-2">
        {editing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-xl font-display font-bold text-center bg-transparent outline-none w-40"
            style={{ fontFamily: 'Playfair Display, serif', borderBottom: '1px solid #0F0F0F' }}
            autoFocus
          />
        ) : (
          <h1 className="text-2xl font-display font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#0F0F0F' }}>
            {name || user.full_name}
          </h1>
        )}
        <button onClick={() => editing ? handleSave() : setEditing(true)} style={{ color: '#A8A8A8' }}>
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Location */}
      {editing ? (
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t('locationPlaceholder')}
          className="text-sm text-center outline-none font-body px-3 py-1"
          style={{ fontFamily: 'DM Sans, sans-serif', background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px' }}
        />
      ) : (
        <p className="text-sm font-body" style={{ color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}>
          {user.location || t('addYourLocation')}
        </p>
      )}
      {editing && (
        <button
          onClick={handleSave}
          className="mt-1 px-5 py-2 text-xs font-body uppercase tracking-[0.06em] font-semibold"
          style={{ background: '#0F0F0F', color: '#fff', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' }}
        >
          {t('saveProfile')}
        </button>
      )}

      {memberSince && (
        <p className="text-[11px] font-body mt-1" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
          {t('memberSince')} {memberSince}
        </p>
      )}
    </div>
  );
}