import { formatISO } from 'date-fns';
import { Room, Story, UserWithActivity } from '@/types';
import { createClient, SupabaseClient } from '@/utils/supabase/client';

export class RoomPageService {
    supabase: SupabaseClient;
    roomId: number;

    constructor(roomId: number) {
        this.supabase = createClient();
        if (!roomId) {
            throw new Error('Room ID is required');
        }
        this.roomId = roomId;
    }

    async getRoom(): Promise<Room | null> {
        const { data: room, error } = await this.supabase
            .from('Rooms')
            .select('*')
            .eq('id', this.roomId)
            .single();

        if (error) {
            console.error('Error fetching room', error);
            return null;
        }

        return room;
    }

    async getUsers() {
        const { data: users, error } = await this.supabase
            .from('UsersOnRooms')
            .select('*, user:Users(*)')
            .eq('room_id', this.roomId);

        if (error) {
            console.error('Error fetching members', error);
            return [];
        }

        return users
            .map(({ user, active }) => ({ ...user, active }))
            .filter(user => user) as UserWithActivity[];
    }

    async getStory() {
        const { data } = await this.supabase
            .from('StoriesOnRooms')
            .select(`
                *,
                story:Stories (
                  *,
                  users:UsersOnStories(*)
                )
             `)
            .eq('room_id', this.roomId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (Array.isArray(data?.story)) {
            return data?.story?.[0] || null;
        }

        return data?.story || null;
    }

    async getUsersOnStory(storyId: number) {
        const { data: usersOnStory, error } = await this.supabase
            .from('UsersOnStories')
            .select('*')
            .eq('story_id', storyId);

        if (error) {
            console.error('Error fetching users on story', error);
            return [];
        }

        return usersOnStory;
    }

    async getUser(userId: number) {
        const { data: user, error } = await this.supabase
            .from('Users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user', error);
            return null;
        }

        return user;
    }

    async getMember(userId: number) {
        const { data, error } = await this.supabase
            .from('UsersOnRooms')
            .select('*, user:Users(*)')
            .eq('room_id', this.roomId)
            .eq('public_user_id', userId)
            .single();

        if (error) {
            console.error('Error fetching member', error);
            return null;
        }

        return { ...data.user, active: !!data.active } as UserWithActivity;
    }

    async startStory(storyId: number) {
        return this.supabase
            .from('Stories')
            .update({ id: storyId, started_at: formatISO(new Date()) })
            .eq('id', storyId);
    }

    async nextStory(oldStory: Story, nextStoryIndex: number) {
        const { data, error } = await this.supabase
            .from('Stories')
            .insert({
                title: `Story ${nextStoryIndex}`,
                user_id: oldStory.user_id,
                public_user_Id: oldStory?.public_user_Id,
            })
            .select()
            .single();

        if (error) {
            console.log('Error creating new story', error);
            return null;
        }

        return this.supabase
            .from('StoriesOnRooms')
            .insert({
                room_id: this.roomId,
                story_id: data.id,
                user_id: oldStory.user_id,
            })
            .select()
            .single();
    }

    async stopStory(storyId: number) {
        return this.supabase
            .from('Stories')
            .update({ id: storyId, finished_at: formatISO(new Date()) })
            .eq('id', storyId);
    }

    async selectTime(storyId: number, userId: number, value: number) {
        return this.supabase
            .from('UsersOnStories')
            .upsert({
                story_id: storyId,
                public_user_id: userId,
                value,
            });
    }

    async changeUserActivity(userId: number, active: boolean) {
        return this.supabase
            .from('UsersOnRooms')
            .update({ active })
            .eq('room_id', this.roomId)
            .eq('public_user_id', userId);
    }

    async removeUserFromRoom(userId: number) {
        return this.supabase
            .from('UsersOnRooms')
            .delete()
            .eq('room_id', this.roomId)
            .eq('public_user_id', userId);
    }

    async getStoriesCount(): Promise<number> {
        const { error, count } = await this.supabase
            .from('StoriesOnRooms')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', this.roomId)
        if (error) {
            console.error('Error fetching stories count', error);
            return 0;
        }

        return count || 0;
    }
}
