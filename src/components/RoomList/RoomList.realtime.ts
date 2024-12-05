import { Room, UserOnRoom } from '@/types';
import { ActionTypes, DispatchType } from './RoomList.store';
import { RealtimeChannel } from '@supabase/realtime-js';

export const realtime = (channel: RealtimeChannel, dispatch: DispatchType)=> {
    return channel
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'Rooms' },
            (payload) => {
                dispatch({ type: ActionTypes.ROOM_CREATED, payload: payload.new as Room });
            },
        )
        .on(
            'postgres_changes',
            { event: 'DELETE', schema: 'public', table: 'Rooms' },
            (payload) => {
                dispatch({ type: ActionTypes.ROOM_DELETED, payload: payload.old as Room });
            },
        )
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'Rooms' },
            (payload) => {
                dispatch({ type: ActionTypes.ROOM_UPDATED, payload: payload.new as Room });
            },
        )
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'UsersOnRooms' },
            (payload) => {
                dispatch({ type: ActionTypes.USER_ON_ROOM_CREATED, payload: payload.new as UserOnRoom });
            },
        )
        .on(
            'postgres_changes',
            { event: 'DELETE', schema: 'public', table: 'UsersOnRooms' },
            (payload) => {
                dispatch({ type: ActionTypes.USER_ON_ROOM_DELETED, payload: payload.old as UserOnRoom });
            },
        )
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'UsersOnRooms' },
            (payload) => {
                dispatch({ type: ActionTypes.USER_ON_ROOM_UPDATED, payload: payload.new as UserOnRoom });
            },
        )
        .subscribe()
}
