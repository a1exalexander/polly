'use server';

import { RoomList, CreateRoomForm, Footer } from '@/components';
import { Room, UserOnRoom } from '@/types';
import { createClient } from '@/utils/supabase/server';
import styles from './page.module.css';

export default async function Home() {
    const supabase = await createClient();
    const [{data: serverRooms}, {data: serverUsersOnRooms}] = await Promise.all([
        supabase.from('Rooms').select('*'),
        supabase.from('UsersOnRooms').select('*')
    ]);

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <CreateRoomForm />
                <RoomList serverUsersOnRooms={serverUsersOnRooms as UserOnRoom[]} serverRooms={serverRooms as Room[]} />
            </main>
            <Footer />
        </div>
    );
}
