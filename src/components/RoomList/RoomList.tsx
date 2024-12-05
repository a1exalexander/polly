'use client';

import { Loader, RoomItem } from '@/components';
import { realtime } from '@/components/RoomList/RoomList.realtime';
import { Room, UserOnRoom } from '@/types';
import { ActionTypes, createInitialState, getters, reducer } from './RoomList.store';
import { createClient } from '@/utils/supabase/client';
import clsx from 'clsx';
import { useEffect, useMemo, useReducer } from 'react';
import { useBoolean } from 'usehooks-ts';
import styles from './RoomList.module.css';

interface RoomListProps {
    className?: string;
    serverRooms: Room[];
    serverUsersOnRooms: UserOnRoom[];
}

export const RoomList = ({ className, serverRooms, serverUsersOnRooms }: RoomListProps) => {
    const loading = useBoolean(true);
    const [state, dispatch] = useReducer(
        reducer,
        {
            usersOnRooms: serverUsersOnRooms,
            rooms: serverRooms
        },
        createInitialState
    );

    useEffect(() => {
        const supabase = createClient();

        const getRooms = async () => {
            loading.setTrue();
            const [rooms, usersOnRooms] = await Promise.all([
                supabase.from('Rooms').select('*'),
                supabase.from('UsersOnRooms').select('*')
            ]);
            dispatch({ type: ActionTypes.ROOMS_FETCHED, payload: rooms.data as Room[] });
            dispatch({ type: ActionTypes.USER_ON_ROOMS_FETCHED, payload: usersOnRooms.data as UserOnRoom[] });
            loading.setFalse();
        };
        getRooms();

        const channel = realtime(supabase.channel('realtime rooms'), dispatch);

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isRoomsEmpty = useMemo(() => getters.isRoomsEmpty(state), [state]);

    return (
        <div>
            <p className={styles.label}>Rooms</p>
            <div className={styles.content}>
                {loading.value && <Loader isOverlay />}
                {!loading.value && isRoomsEmpty && <div className={styles.empty}>No rooms yet</div>}
                {!loading.value && !isRoomsEmpty && <ul className={clsx(styles.list, className)}>
                    {state.rooms?.map(({ id, title }) => {
                        const UsersOnRooms = getters.getUsersOnRoom(state, id);
                        return (
                            <li className={styles.item} key={id}>
                                <RoomItem
                                    roomId={id}
                                    title={title}
                                    membersAmount={UsersOnRooms?.length}
                                    onlineAmount={UsersOnRooms?.filter(({ active }) => !!active).length} />
                            </li>
                        )
                    })}
                </ul>}
            </div>
        </div>
    );
};
