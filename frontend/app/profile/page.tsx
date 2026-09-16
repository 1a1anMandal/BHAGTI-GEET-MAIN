'use client';

import { Flame, User } from 'lucide-react';

export default function Profile() {
  return (
    <div className="flex-1 overflow-y-auto pb-24 hide-scrollbar bg-bg relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="p-4 flex items-center justify-between sticky top-0 bg-bg/90 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center text-primary">
            <Flame size={20} className="fill-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">Profile</h1>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col items-center justify-center space-y-4 mt-10">
        <div className="w-24 h-24 rounded-full bg-surface2 border-4 border-white/5 flex items-center justify-center text-muted">
          <User size={40} />
        </div>
        <h2 className="text-2xl font-bold text-white">Guest Devotee</h2>
        <p className="text-sm text-muted text-center max-w-xs">
          Welcome to Bhagi Geet! You are currently using the guest sanctuary. Create or join a room to start singing.
        </p>
      </div>
    </div>
  );
}
