'use client';

import { useTheme } from '@/components/ThemeProvider';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './ThemeToggle.module.css';

const SunIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" />
    </svg>
);

const MoonIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10z" />
    </svg>
);

export interface ThemeToggleProps {
    className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const themeNext = isDark ? 'light' : 'dark';

    return (
        <motion.button
            type="button"
            onClick={toggleTheme}
            className={clsx(styles.btn, className)}
            title={`Switch to ${themeNext} mode`}
            aria-label={`Switch to ${themeNext} mode`}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.18 }}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={theme}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'inline-flex' }}
                >
                    {isDark ? <SunIcon /> : <MoonIcon />}
                </motion.span>
            </AnimatePresence>
        </motion.button>
    );
}
