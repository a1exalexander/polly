import { CreateRoomForm, Footer, Logo, RoomList } from '@/components';
import { createClient } from '@/utils/supabase/server';
import { getAvatarColor, getInitials } from '@/utils/avatar';
import styles from './page.module.css';

export default async function Home() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: publicUser } = await supabase.from('Users').select('*').eq('user_id', String(user?.id)).single();

    const displayName = publicUser?.name && publicUser.name !== 'cat'
        ? publicUser.name
        : null;

    const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
    const avatarUrl = (meta.avatar_url ?? meta.picture) as string | undefined;

    // Lazy backfill: keep avatar_url in sync with the latest provider picture.
    // Wrapped to tolerate environments where the avatar_url migration hasn't run yet.
    if (avatarUrl && publicUser?.id && publicUser.avatar_url !== avatarUrl) {
        try {
            const { error } = await supabase
                .from('Users')
                .update({ avatar_url: avatarUrl })
                .eq('id', publicUser.id);
            if (error && process.env.NODE_ENV !== 'production') {
                console.warn('[avatar backfill skipped]', error.message);
            }
        } catch (e) {
            if (process.env.NODE_ENV !== 'production') {
                console.warn('[avatar backfill threw]', e);
            }
        }
    }

    return (
        <div className={styles.shell}>
            <header className={styles.nav}>
                <div className={styles.brand}>
                    <Logo size={24} aria-hidden />
                    <span>Polly</span>
                </div>
                {displayName && (
                    <div className={styles.greetingRow}>
                        <span className={styles.greeting}>Hi, {displayName} 👋</span>
                        {avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={avatarUrl}
                                alt=""
                                className={styles.avatar}
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <span
                                className={styles.avatar}
                                style={{ background: getAvatarColor(Number(publicUser?.id ?? 0)) }}
                                aria-hidden="true"
                            >
                                {getInitials(displayName)}
                            </span>
                        )}
                    </div>
                )}
            </header>
            <main className={styles.main}>
                <div className={styles.grid}>
                    <CreateRoomForm />
                    <div className={styles.lists}>
                        <RoomList serverUser={publicUser} />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
