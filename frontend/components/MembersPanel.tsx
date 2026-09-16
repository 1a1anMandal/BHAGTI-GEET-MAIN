'use client';

import { useRoomStore } from '../stores/roomStore';
import { getSocket } from '../lib/socket';
import { Star, UserPlus, UserMinus, Shield } from 'lucide-react';

export function MembersPanel() {
  const { participants, leaderId, myRole, roomCode } = useRoomStore();
  const socket = getSocket();

  const handlePromote = (socketId: string) => {
    if (!roomCode) return;
    socket.emit('promote_member', { roomCode, targetSocketId: socketId });
  };

  const handleDemote = (socketId: string) => {
    if (!roomCode) return;
    socket.emit('demote_coleader', { roomCode, targetSocketId: socketId });
  };

  const isMainLeader = myRole === 'leader';

  return (
    <div className="flex flex-col h-full bg-surface2/90 border-t border-white/10 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/20">
        <span className="text-xs text-muted font-bold tracking-wider uppercase">Live Audience</span>
        <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">{participants.length} Active</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {participants.map((p) => {
          const isMe = p.socketId === getSocket().id;
          const isLeader = p.socketId === leaderId;
          const isCoLeader = p.role === 'co-leader';
          
          return (
            <div key={p.socketId} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 group transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  isLeader ? 'bg-primary/20 border-primary text-primary' :
                  isCoLeader ? 'bg-primary-light/20 border-primary-light text-primary-light' :
                  'bg-surface border-white/10 text-muted'
                }`}>
                  {isLeader ? <Shield size={14} className="fill-primary/50" /> : 
                   isCoLeader ? <Star size={14} className="fill-primary-light/50" /> : 
                   <span className="text-xs font-bold">{p.name.charAt(0).toUpperCase()}</span>}
                </div>
                <div>
                  <span className="text-sm font-medium text-white/90">
                    {p.name} {isMe && <span className="text-muted text-[10px] ml-1">(You)</span>}
                  </span>
                  <p className="text-[10px] text-muted">
                    {isLeader ? 'Main Leader' : isCoLeader ? 'Co-Leader' : 'Participant'}
                  </p>
                </div>
              </div>
              
              {isMainLeader && !isMe && !isLeader && (
                <div className="shrink-0">
                  {isCoLeader ? (
                    <button 
                      onClick={() => handleDemote(p.socketId)}
                      title="Demote to Member"
                      className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <UserMinus size={14} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handlePromote(p.socketId)}
                      title="Promote to Co-Leader"
                      className="p-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                    >
                      <UserPlus size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
