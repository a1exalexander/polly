import { Logo, Shimmer } from '@/components';
import styles from './RoomPageSkeleton.module.css';

const MEMBER_NAME_WIDTHS = ['62%', '74%', '55%', '80%', '60%', '70%', '58%', '76%'];

export const RoomPageSkeleton = () => {
    return (
        <div className={styles.shell} aria-hidden="true">
            <header className={styles.nav}>
                <div className={styles.navLeft}>
                    <span className={styles.brand}>
                        <Logo size={24} />
                        <span>Polly</span>
                    </span>
                    <span className={styles.sep}>/</span>
                    <div className={styles.titleBlock}>
                        <Shimmer w={220} h={16} />
                        <div className={styles.titleMeta}>
                            <Shimmer w={56} h={20} r={999} />
                            <Shimmer w={140} h={20} r={999} />
                        </div>
                    </div>
                </div>
                <div className={styles.navRight}>
                    <div className={styles.statusBlock}>
                        <Shimmer w={160} h={14} />
                        <Shimmer w={120} h={12} />
                    </div>
                    <Shimmer w={120} h={38} r={999} />
                    <Shimmer w={38} h={38} r={999} />
                    <Shimmer w={38} h={38} r={999} />
                </div>
            </header>

            <div className={styles.body}>
                <main className={styles.voteArea}>
                    <div className={styles.voteAreaInner}>
                        <div className={styles.hero}>
                            <div className={styles.spinner}>
                                <span />
                                <span />
                                <span />
                            </div>
                            <div className={styles.heroTitle}>Room is loading…</div>
                            <div className={styles.heroSub}>
                                Syncing votes, members, and the current story.
                            </div>
                        </div>

                        <div className={styles.cardGrid}>
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className={styles.cardCell}>
                                    <div className={styles.cardSkel} />
                                    <div className={styles.subRow}>
                                        <Shimmer w={28} h={14} r={999} />
                                        <Shimmer w={28} h={14} r={999} />
                                        <Shimmer w={28} h={14} r={999} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                <aside className={styles.members}>
                    <div className={styles.membersHead}>
                        <div className={styles.membersHeading}>
                            <Shimmer w={70} h={11} />
                            <Shimmer w={140} h={20} />
                        </div>
                        <Shimmer w={36} h={36} r={999} />
                    </div>
                    <Shimmer w="100%" h={8} r={999} />
                    <div className={styles.memberList}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className={styles.memberRow}>
                                <Shimmer w={36} h={36} r={999} />
                                <div className={styles.memberName}>
                                    <Shimmer w={MEMBER_NAME_WIDTHS[i % MEMBER_NAME_WIDTHS.length]} h={14} />
                                </div>
                                <Shimmer w={32} h={28} r={999} />
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
};
