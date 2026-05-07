import type { Metadata } from 'next';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { FiCheck, FiClock, FiUsers, FiZap } from 'react-icons/fi';
import { Button, Logo, Tag, ThemeToggle } from '@/components';
import { signInAction } from '../../actions';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Polly - Planning Poker for Agile Teams',
    description: 'Real-time planning poker for agile teams. Estimate tasks together with your team using days, weeks, or simple voting scales. Free and easy to use.',
    keywords: ['planning poker', 'agile', 'scrum', 'estimation', 'team collaboration', 'sprint planning', 'story points'],
    openGraph: {
        title: 'Polly - Planning Poker for Agile Teams',
        description: 'Real-time planning poker for agile teams. Estimate tasks together, make decisions faster.',
        type: 'website',
        locale: 'en_US',
        siteName: 'Polly',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Polly - Planning Poker for Agile Teams',
        description: 'Real-time planning poker for agile teams. Estimate tasks together, make decisions faster.',
    },
    robots: {
        index: true,
        follow: true,
    },
};

const DECK_AVATARS = ['#6b7cff', '#ff8a5c', '#4fa872', '#b388eb', '#5fa8d3'];

export default async function Start() {
    return (
        <div className={styles.shell}>
            <div className={styles.blobs} aria-hidden="true">
                <div className={`${styles.blob} ${styles.blob1}`} />
                <div className={`${styles.blob} ${styles.blob2}`} />
                <div className={`${styles.blob} ${styles.blob3}`} />
            </div>

            <header className={styles.nav}>
                <div className={styles.brand}>
                    <Logo aria-hidden />
                    <span>Polly</span>
                </div>
                <nav className={styles.navLinks}>
                    <Link className={styles.navLink} href="/updates">Updates</Link>
                </nav>
            </header>

            <main className={styles.main}>
                <section className={styles.hero}>
                    <Tag className={styles.eyebrow} type="warning">
                        Free · No credit card · Real-time
                    </Tag>
                    <h1 className={styles.headline}>
                        Estimate together,<br />
                        without the <span className={styles.accent}>guesswork.</span>
                    </h1>
                    <p className={styles.sub}>
                        Polly is a planning poker for distributed teams who think out loud.
                        Spin up a room, pick a scale, and watch the votes land in&nbsp;sync.
                    </p>

                    <form className={styles.cta}>
                        <Button
                            icon={<FcGoogle />}
                            type="submit"
                            variant="primary"
                            formAction={signInAction}>
                            Get Started with Google
                        </Button>
                        <span className={styles.ctaHint}>
                            <FiCheck className={styles.checkIcon} aria-hidden="true" />
                            Free to use · No credit card required
                        </span>
                    </form>

                    <ul className={styles.features}>
                        <li className={styles.feature}>
                            <span className={`${styles.featureIcon} ${styles.iconBlue}`}>
                                <FiUsers aria-hidden="true" />
                            </span>
                            <div>
                                <div className={styles.featureTitle}>Team collab</div>
                                <div className={styles.featureBody}>Share a link. Everyone joins instantly — no install.</div>
                            </div>
                        </li>
                        <li className={styles.feature}>
                            <span className={`${styles.featureIcon} ${styles.iconOrange}`}>
                                <FiZap aria-hidden="true" />
                            </span>
                            <div>
                                <div className={styles.featureTitle}>Flexible scale</div>
                                <div className={styles.featureBody}>Days, weeks, or yes/no. Pick the lens that fits.</div>
                            </div>
                        </li>
                        <li className={styles.feature}>
                            <span className={`${styles.featureIcon} ${styles.iconGreen}`}>
                                <FiClock aria-hidden="true" />
                            </span>
                            <div>
                                <div className={styles.featureTitle}>Instant results</div>
                                <div className={styles.featureBody}>Votes reveal at once. Average, mode, spread — done.</div>
                            </div>
                        </li>
                    </ul>
                </section>

                <aside className={styles.illustrationSide} aria-hidden="true">
                    <div className={styles.deck}>
                        <div className={styles.deckFrame}>
                            <div className={styles.deckHead}>
                                <div className={styles.deckDots}>
                                    <span className={styles.deckDot} />
                                    <span className={styles.deckDot} />
                                    <span className={styles.deckDot} />
                                </div>
                                <span className={styles.deckHeadLabel}>Voting in progress</span>
                            </div>
                            <div className={styles.deckCards}>
                                <div className={`${styles.deckCard} ${styles.deckCard1}`}>3</div>
                                <div className={`${styles.deckCard} ${styles.deckCard2}`}>5</div>
                                <div className={`${styles.deckCard} ${styles.deckCard3}`}>8</div>
                                <div className={`${styles.deckCard} ${styles.deckCard4}`}>?</div>
                            </div>
                            <div className={styles.deckFoot}>
                                <div className={styles.deckAvatars}>
                                    {DECK_AVATARS.map((c, i) => (
                                        <span key={i} className={styles.deckAvatar} style={{ background: c }} />
                                    ))}
                                </div>
                                <span className={styles.deckFootLabel}>5 of 7 voted</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>

            <footer className={styles.foot}>
                <span>© {new Date().getFullYear()} Polly</span>
                <span className={styles.footRight}>
                    <span>Privacy · Terms · Updates</span>
                    <ThemeToggle />
                </span>
            </footer>
        </div>
    );
}
