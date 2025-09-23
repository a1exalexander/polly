'use client';

import { Loader, RoomItem } from '@/components';
import { realtime } from '@/components/RoomList/RoomList.realtime';
import { Room, User, UserOnRoom } from '@/types';
import { createClient } from '@/utils/supabase/client';
import clsx from 'clsx';
import { useEffect, useMemo, useReducer } from 'react';
import { useBoolean } from 'usehooks-ts';
import styles from './RoomList.module.css';
import { ActionTypes, createInitialState, getters, reducer } from './RoomList.store';

interface RoomListProps {
    className?: string;
    serverUser: User | null;
}

export const RoomList = ({ className, serverUser }: RoomListProps) => {
    const loading = useBoolean(true);
    const [state, dispatch] = useReducer(
        reducer,
        {
            usersOnRooms: [],
            rooms: [],
            recentlyVisitedRooms: [],
        },
        createInitialState,
    );

    useEffect(() => {
        const supabase = createClient();

        const getRooms = async () => {
            loading.setTrue();
            const [rooms, usersOnRooms, recentlyVisited] = await Promise.all([
                supabase.from('Rooms').select('*').eq('public_user_id', Number(serverUser?.id)),
                supabase.from('UsersOnRooms').select('*'),
                supabase
                    .from('UsersOnRooms')
                    .select(`
                        last_visited_at,
                        room_id,
                        Rooms!inner(
                            id,
                            title,
                            type,
                            created_at,
                            public_user_id,
                            user_id
                        )
                    `)
                    .eq('public_user_id', Number(serverUser?.id))
                    .neq('Rooms.public_user_id', Number(serverUser?.id)) // Exclude owned rooms
                    .order('last_visited_at', { ascending: false })
                    .limit(5),
            ]);
            dispatch({ type: ActionTypes.ROOMS_FETCHED, payload: rooms.data as Room[] });
            dispatch({ type: ActionTypes.USER_ON_ROOMS_FETCHED, payload: usersOnRooms.data as UserOnRoom[] });
            
                        // Transform the recently visited data
            const recentRoomsData = recentlyVisited.data?.map(item => ({
                ...item.Rooms,
                last_visited_at: item.last_visited_at,
            })) || [];
            
            dispatch({ type: ActionTypes.RECENTLY_VISITED_ROOMS_FETCHED, payload: recentRoomsData });
            loading.setFalse();
        };
        getRooms();

        const channel = realtime(supabase.channel('realtime rooms'), dispatch, Number(serverUser?.id));

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isRoomsEmpty = useMemo(() => getters.isRoomsEmpty(state), [state]);
    const isRecentlyVisitedEmpty = useMemo(() => getters.isRecentlyVisitedRoomsEmpty(state), [state]);

    return (
        <div>
            {/* Recently Visited Rooms Section */}
            {!loading.value && !isRecentlyVisitedEmpty && (
                <div className={styles.section}>
                    <p className={styles.label}>Recently Visited</p>
                    <div className={styles.content}>
                        <ul id="recent-rooms-list" className={clsx(styles.list, className)}>
                            {state.recentlyVisitedRooms?.map(({ id, title, type, last_visited_at }) => {
                                const UsersOnRooms = getters.getUsersOnRoom(state, id);
                                return (
                                    <li
                                        className={styles.item}
                                        key={`recent-${id}`}
                                    >
                                        <RoomItem
                                            roomId={id}
                                            title={title}
                                            type={type}
                                            membersAmount={UsersOnRooms?.length || 0}
                                            onlineAmount={UsersOnRooms?.filter(({ active }) => !!active).length || 0}
                                            visitedAt={last_visited_at}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            )}

            {/* Owned Rooms Section */}
            <div className={styles.section}>
                <p className={styles.label}>My Rooms</p>
                <div className={styles.content}>
                    {loading.value && <Loader isOverlay />}
                    {!loading.value && isRoomsEmpty && <div className={styles.empty}>No rooms yet</div>}
                    {!loading.value && !isRoomsEmpty && <ul id="room-list" className={clsx(styles.list, className)}>
                        {state.rooms?.map(({ id, title, type }) => {
                            const UsersOnRooms = getters.getUsersOnRoom(state, id);
                            return (
                                <li
                                    className={styles.item}
                                    key={id}
                                >
                                    <RoomItem
                                        roomId={id}
                                        title={title}
                                        type={type}
                                        membersAmount={UsersOnRooms?.length}
                                        onlineAmount={UsersOnRooms?.filter(({ active }) => !!active).length}
                                    />
                                </li>
                            );
                        })}
                    </ul>}
                </div>
            </div>
        </div>
    );
};
