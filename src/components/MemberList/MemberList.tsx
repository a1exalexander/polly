'use client';

import { VoteValuesType, VoteValuesTypes } from '@/constants/VoteValues';
import { UserWithActivity, UserWithVote } from '@/types';
import { isNumber } from '@/utils/isNumber';
import clsx from 'clsx';
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

    const progress = useMemo(() => {
        if (!amount) {
            return '0%';
        }
        return `${voted / amount * 100}%`;
    }, [amount, voted]);

    const sortedMembers = useMemo(
        () => [...(members ?? [])].sort((a, b) => {
            // Owners, admins, and active voters stay on top; inactive spectators
            // (who are neither owner nor admin) sink to the bottom.
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

    const yesAmount = members?.filter(({ active, value }) => value === 1 && active)?.length;
    const noAmount = members?.filter(({ active, value }) => value === 0 && active)?.length;

    return (
        <div
            className={clsx(styles.list, {
                [styles.visible]: isHostInProgress && visibility.value,
                [styles.isHost]: canManage,
                [styles.isFinished]: isFinished,
            }, className)}
        >
            <div
                className={clsx(
                    styles.status,
                    {
                        [styles.isVisible]: inProgress || isFinished,
                        [styles.result]: isFinished,
                    },
                )}
            >
                <div
                    style={{ width: progress }}
                    className={styles.progress}
                />
                {inProgress && <span className={styles.progressValue}>{voted}/{amount}</span>}
                {isFinished && roomType !== VoteValuesTypes.boolean &&
                    <span className={styles.progressValue}>Average: {average}</span>}
                {isFinished && roomType === VoteValuesTypes.boolean &&
                    <span className={styles.progressValue}>Yes: {yesAmount} | No: {noAmount}</span>}
            </div>

            <div className={styles.container}>
                {isHostInProgress && (
                    <>
                        <button
                            id="toggle-visibility"
                            onClick={visibility.toggle}
                            className={styles.button}
                        >
                            {visibility.value
                                ? <BsFillEyeFill className={styles.buttonIcon} />
                                : <BsFillEyeSlashFill className={styles.buttonIcon} />
                            }
                        </button>
                        <div className={styles.bluredOverlay} />
                    </>
                )}
                {sortedMembers.map(({ id, name, value, active, isAdmin }) => (
                    <Member
                        id={id}
                        onRemoveUser={onRemoveUser}
                        onToggleAdmin={onToggleAdmin}
                        isValueVisible={visibility.value || !inProgress}
                        menuClass={styles.memberMenu}
                        className={styles.item}
                        key={id}
                        isDisabled={!active}
                        isInProgress={inProgress}
                        isCurrentUserHost={isHost}
                        isCurrentUserAdmin={isCurrentUserAdmin}
                        isMemberHost={hostId === id}
                        isMemberAdmin={!!isAdmin}
                        isSelf={currentUserId === id}
                        name={name}
                        value={roomType === VoteValuesTypes.boolean && isNumber(value) ?
                            (value
                                    ? 'Yes'
                                    : 'No'
                            ) : value}
                    />
                ))}
            </div>
        </div>
    );
};
