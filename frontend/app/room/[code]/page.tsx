'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSocketConnection } from '../../../hooks/useSocket';
import { useRoomStore } from '../../../stores/roomStore';
import { useSwipeGesture } from '../../../hooks/useSwipeGesture';

import { LyricsDisplay } from '../../../components/LyricsDisplay';
import { QueuePanel } from '../../../components/QueuePanel';
import { VotingPanel } from '../../../components/VotingPanel';
import { LeaderControls } from '../../../components/LeaderControls';
import { LeaderLibraryPanel } from '../../../components/LeaderLibraryPanel';
import { MembersPanel } from '../../../components/MembersPanel';
import { ChevronLeft, MoreVertical, User, Users } from 'lucide-react';

function RoomContent({ code }: { code: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Anonymous';
  
  const { setRoomInfo, myRole, roomCode, participants } = useRoomStore();
  const socket = useSocketConnection();

  const [activeTab, setActiveTab] = useState<'queue' | 'library' | 'members' | 'suggest'>('queue');

  useEffect(() => {
    setRoomInfo(code, name);
  }, [code, name]);

  const isLeader = myRole === 'leader' || myRole === 'co-leader';

  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipeGesture({
    onSwipeLeft: () => {
      if (isLeader && roomCode) socket.emit('next_para', { roomCode });
    },
    onSwipeRight: () => {
      if (isLeader && roomCode) socket.emit('prev_para', { roomCode });
    }
  });

  return (
    <div 
      className="h-screen w-full flex flex-col bg-bg overflow-hidden relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="p-4 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-2 -ml-2 text-white/70 hover:text-white">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center text-primary border border-primary/20">
              <span className="text-lg">🔥</span>
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">Active Singing</h1>
              <p className="text-[10px] text-muted">Room • {code}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-surface2 px-3 py-1.5 rounded-full border border-white/5">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-white">{participants.length} singing</span>
          </div>
          <button className="text-white/70 hover:text-white"><MoreVertical size={20} /></button>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary-light border border-primary/30">
            <User size={16} />
          </div>
        </div>
      </div>

      {/* Top Half: Lyrics */}
      <div className="flex-1 relative z-10 overflow-hidden flex flex-col min-h-0">
        <LyricsDisplay />
      </div>

      {/* Bottom Half: Queue / Library / Members (Takes up remaining space, min 40%) */}
      <div className="h-[45vh] min-h-[300px] flex flex-col bg-surface border-t border-primary/20 rounded-t-3xl relative z-30 overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pb-[80px]">
        {/* Tabs */}
        <div className="flex p-2 bg-surface2/50 backdrop-blur border-b border-white/5">
          <button 
            onClick={() => setActiveTab('queue')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'queue' ? 'bg-primary text-black' : 'text-muted hover:text-white'}`}
          >
            Bhajan Queue
          </button>
          <button 
            onClick={() => setActiveTab('suggest')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'suggest' ? 'bg-primary text-black' : 'text-muted hover:text-white'}`}
          >
            {isLeader ? 'Review Suggestions' : 'Suggest Bhajan'}
          </button>
          {isLeader && (
            <button 
              onClick={() => setActiveTab('library')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'library' ? 'bg-primary text-black' : 'text-muted hover:text-white'}`}
            >
              Library Add
            </button>
          )}
          {isLeader && (
            <button 
              onClick={() => setActiveTab('members')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'members' ? 'bg-primary text-black' : 'text-muted hover:text-white'}`}
            >
              Members
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'queue' && <QueuePanel />}
          {activeTab === 'suggest' && <VotingPanel />}
          {activeTab === 'library' && isLeader && <LeaderLibraryPanel />}
          {activeTab === 'members' && isLeader && <MembersPanel />}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <LeaderControls />
    </div>
  );
}

export default function RoomPage({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();
  
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-white h-screen">Loading Room...</div>}>
      <RoomContent code={code} />
    </Suspense>
  );
}
