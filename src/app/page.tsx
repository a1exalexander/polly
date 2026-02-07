import { CreateRoomForm, Footer, RoomList } from '@/components';
import { createClient } from '@/utils/supabase/server';
import styles from './page.module.css';

export default async function Home() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: publicUser } = await supabase.from('Users').select('*').eq('user_id', String(user?.id)).single();

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <CreateRoomForm />
                <RoomList serverUser={publicUser} />
            </main>
            <Footer />
        </div>
    );
}
