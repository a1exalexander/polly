import clsx from 'clsx';
import Link from 'next/link';
import { LuUsers2 } from 'react-icons/lu';
import { HiStatusOnline } from 'react-icons/hi';
import styles from './RoomItem.module.css';

export interface RoomItemProps {
    className?: string;
    roomId: number;
    membersAmount: number;
    onlineAmount: number;
    title: string | null;
}

export const RoomItem = ({ className, title, roomId, membersAmount, onlineAmount }: RoomItemProps) => {
    return (
        <Link
            className={clsx(styles.link, className)}
            href={`/room/${roomId}`}>
            <span className={styles.title}>{title}</span>
            <div className={styles.row}>
                <div className={styles.info}>
                    <span className={styles.infoValue}>{membersAmount}</span>
                    <LuUsers2 className={styles.infoIcon} />
                </div>
                <div className={clsx(styles.online, { [styles.offline]: !onlineAmount })}>
                    <span className={styles.onlineValue}>{onlineAmount}</span>
                    <HiStatusOnline className={styles.onlineIcon} />
                </div>
            </div>

        </Link>
    );
};
