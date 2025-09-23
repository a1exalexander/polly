import { Tag } from '@/components';
import { tagTypesByVoteType, VoteValuesType, VoteValuesTypes } from '@/constants/VoteValues';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { HiStatusOnline } from 'react-icons/hi';
import { LuUsers } from 'react-icons/lu';
import styles from './RoomItem.module.css';

export interface RoomItemProps {
    className?: string;
    roomId: number;
    type: string | null;
    membersAmount: number;
    onlineAmount: number;
    title: string | null;
    visitedAt?: string | null;
}

export const RoomItem = ({ className, title, roomId, membersAmount, onlineAmount, type, visitedAt }: RoomItemProps) => {
    return (
        <Link
            className={clsx(styles.link, className)}
            href={`/room/${roomId}`}>
            <div className={styles.titleSection}>
                <span className={styles.title}>{title}</span>
                {visitedAt && (
                    <span className={styles.visitDate}>
                        Visited {formatDistanceToNow(new Date(visitedAt), { addSuffix: true })}
                    </span>
                )}
            </div>
            <div className={styles.row}>
                <Tag className={styles.tag} type={tagTypesByVoteType[type as VoteValuesType]}>{type || VoteValuesTypes.days}</Tag>
                <div className={styles.info}>
                    <span className={styles.infoValue}>{membersAmount}</span>
                    <LuUsers className={styles.infoIcon} />
                </div>
                <div className={clsx(styles.online, { [styles.offline]: !onlineAmount })}>
                    <span className={styles.onlineValue}>{onlineAmount}</span>
                    <HiStatusOnline className={styles.onlineIcon} />
                </div>
            </div>

        </Link>
    );
};
