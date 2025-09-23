import { createClient } from '@/utils/supabase/client';

/**
 * Updates the last_visited_at timestamp for a user's room visit
 * @param roomId - The ID of the room being visited
 * @param userId - The public user ID
 */
export const updateRoomVisit = async (roomId: number, userId: number): Promise<void> => {
    const supabase = createClient();
    try {
        // Upsert into RecentlyVisitedRooms to persist visit history
        const { error } = await supabase
            .from('RecentlyVisitedRooms')
            .upsert({
                room_id: roomId,
                public_user_id: userId,
                last_visited_at: new Date().toISOString(),
            }, { onConflict: 'public_user_id,room_id' });
        if (error) {
            console.error('Error upserting recently visited room:', error);
        }
    } catch (error) {
        console.error('Unexpected error in updateRoomVisit:', error);
    }
};