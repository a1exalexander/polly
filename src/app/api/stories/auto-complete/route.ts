import { isNumber } from '@/utils/isNumber';
import { createClient } from '@/utils/supabase/server';
import { formatISO } from 'date-fns';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const storyId = Number(body.storyId);
        const roomId = Number(body.roomId);

        // Input validation (Next.js best practice)
        if (!Number.isInteger(storyId) || !Number.isInteger(roomId) || storyId <= 0 || roomId <= 0) {
            return NextResponse.json(
                { error: 'storyId and roomId must be positive integers' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Batch query: Get story, active users, and votes in parallel (N+1 prevention)
        const [storyResult, usersResult, votesResult] = await Promise.all([
            supabase
                .from('Stories')
                .select('id, started_at, finished_at')
                .eq('id', storyId)
                .single(),
            supabase
                .from('UsersOnRooms')
                .select('public_user_id')
                .eq('room_id', roomId)
                .eq('active', true),
            supabase
                .from('UsersOnStories')
                .select('public_user_id, value')
                .eq('story_id', storyId)
        ]);

        // Handle story errors
        if (storyResult.error || !storyResult.data) {
            return NextResponse.json(
                { error: 'Story not found' },
                { status: 404 }
            );
        }

        const story = storyResult.data;

        // Early return if story is already finished or not started
        if (story.finished_at || !story.started_at) {
            return NextResponse.json({
                autoCompleted: false,
                reason: story.finished_at ? 'already_finished' : 'not_started'
            });
        }

        // Handle users error
        if (usersResult.error) {
            return NextResponse.json(
                { error: 'Failed to fetch users' },
                { status: 500 }
            );
        }

        const activeUsers = usersResult.data || [];

        // Need at least 1 active user for auto-complete
        if (activeUsers.length < 1) {
            return NextResponse.json({
                autoCompleted: false,
                reason: 'not_enough_active_users'
            });
        }

        // Handle votes error
        if (votesResult.error) {
            return NextResponse.json(
                { error: 'Failed to fetch votes' },
                { status: 500 }
            );
        }

        const usersOnStory = votesResult.data || [];

        // Check if all active users have voted
        const allVoted = activeUsers.every(({ public_user_id }) =>
            usersOnStory.some(
                ({ public_user_id: voterId, value }) =>
                    public_user_id === voterId && isNumber(value)
            )
        );

        if (!allVoted) {
            return NextResponse.json({
                autoCompleted: false,
                reason: 'not_all_voted'
            });
        }

        // Atomic update with race condition protection:
        // - Only updates if finished_at is NULL
        // - Returns updated row to confirm it was actually updated
        const { data: updatedStory, error: updateError } = await supabase
            .from('Stories')
            .update({ finished_at: formatISO(new Date()) })
            .eq('id', storyId)
            .is('finished_at', null)
            .select('id')
            .single();

        if (updateError) {
            // PGRST116 = no rows returned (already finished by another request)
            if (updateError.code === 'PGRST116') {
                return NextResponse.json({
                    autoCompleted: false,
                    reason: 'already_finished'
                });
            }
            return NextResponse.json(
                { error: 'Failed to stop story' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            autoCompleted: !!updatedStory
        });
    } catch (error) {
        console.error('Auto-complete error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
