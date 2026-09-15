import { useEffect } from 'react';
import { getSocket } from '../lib/socket';
import { useRoomStore } from '../stores/roomStore';
import { useLyricsStore } from '../stores/lyricsStore';
import { useQueueStore } from '../stores/queueStore';

export function useSocketConnection() {
  const socket = getSocket();
  const roomStore = useRoomStore();
  const lyricsStore = useLyricsStore();
  const queueStore = useQueueStore();

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      roomStore.setMySocketId(socket.id!);
      
      // If we already have a roomCode and name (e.g., fast refresh), re-join
      if (roomStore.roomCode && roomStore.myName) {
        socket.emit('join_room', { roomCode: roomStore.roomCode, name: roomStore.myName });
      }
    });

    socket.on('room_state', (state) => {
      roomStore.setRoomState(state);
      queueStore.setQueue(state.queue);
      lyricsStore.setBhajan(state.currentBhajan, state.activeParaIdx);
    });

    socket.on('para_changed', ({ activeParaIdx }) => {
      lyricsStore.setActiveParaIdx(activeParaIdx);
    });

    socket.on('bhajan_changed', ({ bhajan, activeParaIdx }) => {
      lyricsStore.setBhajan(bhajan, activeParaIdx);
    });

    socket.on('queue_updated', ({ queue }) => {
      queueStore.setQueue(queue);
    });

    socket.on('votes_updated', ({ votes }) => {
      queueStore.setVotes(votes);
    });

    socket.on('members_updated', ({ members }) => {
      roomStore.updateMembers(members);
    });

    socket.on('promoted', ({ newRole }) => {
      roomStore.updateMyRole(newRole as any);
      alert(`You have been promoted to ${newRole}!`);
    });

    socket.on('demoted', ({ newRole }) => {
      roomStore.updateMyRole(newRole as any);
      alert(`You have been demoted to ${newRole}.`);
    });

    socket.on('room_disbanded', ({ reason }) => {
      alert(`Room disbanded: ${reason}`);
      window.location.href = '/';
    });

    socket.on('error_msg', ({ message }) => {
      alert(`Error: ${message}`);
    });

    return () => {
      socket.off('connect');
      socket.off('room_state');
      socket.off('para_changed');
      socket.off('bhajan_changed');
      socket.off('queue_updated');
      socket.off('votes_updated');
      socket.off('members_updated');
      socket.off('promoted');
      socket.off('demoted');
      socket.off('room_disbanded');
      socket.off('error_msg');
    };
  }, []);

  return socket;
}
