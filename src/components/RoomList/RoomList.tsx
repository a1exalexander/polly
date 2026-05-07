'use client';

import { RoomItem, RoomListSkeleton } from '@/components';
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
                    .from('RecentlyVisitedRooms')
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

    if (loading.value) {
        return (
            <>
                <RoomListSkeleton headingWidth={160} rows={3} />
                <RoomListSkeleton headingWidth={120} rows={4} />
            </>
        );
    }

    return (
        <>
            {!isRecentlyVisitedEmpty && (
                <div className={styles.section}>
                    <div className={styles.head}>
                        <h3 className={styles.label}>Recently visited</h3>
                        <span className={styles.headMeta}>Last 5</span>
                    </div>
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

            <div className={styles.section}>
                <div className={styles.head}>
                    <h3 className={styles.label}>My rooms</h3>
                    {!isRoomsEmpty && (
                        <span className={styles.headMeta}>{state.rooms?.length} owned</span>
                    )}
                </div>
                <div className={styles.content}>
                    {isRoomsEmpty ? (
                        <div className={styles.empty}>No rooms yet</div>
                    ) : (
                        <ul id="room-list" className={clsx(styles.list, className)}>
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
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
};
