'use server';

import { createClient } from '@/utils/supabase/server';
import { encodedRedirect } from '@/utils/utils';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const signInAction = async () => {
    const supabase = await createClient();
    const headersMap = await headers();

    const referer = headersMap.get('referer');
    const params = String(referer).split('?')[1];
    const { error, data } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${headersMap.get('origin')}/auth/callback?${params}`,
        },
    });

    if (data.url) {
        return redirect(data.url);
    }

    if (error) {
        return encodedRedirect('error', '/sign-in', error.message);
    }
};

export const signOutAction = async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data } = await supabase.from('Users').select('*').eq('user_id', user?.id).single();
        await supabase.from('UsersOnRooms').delete().eq('public_user_id', Number(data?.id));
    }
    await supabase.auth.signOut();
    return redirect('/sign-in');
};

export const createRoomAction = async (formData: FormData) => {
    const supabase = await createClient();
    const title = formData.get('title') as string;
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/sign-in');
    }

    if (!title) {
        return encodedRedirect('error', '/', 'Title is required');
    }

    const publicUser = await supabase
        .from('Users')
        .select('id')
        .eq('user_id', user.id)
        .single();

    const roomResponse = await supabase
        .from('Rooms')
        .insert({ title, user_id: user.id, public_user_id: publicUser?.data?.id })
        .select();

    if (roomResponse.error) {
        return encodedRedirect('error', '/', roomResponse.error.message);
    }

    const id = roomResponse.data?.[0]?.id;

    if (!id) {
        return encodedRedirect('error', '/', 'Room was not created');
    }

    return redirect(`/room/${id}`);
};

export const joinRoomAction = async (roomId: string) => {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return encodedRedirect('redirect_to', '/sign-in', `/room/${roomId}`);
    }

    const [publicUserResponse, userOnRoomResponse, storiesResponse] = await Promise.all([
        supabase
            .from('Users')
            .select('*')
            .eq('user_id', user.id)
            .single(),
        supabase.from('UsersOnRooms')
            .select('*, user:Users(*)')
            .eq('room_id', Number(roomId))
            .eq('user_id', user.id)
            .single(),
        supabase.from('StoriesOnRooms')
            .select('*')
            .eq('room_id', Number(roomId))
            .order('created_at', { ascending: false })
            .limit(1)
            .single(),
    ]);

    const extraPromises = [];

    if (publicUserResponse.error) {
        return encodedRedirect('error', '/sign-in', publicUserResponse.error.message);
    }

    const isCurrentUserInRoom = userOnRoomResponse.data;

    if (!isCurrentUserInRoom) {
        extraPromises.push(supabase
            .from('UsersOnRooms')
            .upsert({
                public_user_id: publicUserResponse.data.id,
                room_id: Number(roomId),
                user_id: user.id,
                active: true,
            })
            .select());
    }

    if (!storiesResponse.data) {
        const { data } = await supabase
            .from('Stories')
            .insert({
                public_user_Id: publicUserResponse.data.id,
                user_id: user.id,
                title: 'Story 1',
            })
            .select()
            .single();

        if (data) {
            extraPromises.push(supabase
                .from('StoriesOnRooms')
                .insert({
                    room_id: Number(roomId),
                    story_id: data.id,
                    user_id: user.id,
                }));
            extraPromises.push(supabase
                .from('UsersOnStories')
                .upsert({
                    public_user_id: publicUserResponse.data.id,
                    story_id: data.id,
                    value: null,
                }));
        }
    }

    const extraResponses = await Promise.all(extraPromises);

    if (extraResponses.some((response) => response.error)) {
        return encodedRedirect(
            'error',
            '/',
            extraResponses.find((response) => response.error)?.error?.message || 'Error joining room',
        );
    }

    return { serverUser: publicUserResponse.data };
};
