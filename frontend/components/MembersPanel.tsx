'use client';

import { useRoomStore } from '../stores/roomStore';
import { getSocket } from '../lib/socket';
import { Star, UserPlus, UserMinus } from 'lucide-react';

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
    <div className="glass-card p-4 flex flex-col h-full max-h-[400px]">
      <h3 className="font-bold text-lg mb-4">Members ({participants.length})</h3>
      
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {participants.map((p) => {
          const isMe = p.socketId === getSocket().id;
          const isLeader = p.socketId === leaderId;
          const isCoLeader = p.role === 'co-leader';
          
          return (
            <div key={p.socketId} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 group">
              <div className="flex items-center gap-2">
                {(isLeader || isCoLeader) && (
                  <Star size={14} className={isLeader ? 'text-primary fill-primary' : 'text-primary'} />
                )}
                <span className="text-sm font-medium">
                  {p.name} {isMe && <span className="text-muted text-xs font-normal">(You)</span>}
                </span>
              </div>
              
              {isMainLeader && !isMe && !isLeader && (
                <div>
                  {isCoLeader ? (
                    <button 
                      onClick={() => handleDemote(p.socketId)}
                      title="Demote to Member"
                      className="p-1 text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <UserMinus size={16} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handlePromote(p.socketId)}
                      title="Promote to Co-Leader"
                      className="p-1 text-muted hover:text-green-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <UserPlus size={16} />
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
