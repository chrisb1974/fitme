import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Shirt, Sparkles, Store, ShoppingBag, User } from 'lucide-react';
import { useLanguage } from '@/lib/i18n.jsx';

export default function BottomNav() {
  const { t } = useLanguage();

  const items = [
    { to: '/', labelKey: 'home', icon: Home },
    { to: '/wardrobe', labelKey: 'wardrobe', icon: Shirt },
    { to: '/look', labelKey: 'looks', icon: Sparkles },
    { to: '/market', labelKey: 'market', icon: Store },
    { to: '/sell', labelKey: 'sell', icon: ShoppingBag },
    { to: '/profile', labelKey: 'profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)] pointer-events-none">
      <div className="mx-auto max-w-md pointer-events-auto">
        <div
          className="bg-white flex items-center justify-between px-2 py-2"
          style={{ borderTop: '1px solid #E8E6E1' }}
        >
          {items.map(({ to, labelKey, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className="relative flex flex-col items-center justify-center flex-1 py-2 transition-all"
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className="w-[22px] h-[22px] transition-all"
                    strokeWidth={isActive ? 2.2 : 1.8}
                    style={{ color: isActive ? '#0F0F0F' : '#A8A8A8' }}
                  />
                  <span
                    className="text-[10px] mt-1 font-body"
                    style={{
                      color: isActive ? '#0F0F0F' : '#A8A8A8',
                      fontWeight: isActive ? 600 : 400,
                      fontFamily: 'DM Sans, sans-serif',
                    }}
                  >
                    {t(labelKey)}
                  </span>
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5"
                      style={{ background: '#C9A96E' }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}