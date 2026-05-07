'use client';

import { signOutAction } from '@/app/actions';
import { Button, SoundToggle, ThemeToggle } from '@/components';
import styles from './Footer.module.css';

export interface FooterProps {
    /** Hide the sound toggle on pages where sound playback is irrelevant. */
    showSound?: boolean;
}

export const Footer = ({ showSound = true }: FooterProps) => {
    return (
        <footer className={styles.footer}>
            <span className={styles.copy}>© {new Date().getFullYear()} Polly</span>
            <div className={styles.row}>
                <ThemeToggle />
                {showSound && <SoundToggle />}
                <form>
                    <Button
                        variant="ghost"
                        size="s"
                        formAction={signOutAction}>
                        Sign out
                    </Button>
                </form>
            </div>
        </footer>
    );
};
