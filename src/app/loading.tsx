import { Footer, Logo, RoomListSkeleton, Shimmer } from '@/components';
import styles from './loading.module.css';

export default function DashboardLoading() {
    return (
        <div className={styles.shell} aria-busy="true">
            <header className={styles.nav}>
                <div className={styles.brand}>
                    <Logo size={24} aria-hidden />
                    <span>Polly</span>
                </div>
                <div className={styles.greetingRow}>
                    <Shimmer w={60} h={14} />
                    <Shimmer w={32} h={32} r={999} />
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.grid}>
                    <section className={styles.createCard}>
                        <Shimmer w={70} h={11} />
                        <Shimmer w="75%" h={28} />
                        <Shimmer w="95%" h={14} />
                        <Shimmer w={50} h={11} style={{ marginTop: 12 }} />
                        <Shimmer w="100%" h={44} r={14} />
                        <Shimmer w={120} h={11} style={{ marginTop: 12 }} />
                        <Shimmer w="100%" h={50} r={14} />
                        <Shimmer w="100%" h={50} r={14} />
                        <Shimmer w="100%" h={50} r={14} />
                        <Shimmer w="100%" h={48} r={999} style={{ marginTop: 12 }} />
                    </section>

                    <section className={styles.lists}>
                        <RoomListSkeleton headingWidth={160} rows={3} />
                        <RoomListSkeleton headingWidth={120} rows={4} />
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
