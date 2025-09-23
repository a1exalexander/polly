import { createClient } from '@/utils/supabase/client';

/**
 * Updates the last_visited_at timestamp for a user's room visit
 * @param roomId - The ID of the room being visited
 * @param userId - The public user ID
 */
export const updateRoomVisit = async (roomId: number, userId: number): Promise<void> => {
    const supabase = createClient();
    
    try {
        // First, check if the user is already associated with this room
        const { data: existingRelation, error: fetchError } = await supabase
            .from('UsersOnRooms')
            .select('*')
            .eq('room_id', roomId)
            .eq('public_user_id', userId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            // Error other than "not found"
            console.error('Error checking existing room relation:', fetchError);
            return;
        }

        if (existingRelation) {
            // Update existing relation with new visit timestamp
            const { error: updateError } = await supabase
                .from('UsersOnRooms')
                .update({ 
                    active: true,
                    last_visited_at: new Date().toISOString()
                })
                .eq('room_id', roomId)
                .eq('public_user_id', userId);

            if (updateError) {
                console.error('Error updating room visit:', updateError);
            }
        } else {
            // Create new relation for first-time visit
            const { error: insertError } = await supabase
                .from('UsersOnRooms')
                .insert({
                    room_id: roomId,
                    public_user_id: userId,
                    active: true,
                    last_visited_at: new Date().toISOString()
                });

            if (insertError) {
                console.error('Error creating room visit record:', insertError);
            }
        }
    } catch (error) {
        console.error('Unexpected error in updateRoomVisit:', error);
    }
};