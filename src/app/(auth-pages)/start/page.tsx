import type { Metadata } from 'next';
import { FcGoogle } from "react-icons/fc";
import { FiUsers, FiClock, FiZap, FiCheck } from "react-icons/fi";
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
            {/* Background Illustration - Abstract Waves */}
            <div className={styles.backgroundIllustration} aria-hidden="true">
                <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" className={styles.bgSvg}>
                    <defs>
                        <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3443ab" stopOpacity="0.08" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.03" />
                        </linearGradient>
                        <linearGradient id="waveGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#4caf50" stopOpacity="0.06" />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
                        </linearGradient>
                    </defs>

                    {/* Bottom wave */}
                    <path
                        d="M0,600 C320,500 420,700 720,600 C1020,500 1200,650 1440,580 L1440,800 L0,800 Z"
                        fill="url(#waveGrad1)"
                        className={styles.wave1}
                    />

                    {/* Middle wave */}
                    <path
                        d="M0,650 C280,580 520,720 800,650 C1080,580 1280,700 1440,640 L1440,800 L0,800 Z"
                        fill="url(#waveGrad2)"
                        className={styles.wave2}
                    />
                </svg>
            </div>

            <div className={styles.container}>
                {/* Left side - Content */}
                <main className={styles.content}>
                    <header className={styles.hero}>
                        <h1 className={styles.logo}>Polly</h1>
                        <p className={styles.tagline}>
                            Real-time planning poker for agile teams.
                            Estimate tasks together, make decisions faster.
                        </p>
                    </header>

                    <ul className={styles.features}>
                        <li className={styles.feature}>
                            <span className={`${styles.featureIcon} ${styles.iconBlue}`}>
                                <FiUsers aria-hidden="true" />
                            </span>
                            <span className={styles.featureText}>Team Collaboration</span>
                        </li>
                        <li className={styles.feature}>
                            <span className={`${styles.featureIcon} ${styles.iconGreen}`}>
                                <FiClock aria-hidden="true" />
                            </span>
                            <span className={styles.featureText}>Flexible Estimation</span>
                        </li>
                        <li className={styles.feature}>
                            <span className={`${styles.featureIcon} ${styles.iconOrange}`}>
                                <FiZap aria-hidden="true" />
                            </span>
                            <span className={styles.featureText}>Instant Results</span>
                        </li>
                    </ul>

                    <section className={styles.cta}>
                        <form className={styles.ctaForm}>
                            <Button
                                icon={<FcGoogle />}
                                type="submit"
                                formAction={signInAction}>
                                Get Started with Google
                            </Button>
                        </form>
                        <p className={styles.ctaHint}>
                            <FiCheck className={styles.checkIcon} aria-hidden="true" />
                            Free to use &bull; No credit card required
                        </p>
                    </section>
                </main>

                {/* Right side - Illustration */}
                <aside className={styles.illustrationSide} aria-hidden="true">
                    <div className={styles.illustration}>
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
                        <div className={styles.votingLabel}>
                            <span className={styles.dots}>
                                <span className={styles.dot} />
                                <span className={styles.dot} />
                                <span className={styles.dot} />
                            </span>
                            <span className={styles.labelText}>Voting in progress</span>
                        </div>
                    </div>
                </aside>
            </div>

            <footer className={styles.footer}>
                <p>&copy; {new Date().getFullYear()} Polly &ndash; Planning Poker for Agile Teams</p>
            </footer>
        </div>
    );
}
