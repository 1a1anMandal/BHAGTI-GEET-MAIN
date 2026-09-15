-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Bhajans table
CREATE TABLE IF NOT EXISTS bhajans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  language TEXT DEFAULT 'hi',
  lyrics JSONB NOT NULL,
  added_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  current_bhajan_id UUID REFERENCES bhajans(id),
  active_para_idx INT DEFAULT 0,
  status TEXT DEFAULT 'waiting',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Queue table
CREATE TABLE IF NOT EXISTS queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  bhajan_id UUID REFERENCES bhajans(id),
  position SMALLINT NOT NULL,
  status TEXT DEFAULT 'upcoming',
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, bhajan_id)
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  bhajan_id UUID REFERENCES bhajans(id),
  voter_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, bhajan_id, voter_name)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bhajans_title ON bhajans USING gin(to_tsvector('simple', title));
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_queue_room_id ON queue(room_id, position);
CREATE INDEX IF NOT EXISTS idx_votes_room_bhajan ON votes(room_id, bhajan_id);
