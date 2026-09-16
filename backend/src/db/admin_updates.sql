-- Run this in your Supabase SQL Editor to add moderation support

ALTER TABLE bhajans 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved';

-- Optional: Create an index for faster filtering of approved bhajans
CREATE INDEX IF NOT EXISTS idx_bhajans_status ON bhajans(status);

-- If you want new submissions to be pending by default, change the default:
ALTER TABLE bhajans ALTER COLUMN status SET DEFAULT 'pending';

-- Update all existing bhajans to be approved (since they are already in the DB)
UPDATE bhajans SET status = 'approved' WHERE status IS NULL;
