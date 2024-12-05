import styles from './Loader.module.css';
import clsx from 'clsx';
import { FiLoader } from 'react-icons/fi';

export interface LoaderProps {
    className?: string;
    isOverlay?: boolean;
    size?: 'small' | 'medium' | 'large';
}

export const Loader = ({ className, isOverlay, size = 'medium' }: LoaderProps) => {
    return (
        <span className={clsx(styles.loader, { [styles.isOverlay]: isOverlay }, styles[size], className)}>
            <FiLoader className={styles.icon} />
        </span>
    );
};
