import type { Metadata } from 'next';
import { FcGoogle } from "react-icons/fc";
import { FiUsers, FiClock, FiZap } from "react-icons/fi";
import { Button } from '@/components';
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

export default async function Start() {
    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <h1 className={styles.logo}>Polly</h1>
                <p className={styles.tagline}>
                    Real-time planning poker for agile teams.
                    Estimate tasks together, make decisions faster.
                </p>
            </section>

            {/* Animated Illustration */}
            <div className={styles.illustration} aria-hidden="true">
                <div className={styles.cardsContainer}>
                    <div className={`${styles.card} ${styles.card1}`}>
                        <span className={styles.cardValue}>3</span>
                    </div>
                    <div className={`${styles.card} ${styles.card2}`}>
                        <span className={styles.cardValue}>5</span>
                    </div>
                    <div className={`${styles.card} ${styles.card3}`}>
                        <span className={styles.cardValue}>8</span>
                    </div>
                    <div className={`${styles.card} ${styles.card4}`}>
                        <span className={styles.cardValue}>?</span>
                    </div>
                </div>
                <div className={styles.dots}>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                </div>
            </div>

            <section className={styles.features}>
                <article className={`${styles.feature} ${styles.featureBlue}`}>
                    <div className={styles.featureIcon}>
                        <FiUsers aria-hidden="true" />
                    </div>
                    <h2 className={styles.featureTitle}>Team Collaboration</h2>
                    <p className={styles.featureDescription}>
                        Vote simultaneously with your team members in real-time
                    </p>
                </article>

                <article className={`${styles.feature} ${styles.featureGreen}`}>
                    <div className={styles.featureIcon}>
                        <FiClock aria-hidden="true" />
                    </div>
                    <h2 className={styles.featureTitle}>Flexible Estimation</h2>
                    <p className={styles.featureDescription}>
                        Choose from days, weeks, or simple yes/no voting scales
                    </p>
                </article>

                <article className={`${styles.feature} ${styles.featureOrange}`}>
                    <div className={styles.featureIcon}>
                        <FiZap aria-hidden="true" />
                    </div>
                    <h2 className={styles.featureTitle}>Instant Results</h2>
                    <p className={styles.featureDescription}>
                        See votes revealed instantly when everyone has voted
                    </p>
                </article>
            </section>

            <section className={styles.cta}>
                <form className={styles.ctaForm}>
                    <Button
                        icon={<FcGoogle />}
                        type="submit"
                        formAction={signInAction}>
                        Get Started with Google
                    </Button>
                </form>
                <p className={styles.ctaHint}>Free to use</p>
            </section>

            <footer className={styles.footer}>
                <p>&copy; {new Date().getFullYear()} Polly &ndash; Planning Poker for Agile Teams</p>
            </footer>
        </div>
    );
}
