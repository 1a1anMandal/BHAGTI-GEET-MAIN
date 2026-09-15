import { create } from 'zustand';
import { RoomState, Participant } from '@bhagi-geet/shared';

interface RoomStoreState {
  roomCode: string | null;
  myName: string | null;
  myRole: 'leader' | 'co-leader' | 'member';
  mySocketId: string | null;
  participants: Participant[];
  leaderId: string | null;
  coLeaderIds: string[];
  setRoomInfo: (code: string, name: string) => void;
  setRoomState: (state: RoomState) => void;
  setMySocketId: (id: string) => void;
  updateMembers: (members: Participant[]) => void;
  updateMyRole: (role: 'leader' | 'co-leader' | 'member') => void;
  reset: () => void;
}

export const useRoomStore = create<RoomStoreState>((set) => ({
  roomCode: null,
  myName: null,
  myRole: 'member',
  mySocketId: null,
  participants: [],
  leaderId: null,
  coLeaderIds: [],
  
  setRoomInfo: (code, name) => set({ roomCode: code, myName: name }),
  setRoomState: (state) => set((prev) => {
    // Find my role from participants if I know my socketId
    const me = state.participants.find(p => p.socketId === prev.mySocketId);
    return {
      participants: state.participants,
      leaderId: state.leaderId,
      coLeaderIds: state.coLeaderIds,
      myRole: me ? me.role : prev.myRole,
    };
  }),
  setMySocketId: (id) => set((state) => {
    const me = state.participants.find(p => p.socketId === id);
    return { mySocketId: id, myRole: me ? me.role : state.myRole };
  }),
  updateMembers: (members) => set((state) => {
    const me = members.find(p => p.socketId === state.mySocketId);
    // Find leader
    const leader = members.find(p => p.role === 'leader');
    const coLeaders = members.filter(p => p.role === 'co-leader').map(p => p.socketId);
    return {
      participants: members,
      myRole: me ? me.role : state.myRole,
      leaderId: leader ? leader.socketId : null,
      coLeaderIds: coLeaders,
    };
  }),
  updateMyRole: (role) => set({ myRole: role }),
  reset: () => set({
    roomCode: null,
    myName: null,
    myRole: 'member',
    participants: [],
    leaderId: null,
    coLeaderIds: [],
  }),
}));
