import clsx from 'clsx';
import { CSSProperties } from 'react';
import styles from './Shimmer.module.css';

export interface ShimmerProps {
    /** Width — number → px, string → as-is (e.g. "60%"). Default 100%. */
    w?: number | string;
    /** Height — number → px, string → as-is. Default 14. */
    h?: number | string;
    /** Border radius in px. Default 8. Pass 999 for pills, 50 for circles (use a square shape). */
    r?: number;
    className?: string;
    style?: CSSProperties;
}

const toSize = (v: number | string | undefined): string | undefined => {
    if (v === undefined) return undefined;
    return typeof v === 'number' ? `${v}px` : v;
};

export const Shimmer = ({ w = '100%', h = 14, r = 8, className, style }: ShimmerProps) => {
    return (
        <span
            aria-hidden="true"
            className={clsx(styles.shimmer, className)}
            style={{
                width: toSize(w),
                height: toSize(h),
                borderRadius: r,
                ...style,
            }}
        />
    );
};
