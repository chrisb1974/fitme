import React from 'react';
import { Shirt } from 'lucide-react';
import { useLanguage } from '@/lib/i18n.jsx';

export default function EmptyWardrobe({ onAdd }) {
  const { t } = useLanguage();
  return (
    <div className="px-5 py-16 text-center">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/10 flex items-center justify-center">
        <Shirt className="w-9 h-9 text-primary" strokeWidth={2.2} />
      </div>
      <h3 className="mt-5 text-xl font-extrabold">{t('noItems')}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-[260px] mx-auto">
        {t('aiAutoFills')}
      </p>
      <button
        onClick={onAdd}
        className="mt-6 bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold text-sm soft-shadow"
      >
        {t('addFirstItem')}
      </button>
    </div>
  );
}