import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import MarketNotifications from '@/components/market/MarketNotifications';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <MarketNotifications />
      <div className="mx-auto max-w-md min-h-screen flex flex-col relative">
        <main className="flex-1 pb-28">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}