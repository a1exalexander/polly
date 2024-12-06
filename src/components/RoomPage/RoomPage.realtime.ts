import { RoomPageService } from '@/components/RoomPage/RoomPage.service';
import { Room, Story, StoryOnRoom, User, UserOnRoom, UserOnStory } from '@/types';
import { RealtimeChannel } from '@supabase/realtime-js';
import { ActionTypes, DispatchType } from './RoomPage.store';

export const realtime = ({
    roomPageService,
    roomId,
    dispatch,
    storyId,
    channel,
}: {
    roomPageService: RoomPageService | null;
    channel: RealtimeChannel;
    dispatch: DispatchType;
    roomId: number;
    storyId: number | null;
}) => {
    return channel
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'Rooms', filter: 'id=eq.' + roomId },
            async (payload) => {
                if (payload.new.id !== roomId) {
                    return;
                }
                dispatch({ type: ActionTypes.ROOM_UPDATED, payload: payload.new as Room });
            },
        )
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'Stories', filter: 'id=eq.' + storyId },
            async (payload) => {
                if (payload.new.id !== storyId) {
                    return;
                }
                dispatch({ type: ActionTypes.STORY_UPDATED, payload: payload.new as Story });
            },
        )
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'StoriesOnRooms', filter: 'room_id=eq.' + roomId },
            async (payload) => {
                const storyOnRoom = payload.new as StoryOnRoom;
                if (storyOnRoom.room_id !== roomId) {
                    return;
                }
                dispatch({ type: ActionTypes.STORY_FETCH });
                const [story, storiesCount] = await Promise.all([
                    roomPageService?.getStory(),
                    roomPageService?.getStoriesCount(),
                ]);
                if (story) {
                    dispatch({ type: ActionTypes.STORY_FETCHED, payload: story });
                }
                if (typeof storiesCount !== 'undefined') {
                    dispatch({ type: ActionTypes.STORIES_COUNT_UPDATED, payload: storiesCount });
                }
            },
        )
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'UsersOnStories', filter: 'story_id=eq.' + storyId },
            async (payload) => {
                const userOnStory = payload.new as UserOnStory;
                if (userOnStory.story_id !== storyId) {
                    return;
                }
                dispatch({ type: ActionTypes.USER_ON_STORY_CREATED, payload: userOnStory });
            },
        )
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'UsersOnStories', filter: 'story_id=eq.' + storyId },
            async (payload) => {
                const userOnStory = payload.new as UserOnStory;
                if (userOnStory.story_id !== storyId) {
                    return;
                }
                dispatch({ type: ActionTypes.USER_ON_STORY_UPDATED, payload: userOnStory });
            },
        )
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'UsersOnRooms', filter: 'room_id=eq.' + roomId },
            async (payload) => {
                const userOnRoom = payload.new as UserOnRoom;
                if (userOnRoom.room_id !== roomId) {
                    return;
                }
                const user = await roomPageService?.getMember(userOnRoom.public_user_id);
                console.log('User created', userOnRoom, user);
                if (!user) {
                    return;
                }

                dispatch({ type: ActionTypes.USER_CREATED, payload: user });
            },
        )
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'UsersOnRooms', filter: 'room_id=eq.' + roomId },
            async (payload) => {
                const userOnRoom = payload.new as UserOnRoom;
                if (userOnRoom.room_id !== roomId) {
                    return;
                }
                dispatch({
                    type: ActionTypes.USER_UPDATED, payload: {
                        id: userOnRoom.public_user_id,
                        active: !!userOnRoom.active,
                    },
                });
            },
        )
        .on(
            'postgres_changes',
            { event: 'DELETE', schema: 'public', table: 'UsersOnRooms', filter: 'room_id=eq.' + roomId },
            async (payload) => {
                const userOnRoom = payload.old as UserOnRoom;
                if (userOnRoom.room_id !== roomId) {
                    return;
                }
                dispatch({
                    type: ActionTypes.USER_DELETED, payload: {
                        id: userOnRoom.public_user_id,
                    },
                });
            },
        )
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'Users' },
            async (payload) => {
                const user = payload.new as User;
                dispatch({ type: ActionTypes.USER_UPDATED, payload: user });
            },
        )
        .subscribe();
};
