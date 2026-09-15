'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSocketConnection } from '../../../hooks/useSocket';
import { useRoomStore } from '../../../stores/roomStore';
import { useSwipeGesture } from '../../../hooks/useSwipeGesture';

import { LyricsDisplay } from '../../../components/LyricsDisplay';
import { QueuePanel } from '../../../components/QueuePanel';
import { VotingPanel } from '../../../components/VotingPanel';
import { MembersPanel } from '../../../components/MembersPanel';
import { LeaderControls } from '../../../components/LeaderControls';
import { SingingMode } from '../../../components/SingingMode';
import { LeaderLibraryPanel } from '../../../components/LeaderLibraryPanel';

function RoomContent({ code }: { code: string }) {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Anonymous';
  
  const { setRoomInfo, myRole, roomCode } = useRoomStore();
  const socket = useSocketConnection();

  const [panelsVisible, setPanelsVisible] = useState(true);

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
      className="h-screen w-full flex flex-col md:flex-row overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <SingingMode>
        <div className="flex-1 flex flex-col relative h-full overflow-hidden">
          <div className="absolute top-4 left-4 z-40 text-sm font-semibold opacity-50 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
            Room: {code}
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden relative pb-[80px]">
            <LyricsDisplay />
            <LeaderControls />
          </div>

          {isLeader && (
            <div className="h-[25vh] min-h-[150px] max-h-[300px] w-full shrink-0 z-40 relative">
              <LeaderLibraryPanel />
            </div>
          )}
        </div>
      </SingingMode>

      <div className={`
        ${panelsVisible ? 'flex' : 'hidden'} 
        md:flex w-full md:w-80 lg:w-96 flex-col gap-4 p-4 border-t md:border-t-0 md:border-l border-white/10 bg-bg md:bg-surface/30 
        overflow-y-auto z-40 h-[50vh] md:h-full
      `}>
        {isLeader && <MembersPanel />}
        <QueuePanel />
        <VotingPanel />
      </div>

      <button 
        onClick={() => setPanelsVisible(!panelsVisible)}
        className="md:hidden fixed bottom-20 right-4 z-50 bg-surface2 border border-white/10 rounded-full px-4 py-2 text-sm font-semibold shadow-xl"
      >
        {panelsVisible ? 'Hide Panels' : 'Show Panels'}
      </button>

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
