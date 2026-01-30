'use client';

import { useTheme } from '@/components/ThemeProvider';
import styles from './ThemeSwitch.module.css';

export function ThemeSwitch() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            className={styles.switch}
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <span className={styles.track} data-theme={theme}>
                <span className={styles.thumb}>
                    <span className={styles.icon}>
                        {isDark ? '🌙' : '☀️'}
                    </span>
                </span>
            </span>
        </button>
    );
}
