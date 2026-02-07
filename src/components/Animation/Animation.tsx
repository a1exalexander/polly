import React from 'react';
import styles from './Animation.module.css';

export interface AnimationProps {
    text?: string;
}

export function Animation({ text }: AnimationProps) {
    return (
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
                <span className={styles.labelText}>{text}</span>
            </div>
        </div>
    )
}