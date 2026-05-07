import { Tag } from '@/components';
import { tagTypesByVoteType, VoteValuesType, VoteValuesTypes } from '@/constants/VoteValues';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { HiArrowRight } from 'react-icons/hi';
import { LuUsers } from 'react-icons/lu';
import { HiStatusOnline } from 'react-icons/hi';
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
                <div className={styles.metaRow}>
                    <Tag className={styles.tag} type={tagTypesByVoteType[type as VoteValuesType]}>{type || VoteValuesTypes.days}</Tag>
                    <span className={styles.info}>
                        <LuUsers className={styles.infoIcon} />
                        <span className={styles.infoValue}>{membersAmount}</span>
                    </span>
                    {onlineAmount > 0 && (
                        <span className={styles.online}>
                            <HiStatusOnline className={styles.onlineIcon} />
                            <span className={styles.onlineValue}>{onlineAmount} online</span>
                        </span>
                    )}
                    {visitedAt && (
                        <span className={styles.visitDate}>
                            · Visited {formatDistanceToNow(new Date(visitedAt), { addSuffix: true })}
                        </span>
                    )}
                </div>
            </div>
            <HiArrowRight className={styles.arrow} aria-hidden="true" />
        </Link>
    );
};
