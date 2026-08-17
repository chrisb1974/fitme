import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen flex flex-col relative">
        <main className="flex-1 pb-28">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}