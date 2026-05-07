import { Shimmer } from '@/components';
import clsx from 'clsx';
import styles from './RoomListSkeleton.module.css';

export interface RoomListSkeletonProps {
    /** Number of placeholder rows. Default 4. */
    rows?: number;
    /** Block heading — pass a label so the skeleton matches the section it stands in for. */
    headingWidth?: number;
    /** Whether to render a "Last 5" / "N owned" pill on the right of the heading. */
    showHeadMeta?: boolean;
    className?: string;
}

const NAME_WIDTHS = ['62%', '54%', '70%', '48%', '60%', '52%'];

export const RoomListSkeleton = ({
    rows = 4,
    headingWidth = 140,
    showHeadMeta = true,
    className,
}: RoomListSkeletonProps) => {
    return (
        <div className={clsx(styles.section, className)} aria-hidden="true">
            <div className={styles.head}>
                <Shimmer w={headingWidth} h={20} />
                {showHeadMeta && <Shimmer w={56} h={11} />}
            </div>
            <ul className={styles.list}>
                {Array.from({ length: rows }).map((_, i) => (
                    <li key={i} className={styles.item}>
                        <div className={styles.body}>
                            <Shimmer w={NAME_WIDTHS[i % NAME_WIDTHS.length]} h={16} />
                            <div className={styles.meta}>
                                <Shimmer w={56} h={20} r={999} />
                                <Shimmer w={42} h={14} />
                                {i % 2 === 0 && <Shimmer w={70} h={14} />}
                            </div>
                        </div>
                        <Shimmer w={14} h={14} r={4} />
                    </li>
                ))}
            </ul>
        </div>
    );
};
