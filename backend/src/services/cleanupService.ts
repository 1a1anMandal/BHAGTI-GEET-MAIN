import { pool } from '../config/db';
import { activeRooms } from './roomService';

export class CleanupService {
  static startCleanupCron() {
    // Run every 10 minutes
    setInterval(async () => {
      try {
        console.log('Running room cleanup cron...');
        
        // 1. Delete from DB where expires_at <= NOW()
        const { rows } = await pool.query(
          `DELETE FROM rooms WHERE expires_at <= NOW() RETURNING code`
        );
        
        // 2. Remove from in-memory activeRooms map
        for (const row of rows) {
          activeRooms.delete(row.code);
          console.log(`Cleaned up expired room from DB: ${row.code}`);
        }
        
        // 3. Also cleanup memory map for any edge cases
        const now = Date.now();
        for (const [code, state] of activeRooms.entries()) {
          if (state.expiresAt <= now) {
            activeRooms.delete(code);
            console.log(`Cleaned up expired room from memory: ${code}`);
          }
        }
      } catch (error) {
        console.error('Error during room cleanup:', error);
      }
    }, 10 * 60 * 1000); // 10 minutes
  }
}
