'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import styles from './SoundToggle.module.css';

const SoundOnIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
    </svg>
);

const SoundOffIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
        <path d="M3 3l18 18" stroke="var(--danger)" />
    </svg>
);

export interface SoundToggleProps {
    className?: string;
}

export function SoundToggle({ className }: SoundToggleProps) {
    const [isSoundOn, setSound] = useLocalStorage('sound-state', true);
    const [mounted, setMounted] = useState(false);

    // localStorage isn't available during SSR — defer until after hydration
    // so the icon and label match between server and client.
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <motion.button
            type="button"
            onClick={() => setSound(!isSoundOn)}
            className={clsx(styles.btn, className)}
            title={isSoundOn ? 'Mute sounds' : 'Unmute sounds'}
            aria-label={isSoundOn ? 'Mute sounds' : 'Unmute sounds'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.18 }}
        >
            {isSoundOn ? <SoundOnIcon /> : <SoundOffIcon />}
        </motion.button>
    );
}
