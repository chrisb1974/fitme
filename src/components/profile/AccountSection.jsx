import React, { useState } from 'react';
import { Share2, Star, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useFitMeToast } from '@/components/ui/FitMeToaster';
import { useLanguage } from '@/lib/i18n.jsx';

export default function AccountSection({ user }) {
  const [showShare, setShowShare] = useState(false);
  const { toast } = useFitMeToast();
  const { t } = useLanguage();

  const firstName = (user?.full_name || 'User').split(' ')[0].toUpperCase();
  const referralCode = `${firstName.slice(0, 5)}10`;
  const shareText = `Join me on FitMe! Use my code ${referralCode} for 1 month free — https://fitme.app`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({ description: t('referralCopied') });
    }
    setShowShare(false);
  };

  const handleSignOut = () => {
    base44.auth.logout('/');
  };

  return (
    <div className="px-5 mb-8 space-y-3">
      <p className="text-[11px] uppercase tracking-[0.08em] font-body font-medium mb-1" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
        {t('account')}
      </p>

      {/* Go Premium banner */}
      <div className="p-5" style={{ background: '#0F0F0F', borderRadius: '4px' }}>
        <div className="flex items-start gap-3 mb-4">
          <Star className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#C9A96E' }} />
          <div className="flex-1">
            <p className="font-display font-semibold text-base text-white leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              {t('goPremium')}
            </p>
            <p className="text-xs font-body mt-1 leading-relaxed" style={{ color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}>
              {t('premiumFeatures')}
            </p>
          </div>
        </div>
        <button
          className="w-full py-3 text-xs font-body uppercase tracking-[0.06em] font-semibold"
          style={{ border: '1px solid rgba(255,255,255,0.2)', borderRadius: '2px', color: '#fff', background: 'transparent', fontFamily: 'DM Sans, sans-serif' }}
        >
          {t('upgradeBtn')}
        </button>
      </div>

      {/* Invite a friend */}
      <button
        onClick={handleShare}
        className="w-full h-12 flex items-center justify-center gap-2 text-xs font-body uppercase tracking-[0.06em] font-semibold active:scale-95 transition-all"
        style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px', color: '#0F0F0F', fontFamily: 'DM Sans, sans-serif' }}
      >
        <Share2 className="w-4 h-4" />
        {t('inviteFriend')}
      </button>

      {showShare && (
        <div className="bg-white p-4" style={{ border: '1px solid #E8E6E1', borderRadius: '4px' }}>
          <p className="text-sm font-body font-medium mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>{t('yourReferralCode')}</p>
          <div className="px-4 py-3 font-mono font-bold text-center mb-3" style={{ background: '#F5F4F1', borderRadius: '2px', color: '#C9A96E' }}>
            {referralCode}
          </div>
          <button onClick={handleShare} className="w-full py-2.5 text-xs font-body uppercase tracking-[0.06em] font-semibold" style={{ background: '#0F0F0F', color: '#fff', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' }}>
            {t('shareNow')}
          </button>
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full h-12 flex items-center justify-center gap-2 text-xs font-body uppercase tracking-[0.06em] transition-all"
        style={{ background: 'transparent', border: '1px solid #E8E6E1', borderRadius: '2px', color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}
      >
        <LogOut className="w-4 h-4" />
        {t('signOut')}
      </button>
    </div>
  );
}