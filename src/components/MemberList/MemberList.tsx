'use client';

import { VoteValuesType, VoteValuesTypes } from '@/constants/VoteValues';
import { UserWithActivity, UserWithVote } from '@/types';
import { isNumber } from '@/utils/isNumber';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import { BsFillEyeFill, BsFillEyeSlashFill } from 'react-icons/bs';
import { useBoolean } from 'usehooks-ts';
import { Member } from '../Member';
import styles from './MemberList.module.css';

export interface MemberListProps {
    className?: string;
    members: (UserWithVote & UserWithActivity)[];
    isHost: boolean;
    currentUserId?: number;
    isCurrentUserAdmin?: boolean;
    roomType?: VoteValuesType;
    hostId?: number;
    inProgress?: boolean;
    roomId: number;
    storyId?: number | null;
    average?: number | null;
    isFinished?: boolean;
    onRemoveUser?: (userId: number) => void | Promise<unknown>;
    onSelfLeave?: () => void;
    onToggleAdmin?: (userId: number, nextIsAdmin: boolean) => void | Promise<unknown>;
}

export const MemberList = ({
    members,
    className,
    isHost,
    hostId,
    inProgress,
    average,
    isFinished,
    onRemoveUser,
    onSelfLeave,
    onToggleAdmin,
    roomType,
    currentUserId,
    isCurrentUserAdmin,
}: MemberListProps) => {
    const visibility = useBoolean(false);

    const canManage = isHost || !!isCurrentUserAdmin;
    const isHostInProgress = canManage && inProgress;

    const voted = useMemo(
        () => members?.filter(({ value, active }) => active && value !== null).length || 0,
        [members],
    );
    const amount = useMemo(
        () => members?.filter(({ active }) => active)?.length || 0,
        [members],
    );

    const progressPct = useMemo(() => {
        if (!amount) return 0;
        return Math.min(100, Math.round((voted / amount) * 100));
    }, [amount, voted]);

    const sortedMembers = useMemo(
        () => [...(members ?? [])].sort((a, b) => {
            const aIsTop = a.id === hostId || a.isAdmin || a.active;
            const bIsTop = b.id === hostId || b.isAdmin || b.active;
            if (aIsTop !== bIsTop) {
                return aIsTop ? -1 : 1;
            }
            const nameA = (a.name ?? '').toLocaleLowerCase();
            const nameB = (b.name ?? '').toLocaleLowerCase();
            return nameA.localeCompare(nameB);
        }),
        [members, hostId],
    );

    const yesAmount = members?.filter(({ active, value }) => value === 1 && active)?.length ?? 0;
    const noAmount = members?.filter(({ active, value }) => value === 0 && active)?.length ?? 0;

    const isBoolean = roomType === VoteValuesTypes.boolean;

    return (
        <div
            className={clsx(styles.list, {
                [styles.visible]: isHostInProgress && visibility.value,
                [styles.isHost]: canManage,
                [styles.isFinished]: isFinished,
            }, className)}
        >
            <div className={styles.head}>
                <div>
                    <div className={styles.title}>{isFinished ? 'Result' : 'Voting now'}</div>
                    <div className={styles.summary}>
                        {isFinished && !isBoolean && (
                            <>Average: <span className={styles.summaryAvg}>{average ?? '—'}</span></>
                        )}
                        {isFinished && isBoolean && (
                            <span className={styles.summarySplit}>
                                Yes: {yesAmount} <span style={{ color: 'var(--ink-4)' }}>·</span> No: {noAmount}
                            </span>
                        )}
                        {!isFinished && <>{voted}/{amount} voted</>}
                    </div>
                </div>
                {isHostInProgress && (
                    <button
                        id="toggle-visibility"
                        type="button"
                        aria-label={visibility.value ? 'Hide votes' : 'Peek at votes'}
                        title={visibility.value ? 'Hide votes' : 'Peek at votes'}
                        onClick={visibility.toggle}
                        className={clsx(styles.peekBtn, { [styles.peekOn]: visibility.value })}
                    >
                        {visibility.value ? <BsFillEyeFill /> : <BsFillEyeSlashFill />}
                    </button>
                )}
            </div>

            <div className={styles.progressTrack}>
                <span className={styles.progress} style={{ width: `${progressPct}%` }} />
            </div>

            <div className={styles.members}>
                <AnimatePresence initial={false}>
                    {sortedMembers.map(({ id, name, value, active, isAdmin, avatar_url }) => (
                        <motion.div
                            key={id}
                            layout
                            initial={{ opacity: 0, y: -6, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -6, height: 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                            <Member
                                id={id}
                                onRemoveUser={onRemoveUser}
                                onSelfLeave={onSelfLeave}
                                onToggleAdmin={onToggleAdmin}
                                isValueVisible={visibility.value || !inProgress}
                                menuClass={styles.memberMenu}
                                isDisabled={!active}
                                isInProgress={inProgress}
                                isCurrentUserHost={isHost}
                                isCurrentUserAdmin={isCurrentUserAdmin}
                                isMemberHost={hostId === id}
                                isMemberAdmin={!!isAdmin}
                                isSelf={currentUserId === id}
                                name={name}
                                avatarUrl={avatar_url}
                                value={isBoolean && isNumber(value) ? (value ? 'Yes' : 'No') : value}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
