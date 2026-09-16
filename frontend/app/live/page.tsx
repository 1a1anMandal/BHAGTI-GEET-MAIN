'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LiveRoomRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Currently, there's no global "joined room" state outside of the room itself in our architecture.
    // Ideally, we'd check localStorage for `lastJoinedRoom` and show it here.
    // For now, redirecting to home to join a room.
    router.replace('/');
  }, [router]);

  return (
    <div className="flex-1 flex items-center justify-center bg-bg text-muted h-screen">
      Redirecting...
    </div>
  );
}
