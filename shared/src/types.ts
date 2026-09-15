export interface LyricParagraph {
  hindi: string;
  english?: string;
}

export interface Bhajan {
  id: string;
  title: string;
  language: string;
  lyrics: LyricParagraph[];
  added_by?: string;
  created_at: string;
}

export interface Participant {
  socketId: string;
  name: string;
  role: 'leader' | 'co-leader' | 'member';
  joinedAt: number;
}

export interface RoomState {
  roomId: string;
  code: string;
  participants: Participant[]; 
  leaderId: string;
  coLeaderIds: string[];
  currentBhajanId: string | null;
  activeParaIdx: number;
  votes: Array<{ bhajanId: string; title: string; count: number }>;
  expiresAt: number;
}

export interface QueueItem {
  id: string;
  room_id: string;
  bhajan_id: string;
  position: number;
  status: 'playing' | 'upcoming' | 'completed';
  added_at: string;
  bhajan?: Bhajan; // Populated when fetched
}

export interface Vote {
  id: string;
  room_id: string;
  bhajan_id: string;
  voter_name: string;
  created_at: string;
}

// Socket Event Types
export interface ServerToClientEvents {
  room_state: (state: RoomState & { queue: QueueItem[], currentBhajan: Bhajan | null }) => void;
  para_changed: (payload: { activeParaIdx: number }) => void;
  bhajan_changed: (payload: { bhajan: Bhajan, activeParaIdx: number }) => void;
  queue_updated: (payload: { queue: QueueItem[] }) => void;
  votes_updated: (payload: { votes: Array<{ bhajanId: string; title: string; count: number }> }) => void;
  members_updated: (payload: { members: Participant[] }) => void;
  participant_event: (payload: { type: 'joined' | 'left'; name: string; totalCount: number }) => void;
  promoted: (payload: { newRole: string }) => void;
  demoted: (payload: { newRole: string }) => void;
  room_disbanded: (payload: { reason: string }) => void;
  error_msg: (payload: { message: string }) => void;
}

export interface ClientToServerEvents {
  join_room: (payload: { roomCode: string; name: string }) => void;
  next_para: (payload: { roomCode: string }) => void;
  prev_para: (payload: { roomCode: string }) => void;
  promote_member: (payload: { roomCode: string; targetSocketId: string }) => void;
  demote_coleader: (payload: { roomCode: string; targetSocketId: string }) => void;
  cast_vote: (payload: { roomCode: string; bhajanId: string; voterName: string }) => void;
  accept_vote: (payload: { roomCode: string; bhajanId: string }) => void;
  reject_vote: (payload: { roomCode: string; bhajanId: string }) => void;
  add_to_queue: (payload: { roomCode: string; bhajanId: string }) => void;
  finish_bhajan: (payload: { roomCode: string }) => void;
  load_bhajan: (payload: { roomCode: string; bhajanId: string }) => void;
  leave_room: (payload: { roomCode: string }) => void;
}
