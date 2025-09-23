import { Tag } from '@/components';
import { tagTypesByVoteType, VoteValuesType, VoteValuesTypes } from '@/constants/VoteValues';
import clsx from 'clsx';
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
}

export const RoomItem = ({ className, title, roomId, membersAmount, onlineAmount, type }: RoomItemProps) => {
    return (
        <Link
            className={clsx(styles.link, className)}
            href={`/room/${roomId}`}>
            <span className={styles.title}>{title}</span>
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
